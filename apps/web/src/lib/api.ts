import {NextResponse} from 'next/server';
import type {ZodError, ZodType} from 'zod';

import {
  apiError,
  apiSuccess,
  formatZodErrorResponse,
  IdempotencyKeySchema,
  validate,
  type ApiErrorResponse,
  type ApiResponse,
} from '@karvan/contracts';
import {
  ForbiddenDomainActionError,
  InvalidMilestoneAdvanceError,
  InvalidQuoteTransitionError,
  InvalidRfqTransitionError,
  InvalidTradeCaseTransitionError,
} from '@karvan/core';

import {actorFromSession, getSession} from './session';
import {RecordNotFoundError, SnapshotMismatchError, VersionConflictError, getStore} from './store';
import type {ActorContext} from './types';

// The API never trusts client-sent identity fields; the actor is resolved from
// the session cookie server-side, so such fields are stripped before validation.
const CLIENT_ACTOR_KEYS: ReadonlySet<string> = new Set([
  'actor',
  'actorRole',
  'actorUserId',
  'userRole',
  'userId',
  'organizationId',
]);

export function stripActorFields(payload: unknown): unknown {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) return payload;
  const clone: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (CLIENT_ACTOR_KEYS.has(key)) continue;
    clone[key] = value;
  }
  return clone;
}

export async function readJsonBody(request: Request): Promise<{ok: true; body: unknown} | {ok: false}> {
  const raw = await request.text();
  if (raw.trim().length === 0) return {ok: true, body: {}};
  try {
    return {ok: true, body: JSON.parse(raw) as unknown};
  } catch {
    return {ok: false};
  }
}

export function queryOf(request: Request): Record<string, string> {
  const query: Record<string, string> = {};
  for (const [key, value] of new URL(request.url).searchParams.entries()) {
    if (value === '') continue;
    query[key] = value;
  }
  return query;
}

export function newRequestId(): string {
  return crypto.randomUUID();
}

export function jsonBody(body: ApiResponse<unknown> | ApiErrorResponse, status: number): NextResponse {
  return NextResponse.json(body, {status});
}

function failure(
  status: number,
  code: Parameters<typeof apiError>[0],
  message: string,
  requestId: string,
): {status: number; body: ApiErrorResponse} {
  return {status, body: apiError(code, message, undefined, requestId)};
}

export function unauthorizedFailure(requestId: string): {status: number; body: ApiErrorResponse} {
  return failure(401, 'unauthorized', 'A valid session is required for this endpoint.', requestId);
}

function invalidJsonFailure(requestId: string): {status: number; body: ApiErrorResponse} {
  return failure(400, 'validation_error', 'Request body must be valid JSON.', requestId);
}

function invalidIdempotencyKeyFailure(requestId: string): {status: number; body: ApiErrorResponse} {
  return failure(
    400,
    'validation_error',
    'A mutating request requires an Idempotency-Key header of 16 to 128 characters from [A-Za-z0-9_-].',
    requestId,
  );
}

/*
 * Dev runtimes can duplicate workspace module instances (symlinked packages),
 * which breaks `instanceof` for domain error classes. Every domain error also
 * carries a stable `code`, so the mapping falls back to that marker.
 */
function domainErrorCode(error: unknown): string | undefined {
  if (error instanceof ForbiddenDomainActionError) return 'forbidden_domain_action';
  if (error instanceof RecordNotFoundError) return 'not_found';
  if (error instanceof VersionConflictError) return 'version_conflict';
  if (error instanceof InvalidRfqTransitionError) return 'invalid_rfq_transition';
  if (error instanceof InvalidQuoteTransitionError) return 'invalid_quote_transition';
  if (error instanceof InvalidTradeCaseTransitionError) return 'invalid_trade_case_transition';
  if (error instanceof InvalidMilestoneAdvanceError) return 'invalid_milestone_advance';
  if (error instanceof SnapshotMismatchError) return 'snapshot_mismatch';
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as {code: unknown}).code;
    if (typeof code === 'string') return code;
  }
  return undefined;
}

function domainErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'A domain error occurred.';
}

