import { MilestoneAdvanceSchema } from '@karvan/contracts';

import { handleSessionMutation, successMutation } from '@/lib/api';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  return handleSessionMutation(MilestoneAdvanceSchema, request, {
    idField: 'caseId',
    routeId: id,
    execute: (input, actor) => successMutation(getStore().advanceMilestone(actor, input)),
  });
}
