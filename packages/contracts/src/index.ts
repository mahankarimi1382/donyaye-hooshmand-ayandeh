import { z } from 'zod';

import type { ApiErrorDetail, ApiErrorResponse } from './common';
import * as common from './common';
import * as tradeCase from './case';
import * as company from './company';
import * as document from './document';
import * as inquiry from './inquiry';
import * as notification from './notification';
import * as quote from './quote';
import * as rfq from './rfq';
import * as track from './track';

export { common, tradeCase, company, document, inquiry, notification, quote, rfq, track };

export {
  CURRENCY_CODES,
  CurrencyCodeSchema,
  INCOTERMS_2020,
  IncotermSchema,
  SEAPORT_INCOTERMS,
  isSeaportIncoterm,
  validateIncotermNamedPlace,
  COUNTRY_CODES,
  CountryCodeSchema,
  MONEY_STRING_PATTERN,
  MoneyStringSchema,
  MoneyWithCurrencySchema,
  IDEMPOTENCY_KEY_PATTERN,
  IdempotencyKeySchema,
  PaginationQuerySchema,
  PaginationMetaSchema,
  createApiResponseSchema,
  createApiPaginatedResponseSchema,
  ApiErrorDetailSchema,
  API_ERROR_CODES,
  ApiErrorCodeSchema,
  ApiErrorResponseSchema,
  apiSuccess,
  apiError,
} from './common';

export type {
  CurrencyCode,
  Incoterm,
  SeaportIncoterm,
  CountryCode,
  MoneyString,
  MoneyWithCurrency,
  PaginationQuery,
  PaginationMeta,
  ApiResponse,
  ApiPaginatedResponse,
  ApiErrorDetail,
  ApiErrorCode,
  ApiErrorResponse,
} from './common';

export {
  E164_PHONE_PATTERN,
  PhoneE164Schema,
  ContactPersonSchema,
  CompanyProfileSchema,
} from './company';

export type { PhoneE164, ContactPerson, CompanyProfile } from './company';

export {
  RFQ_LINE_UNITS,
  RfqLineUnitSchema,
  RFQ_STATUSES,
  RfqStatusSchema,
  QUANTITY_STRING_PATTERN,
  QuantitySchema,
  RfqLineItemSchema,
  FutureDateSchema,
  HoneypotFieldSchema,
  CreateRfqSchema,
  RfqFilterSchema,
  UpdateRfqStatusSchema,
} from './rfq';

export type {
  RfqLineUnit,
  RfqStatus,
  Quantity,
  RfqLineItem,
  FutureDate,
  HoneypotField,
  CreateRfqInput,
  RfqFilter,
  UpdateRfqStatusInput,
} from './rfq';

export {
  HS_CODE_PATTERN,
  HsCodeSchema,
  QuoteLineItemSchema,
  CreateQuoteSchema,
  QUOTE_STATUSES,
  QuoteStatusSchema,
  ApproveQuoteSchema,
  AcceptQuoteSchema,
  ReviseQuoteSchema,
  QUOTE_DECLINE_REASONS,
  QuoteDeclineReasonSchema,
  DeclineQuoteSchema,
  FinalizeQuoteSchema,
  QuoteListFilterSchema,
} from './quote';

export type {
  HsCode,
  QuoteLineItem,
  CreateQuoteInput,
  QuoteStatus,
  ApproveQuoteInput,
  AcceptQuoteInput,
  ReviseQuoteInput,
  QuoteDeclineReason,
  DeclineQuoteInput,
  FinalizeQuoteInput,
  QuoteListFilter,
} from './quote';

export { MarkNotificationsReadSchema } from './notification';

export type { MarkNotificationsReadInput } from './notification';

export {
  DOCUMENT_TYPES,
  DocumentTypeSchema,
  DOCUMENT_CLASSIFICATIONS,
  DocumentClassificationSchema,
  DOCUMENT_MIME_TYPES,
  DocumentMimeTypeSchema,
  MAX_FILE_SIZE_BYTES,
  DOCUMENT_RELATED_ENTITY_TYPES,
  DocumentRelatedEntityTypeSchema,
  DocumentUploadRequestSchema,
  DocumentDownloadResponseSchema,
} from './document';

export type {
  DocumentType,
  DocumentClassification,
  DocumentMimeType,
  DocumentRelatedEntityType,
  DocumentUploadRequest,
  DocumentDownloadResponse,
} from './document';

export {
  SHIPPING_MILESTONES,
  ShipmentMilestoneSchema,
  TRADE_CASE_STATUSES,
  TradeCaseStatusSchema,
  MilestoneAdvanceSchema,
  CASE_CHECKLIST_ITEMS,
  CaseChecklistItemSchema,
  ChecklistToggleSchema,
} from './case';

export type {
  ShipmentMilestone,
  TradeCaseStatus,
  MilestoneAdvanceInput,
  CaseChecklistItem,
  ChecklistToggleInput,
} from './case';

export { INQUIRY_TOPICS, InquiryTopicSchema, CreateInquirySchema } from './inquiry';

export type { InquiryTopic, CreateInquiryInput } from './inquiry';

export { TrackQuerySchema } from './track';

export type { TrackQuery } from './track';

export function formatZodError(error: z.ZodError): ApiErrorDetail[] {
  return error.issues.map((issue) => ({
    path: issue.path.map(String).join('.'),
    code: issue.code,
    message: issue.message,
  }));
}

export function formatZodErrorResponse(
  error: z.ZodError,
  options: { requestId?: string } = {},
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code: 'validation_error',
      message: 'Request validation failed',
      details: formatZodError(error),
      ...(options.requestId === undefined ? {} : { requestId: options.requestId }),
      timestamp: new Date().toISOString(),
    },
  };
}

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: ApiErrorDetail[]; rawError: z.ZodError };

export class ContractValidationError extends Error {
  readonly details: ApiErrorDetail[];

  constructor(details: ApiErrorDetail[]) {
    super(details.map((detail) => `${detail.path || '(root)'}: ${detail.message}`).join('; '));
    this.name = 'ContractValidationError';
    this.details = details;
  }
}

export function validate<S extends z.ZodType>(schema: S, input: unknown): ValidationResult<z.output<S>> {
  const result = schema.safeParse(input);
  if (result.success) return { success: true, data: result.data };
  return { success: false, errors: formatZodError(result.error), rawError: result.error };
}

export function parseOrThrow<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const result = schema.safeParse(input);
  if (!result.success) throw new ContractValidationError(formatZodError(result.error));
  return result.data;
}
