import { MarkNotificationsReadSchema, apiSuccess } from '@karvan/contracts';

import {
  handleSessionMutation,
  jsonBody,
  mapDomainError,
  newRequestId,
  resolveActor,
  successMutation,
  unauthorizedFailure,
} from '@/lib/api';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const requestId = newRequestId();
  const actor = await resolveActor();
  if (actor === null) {
    const unauthorized = unauthorizedFailure(requestId);
    return jsonBody(unauthorized.body, unauthorized.status);
  }

  try {
    const { items, unreadCount } = getStore().listNotifications(actor);
    return jsonBody(apiSuccess({ items, unreadCount }, requestId), 200);
  } catch (error) {
    const failure = mapDomainError(error, requestId);
    return jsonBody(failure.body, failure.status);
  }
}

export async function POST(request: Request): Promise<Response> {
  return handleSessionMutation(MarkNotificationsReadSchema, request, {
    execute: (input, actor) =>
      successMutation({ marked: getStore().markNotificationsRead(actor, input.ids) }),
  });
}
