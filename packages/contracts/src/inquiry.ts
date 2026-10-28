import { z } from 'zod';

import { PhoneE164Schema } from './company';
import { HoneypotFieldSchema } from './rfq';

export const INQUIRY_TOPICS = ['sales', 'procurement', 'logistics', 'compliance', 'partnership'] as const;
export type InquiryTopic = (typeof INQUIRY_TOPICS)[number];

export const InquiryTopicSchema = z.enum(INQUIRY_TOPICS);

export const CreateInquirySchema = z.strictObject({
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  company: z.string().trim().max(200).optional(),
  phone: z.union([PhoneE164Schema, z.literal('')]).optional(),
  topic: InquiryTopicSchema,
  subject: z.string().trim().min(4).max(200),
  message: z.string().trim().min(20).max(4000),
  websiteUrlHp: HoneypotFieldSchema,
  consent: z.literal(true),
});

export type CreateInquiryInput = z.output<typeof CreateInquirySchema>;
