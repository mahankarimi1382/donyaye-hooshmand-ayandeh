import { TrackQuerySchema, validate, apiSuccess } from '@karvan/contracts';

import { jsonBody, mapDomainError, newRequestId, queryOf, validationFailure } from '@/lib/api';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  const requestId = newRequestId();

  const queryResult = validate(TrackQuerySchema, queryOf(request));
  if (!queryResult.success) {
    const invalid = validationFailure(queryResult.rawError, requestId);
    return jsonBody(invalid.body, invalid.status);
  }

  try {
    const result = getStore().trackRequest(queryResult.data.reference, queryResult.data.email);
    return jsonBody(apiSuccess(result, requestId), 200);
  } catch (error) {
    const failure = mapDomainError(error, requestId);
    return jsonBody(failure.body, failure.status);
  }
}
