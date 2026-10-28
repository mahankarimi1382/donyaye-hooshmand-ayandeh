import { CreateQuoteSchema, QuoteListFilterSchema, validate, apiSuccess } from '@karvan/contracts';

import {
  handleSessionMutation,
  jsonBody,
  mapDomainError,
  newRequestId,
  queryOf,
  resolveActor,
  successMutation,
  unauthorizedFailure,
  validationFailure,
} from '@/lib/api';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  const requestId = newRequestId();
  const actor = await resolveActor();
  if (actor === null) {
    const unauthorized = unauthorizedFailure(requestId);
    return jsonBody(unauthorized.body, unauthorized.status);
  }

  const filterResult = validate(QuoteListFilterSchema, queryOf(request));
  if (!filterResult.success) {
    const invalid = validationFailure(filterResult.rawError, requestId);
    return jsonBody(invalid.body, invalid.status);
  }

  try {
    const items = getStore().listQuotes(actor, filterResult.data);
    return jsonBody(apiSuccess({ items }, requestId), 200);
  } catch (error) {
    const failure = mapDomainError(error, requestId);
    return jsonBody(failure.body, failure.status);
  }
}

export async function POST(request: Request): Promise<Response> {
  return handleSessionMutation(CreateQuoteSchema, request, {
    execute: (input, actor) => successMutation(getStore().createQuoteDraft(actor, input), 201),
  });
}
