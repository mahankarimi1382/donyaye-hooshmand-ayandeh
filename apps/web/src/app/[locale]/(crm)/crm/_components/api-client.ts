'use client';

/*
 * Thin POST helper for CRM console panels. Every mutating call carries an
 * Idempotency-Key (contracts require 16-128 chars of [A-Za-z0-9_-]) and the
 * optimistic-concurrency expectedVersion is supplied by the caller from the
 * rendered record. API envelopes come back as
 * {success:true,data} | {success:false,error:{code,message}}.
 */

export interface ApiFailure {
  status: number;
  code: string;
  message: string;
}

export type ApiResult<T> = {ok: true; data: T} | {ok: false; failure: ApiFailure};

interface Envelope<T> {
  success: boolean;
  data?: T;
  error?: {code: string; message: string};
}

export async function postJson<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'idempotency-key': crypto.randomUUID(),
      },
      body: JSON.stringify(body),
    });
  } catch {
    return {
      ok: false,
      failure: {status: 0, code: 'network_error', message: 'Network request failed.'},
    };
  }

  let envelope: Envelope<T> | null = null;
  try {
    envelope = (await response.json()) as Envelope<T>;
  } catch {
    envelope = null;
  }

  if (!response.ok || !envelope || envelope.success !== true) {
    return {
      ok: false,
      failure: {
        status: response.status,
        code: envelope?.error?.code ?? 'internal_error',
        message: envelope?.error?.message ?? 'Unexpected API response.',
      },
    };
  }
  return {ok: true, data: envelope.data as T};
}
