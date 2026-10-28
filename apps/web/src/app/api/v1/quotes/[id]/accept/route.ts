import { AcceptQuoteSchema } from '@karvan/contracts';

import { handleSessionMutation, successMutation } from '@/lib/api';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  return handleSessionMutation(AcceptQuoteSchema, request, {
    idField: 'quoteId',
    routeId: id,
    execute: (input, actor) => successMutation(getStore().acceptQuote(actor, id, input), 201),
  });
}