export function mapDomainError(error: unknown, requestId: string): {status: number; body: ApiErrorResponse} {
  const code = domainErrorCode(error);
  const message = domainErrorMessage(error);
  if (error instanceof ForbiddenDomainActionError || code === 'forbidden_domain_action') {
    return failure(403, 'forbidden', message, requestId);
  }
  if (error instanceof RecordNotFoundError || code === 'not_found') {
    return failure(404, 'not_found', message, requestId);
  }
  if (error instanceof VersionConflictError || code === 'version_conflict') {
    return failure(409, 'version_conflict', message, requestId);
  }
  if (
    error instanceof InvalidRfqTransitionError
    || error instanceof InvalidQuoteTransitionError
    || error instanceof InvalidTradeCaseTransitionError
    || error instanceof InvalidMilestoneAdvanceError
    || code === 'invalid_rfq_transition'
    || code === 'invalid_quote_transition'
    || code === 'invalid_trade_case_transition'
    || code === 'invalid_milestone_advance'
  ) {
    return failure(409, 'invalid_transition', message, requestId);
  }
  if (error instanceof SnapshotMismatchError || code === 'snapshot_mismatch') {
    return failure(500, 'internal_error', message, requestId);
  }
  return failure(500, 'internal_error', 'An unexpected error occurred.', requestId);
}

export function validationFailure(error: ZodError, requestId: string): {status: number; body: ApiErrorResponse} {
  return {status: 400, body: formatZodErrorResponse(error, {requestId})};
}

export async function resolveActor(): Promise<ActorContext | null> {
  const session = await getSession();
  return session ? actorFromSession(session) : null;
}

interface MutationResult {
  status: number;
  body: ApiResponse<unknown> | ApiErrorResponse;
}

async function runMutationFlow(
  request: Request,
  options: {
    requireSession: boolean;
    parse: (payload: unknown) => {success: true; data: unknown} | {success: false; error: ZodError};
    execute: (input: unknown, actor: ActorContext | null) => MutationResult;
  },
): Promise<NextResponse> {
  const requestId = newRequestId();

  const keyResult = validate(IdempotencyKeySchema, request.headers.get('idempotency-key'));
  if (!keyResult.success) {
    const invalidKey = invalidIdempotencyKeyFailure(requestId);
    return jsonBody(invalidKey.body, invalidKey.status);
  }
  const idempotencyKey = keyResult.data;

  const store = getStore();
  const replay = store.replayOrBegin(idempotencyKey);
  if (replay) {
    return jsonBody(replay.body as ApiResponse<unknown> | ApiErrorResponse, replay.status);
  }

  const bodyResult = await readJsonBody(request);
  if (!bodyResult.ok) {
    const invalidBody = invalidJsonFailure(requestId);
    store.finish(idempotencyKey, invalidBody.status, invalidBody.body);
    return jsonBody(invalidBody.body, invalidBody.status);
  }

  const actor = await resolveActor();
  if (options.requireSession && actor === null) {
    const unauthorized = unauthorizedFailure(requestId);
    store.finish(idempotencyKey, unauthorized.status, unauthorized.body);
    return jsonBody(unauthorized.body, unauthorized.status);
  }

  const parsed = options.parse(bodyResult.body);
  if (!parsed.success) {
    const invalidPayload = validationFailure(parsed.error, requestId);
    store.finish(idempotencyKey, invalidPayload.status, invalidPayload.body);
    return jsonBody(invalidPayload.body, invalidPayload.status);
  }

  let outcome: MutationResult;
  try {
    outcome = options.execute(parsed.data, actor);
  } catch (error) {
    outcome = mapDomainError(error, requestId);
  }

  store.finish(idempotencyKey, outcome.status, outcome.body);
  return jsonBody(outcome.body, outcome.status);
}

export function handleSessionMutation<T>(
  schema: ZodType<T>,
  request: Request,
  options: {
    idField?: 'quoteId' | 'caseId';
    routeId?: string;
    execute: (input: T, actor: ActorContext) => MutationResult;
  },
): Promise<NextResponse> {
  return runMutationFlow(request, {
    requireSession: true,
    parse: (payload) => {
      let candidate = stripActorFields(payload);
      if (options.idField && options.routeId !== undefined) {
        candidate = {...(candidate as Record<string, unknown>), [options.idField]: options.routeId};
      }
      const result = validate(schema, candidate);
      return result.success ? {success: true, data: result.data} : {success: false, error: result.rawError};
    },
    execute: (input, actor) =>
      actor === null
        ? {status: 500, body: apiError('internal_error', 'Session actor missing.', undefined, newRequestId())}
        : options.execute(input as T, actor),
  });
}

export function handlePublicMutation<T>(
  schema: ZodType<T>,
  request: Request,
  options: {execute: (input: T) => MutationResult},
): Promise<NextResponse> {
  return runMutationFlow(request, {
    requireSession: false,
    parse: (payload) => {
      const result = validate(schema, stripActorFields(payload));
      return result.success ? {success: true, data: result.data} : {success: false, error: result.rawError};
    },
    execute: (input) => options.execute(input as T),
  });
}

export function successMutation(data: unknown, status = 200): MutationResult {
  return {status, body: apiSuccess(data)};
}
