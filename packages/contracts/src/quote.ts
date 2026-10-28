import { z } from 'zod';

import {
  CurrencyCodeSchema,
  IncotermSchema,
  MoneyStringSchema,
  validateIncotermNamedPlace,
} from './common';
import { RfqLineItemSchema, RFQ_LINE_UNITS, FutureDateSchema } from './rfq';

export const HS_CODE_PATTERN = /^(\d{6,10}|\d{4}\.\d{2}(\.\d{2,4})?)$/;

export const HsCodeSchema = z
  .string()
  .regex(HS_CODE_PATTERN, { error: 'HS code must be 6 to 10 digits or dotted groups like 8541.10.00' });

export type HsCode = z.output<typeof HsCodeSchema>;

export const QuoteLineItemSchema = z.strictObject({
  description: z.string().trim().min(1).max(1000),
  quantity: RfqLineItemSchema.shape.quantity,
  unit: z.enum(RFQ_LINE_UNITS),
  unitPrice: MoneyStringSchema,
  lineTotal: MoneyStringSchema,
  hsCode: HsCodeSchema.optional(),
  discountPercentage: z.number().min(0).max(100),
  notes: z.string().trim().max(2000).optional(),
  productId: z.string().trim().min(1).max(64).optional(),
});

export type QuoteLineItem = z.output<typeof QuoteLineItemSchema>;

export const CreateQuoteSchema = z
  .strictObject({
    rfqId: z.string().trim().min(1).max(64),
    currency: CurrencyCodeSchema,
    lines: z.array(QuoteLineItemSchema).min(1).max(50),
    shippingAmount: MoneyStringSchema,
    insuranceAmount: MoneyStringSchema,
    taxAmount: MoneyStringSchema,
    discountPercentage: z.number().min(0).max(100),
    incoterm: IncotermSchema,
    incotermNamedPlace: z.string().trim().max(120).optional(),
    paymentTerms: z.string().trim().min(2).max(500),
    leadTimeDays: z.number().int().positive(),
    validUntil: FutureDateSchema,
    productionDays: z.number().int().positive().optional(),
    transitDays: z.number().int().positive().optional(),
    notes: z.string().trim().max(4000).optional(),
  })
  .superRefine((value, ctx) => {
    if (!validateIncotermNamedPlace(value.incoterm, value.incotermNamedPlace)) {
      ctx.addIssue({
        code: 'custom',
        path: ['incotermNamedPlace'],
        message: 'A named port or city of at least 2 characters is required for FOB, CFR and CIF',
      });
    }
  });

export type CreateQuoteInput = z.output<typeof CreateQuoteSchema>;

export const QUOTE_STATUSES = [
  'draft',
  'internal_review',
  'approved',
  'sent',
  'revised',
  'accepted',
  'declined',
  'expired',
] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const QuoteStatusSchema = z.enum(QUOTE_STATUSES);

export const ApproveQuoteSchema = z.strictObject({
  quoteId: z.string().trim().min(1).max(64),
  approvalNote: z.string().trim().max(1000).optional(),
});

export type ApproveQuoteInput = z.output<typeof ApproveQuoteSchema>;

export const AcceptQuoteSchema = z.strictObject({
  quoteId: z.string().trim().min(1).max(64),
  acceptanceSignature: z.strictObject({
    name: z.string().trim().min(2).max(100),
    companyRole: z.string().trim().min(2).max(100),
    consentAccepted: z.literal(true),
  }),
  poNumber: z.string().trim().min(1).max(100),
});

export type AcceptQuoteInput = z.output<typeof AcceptQuoteSchema>;

export const ReviseQuoteSchema = z.strictObject({
  quoteId: z.string().trim().min(1).max(64),
  notes: z.string().trim().min(5).max(2000),
});

export type ReviseQuoteInput = z.output<typeof ReviseQuoteSchema>;

export const QUOTE_DECLINE_REASONS = [
  'price_too_high',
  'lead_time_too_long',
  'project_cancelled',
  'competitor_chosen',
  'other',
] as const;
export type QuoteDeclineReason = (typeof QUOTE_DECLINE_REASONS)[number];

export const QuoteDeclineReasonSchema = z.enum(QUOTE_DECLINE_REASONS);

export const DeclineQuoteSchema = z.strictObject({
  quoteId: z.string().trim().min(1).max(64),
  reason: QuoteDeclineReasonSchema,
  comment: z.string().trim().max(2000).optional(),
});

export type DeclineQuoteInput = z.output<typeof DeclineQuoteSchema>;

export const FinalizeQuoteSchema = z.strictObject({
  quoteId: z.string().trim().min(1).max(64).optional(),
  expectedVersion: z.number().int().positive().optional(),
});

export type FinalizeQuoteInput = z.output<typeof FinalizeQuoteSchema>;

export const QuoteListFilterSchema = z.strictObject({
  rfqId: z.string().trim().min(1).max(64).optional(),
});

export type QuoteListFilter = z.output<typeof QuoteListFilterSchema>;
