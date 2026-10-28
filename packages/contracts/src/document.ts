import { z } from 'zod';

export const DOCUMENT_TYPES = [
  'proforma',
  'coa',
  'bill_of_lading',
  'inspection',
  'coo',
  'customs_declaration',
  'commercial_invoice',
  'lab_assay',
  'packing_list',
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DocumentTypeSchema = z.enum(DOCUMENT_TYPES);

export const DOCUMENT_CLASSIFICATIONS = [
  'public',
  'customer_confidential',
  'internal_commercial',
  'restricted_compliance',
] as const;
export type DocumentClassification = (typeof DOCUMENT_CLASSIFICATIONS)[number];

export const DocumentClassificationSchema = z.enum(DOCUMENT_CLASSIFICATIONS);

export const DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
] as const;
export type DocumentMimeType = (typeof DOCUMENT_MIME_TYPES)[number];

export const DocumentMimeTypeSchema = z.enum(DOCUMENT_MIME_TYPES);

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

export const DOCUMENT_RELATED_ENTITY_TYPES = ['rfq', 'quote', 'trade_case'] as const;
export type DocumentRelatedEntityType = (typeof DOCUMENT_RELATED_ENTITY_TYPES)[number];

export const DocumentRelatedEntityTypeSchema = z.enum(DOCUMENT_RELATED_ENTITY_TYPES);

export const DocumentUploadRequestSchema = z.strictObject({
  fileName: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .refine(
      (value) =>
        !value.includes('/') &&
        !value.includes('\\') &&
        !value.includes('..') &&
        !value.includes('\0'),
      { error: 'File name must not contain path separators or traversal segments' },
    ),
  mimeType: DocumentMimeTypeSchema,
  sizeBytes: z.number().int().positive().max(MAX_FILE_SIZE_BYTES),
  classification: DocumentClassificationSchema,
  relatedEntityType: DocumentRelatedEntityTypeSchema,
  relatedEntityId: z.string().trim().min(1).max(64),
});

export type DocumentUploadRequest = z.output<typeof DocumentUploadRequestSchema>;

export const DocumentDownloadResponseSchema = z.strictObject({
  downloadUrl: z.url(),
  expiresInSeconds: z.number().int().min(1).max(86400),
});

export type DocumentDownloadResponse = z.output<typeof DocumentDownloadResponseSchema>;
