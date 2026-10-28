import { CreateInquirySchema } from '@karvan/contracts';

import { handlePublicMutation, successMutation } from '@/lib/api';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  return handlePublicMutation(CreateInquirySchema, request, {
    execute: (input) => successMutation(getStore().createInquiry(input), 201),
  });
}
