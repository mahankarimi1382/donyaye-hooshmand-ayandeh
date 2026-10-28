import { z } from 'zod';

import {
  CountryCodeSchema,
  IncotermSchema,
  MoneyStringSchema,
  validateIncotermNamedPlace,
} from './common';
import { CompanyProfileSchema, ContactPersonSchema } from './company';

export const RFQ_LINE_UNITS = [
  'kg',
  'metric_ton',
  'pcs',
  'meter',
  'container_20ft',
  'container_40ft',
] as const;
export type RfqLineUnit = (typeof RFQ_LINE_UNITS)[number];

export const RfqLineUnitSchema = z.enum(RFQ_LINE_UNITS);

export const RFQ_STATUSES = [
  'draft',
  'submitted',
  'under_review',
  'needs_information',
  'qualified',
  'quote_preparation',
  'quoted',
  'accepted',
  'rejected',
  'expired',
  'cancelled',
] as const;
export type RfqStatus = (typeof RFQ_STATUSES)[number];

export const RfqStatusSchema = z.enum(RFQ_STATUSES);

export const QUANTITY_STRING_PATTERN = /^\d+(\.\d{1,4})?$/;

export const QuantitySchema = z.union([
  z
    .string()
    .regex(QUANTITY_STRING_PATTERN, {
      error: 'Quantity must be a positive decimal string with at most 4 fraction digits',
    })
    .refine((value) => Number(value) > 0, { error: 'Quantity must be greater than zero' }),
  z.number().int().positive(),
]);

export type Quantity = z.output<typeof QuantitySchema>;

export const RfqLineItemSchema = z.strictObject({
  description: z.string().trim().min(1).max(1000),
  quantity: QuantitySchema,
  unit: RfqLineUnitSchema,
  specifications: z.string().trim().max(2000).optional(),
  targetPrice: MoneyStringSchema.optional(),
  productId: z.string().trim().min(1).max(64).optional(),
});

export type RfqLineItem = z.output<typeof RfqLineItemSchema>;

export const FutureDateSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => {
    const parsed = new Date(value);
    return !Number.isNaN(parsed.getTime()) && parsed.getTime() > Date.now();
  }, { error: 'Date must parse to a moment in the future' });

export type FutureDate = z.output<typeof FutureDateSchema>;

export const HoneypotFieldSchema = z
  .string()
  .max(0, { error: 'This field must remain empty' });

export type HoneypotField = z.output<typeof HoneypotFieldSchema>;

export const CreateRfqSchema = z
  .strictObject({
    company: CompanyProfileSchema,
    contact: ContactPersonSchema,
    destinationCountry: CountryCodeSchema,
    destinationCity: z.string().trim().min(2).max(100),
    incoterm: IncotermSchema,
    incotermNamedPlace: z.string().trim().max(120).optional(),
    targetDeliveryDate: FutureDateSchema,
    lines: z.array(RfqLineItemSchema).min(1).max(50),
    notes: z.string().trim().max(4000).optional(),
    websiteUrlHp: HoneypotFieldSchema,
    consentToTerms: z.literal(true),
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

export type CreateRfqInput = z.output<typeof CreateRfqSchema>;

const paginationShapeKeys = {
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
};

export const RfqFilterSchema = z.strictObject({
  ...paginationShapeKeys,
  status: z.union([RfqStatusSchema, z.array(RfqStatusSchema)]).optional(),
  search: z.string().trim().max(100).optional(),
  assignedUser: z.string().trim().min(1).max(64).optional(),
  destinationCountry: CountryCodeSchema.optional(),
  dateFrom: z.iso.date().optional(),
  dateTo: z.iso.date().optional(),
});

export type RfqFilter = z.output<typeof RfqFilterSchema>;

export const UpdateRfqStatusSchema = z.strictObject({
  targetStatus: RfqStatusSchema,
  reason: z.string().trim().min(1).max(500).optional(),
  comment: z.string().trim().max(2000).optional(),
  expectedVersion: z.number().int().positive(),
});

export type UpdateRfqStatusInput = z.output<typeof UpdateRfqStatusSchema>;
