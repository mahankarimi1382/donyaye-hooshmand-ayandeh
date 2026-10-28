import { describe, expect, it } from 'vitest';

import {
  DOCUMENT_CLASSIFICATIONS,
  DOCUMENT_MIME_TYPES,
  DOCUMENT_TYPES,
  DocumentDownloadResponseSchema,
  DocumentUploadRequestSchema,
  MAX_FILE_SIZE_BYTES,
} from '../src';

function validUpload() {
  return {
    fileName: 'coa-urea-1405-batch-118.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 512_000,
    classification: 'customer_confidential',
    relatedEntityType: 'quote',
    relatedEntityId: 'q_1405_0001',
  } as const;
}

describe('document vocabularies', () => {
  it('carries the nine trade document types and four classifications', () => {
    expect([...DOCUMENT_TYPES]).toEqual([
      'proforma',
      'coa',
      'bill_of_lading',
      'inspection',
      'coo',
      'customs_declaration',
      'commercial_invoice',
      'lab_assay',
      'packing_list',
    ]);
    expect([...DOCUMENT_CLASSIFICATIONS]).toEqual([
      'public',
      'customer_confidential',
      'internal_commercial',
      'restricted_compliance',
    ]);
    expect([...DOCUMENT_MIME_TYPES]).toHaveLength(5);
    expect(MAX_FILE_SIZE_BYTES).toBe(25 * 1024 * 1024);
  });
});

describe('DocumentUploadRequestSchema', () => {
  it('accepts a bounded office file', () => {
    expect(DocumentUploadRequestSchema.safeParse(validUpload()).success).toBe(true);
    expect(
      DocumentUploadRequestSchema.safeParse({ ...validUpload(), sizeBytes: MAX_FILE_SIZE_BYTES })
        .success,
    ).toBe(true);
  });

  it('rejects path traversal in the file name', () => {
    expect(DocumentUploadRequestSchema.safeParse({ ...validUpload(), fileName: '../invoice.pdf' }).success).toBe(false);
    expect(DocumentUploadRequestSchema.safeParse({ ...validUpload(), fileName: 'docs/secret.pdf' }).success).toBe(false);
    expect(DocumentUploadRequestSchema.safeParse({ ...validUpload(), fileName: 'C:\\temp\\x.pdf' }).success).toBe(false);
    expect(DocumentUploadRequestSchema.safeParse({ ...validUpload(), fileName: '..' }).success).toBe(false);
  });

  it('rejects oversized files and unsupported types', () => {
    expect(
      DocumentUploadRequestSchema.safeParse({ ...validUpload(), sizeBytes: MAX_FILE_SIZE_BYTES + 1 })
        .success,
    ).toBe(false);
    expect(
      DocumentUploadRequestSchema.safeParse({ ...validUpload(), mimeType: 'text/plain' }).success,
    ).toBe(false);
    expect(
      DocumentUploadRequestSchema.safeParse({ ...validUpload(), classification: 'secret' }).success,
    ).toBe(false);
    expect(
      DocumentUploadRequestSchema.safeParse({ ...validUpload(), relatedEntityType: 'case' }).success,
    ).toBe(false);
  });
});

describe('DocumentDownloadResponseSchema', () => {
  it('accepts a signed URL with expiry within a day', () => {
    expect(
      DocumentDownloadResponseSchema.safeParse({
        downloadUrl: 'https://docs.karvan.trade/d/kv-coa-0112?token=abc123',
        expiresInSeconds: 900,
      }).success,
    ).toBe(true);
    expect(
      DocumentDownloadResponseSchema.safeParse({
        downloadUrl: 'https://docs.karvan.trade/d/kv-coa-0112',
        expiresInSeconds: 86400,
      }).success,
    ).toBe(true);
  });

  it('rejects non-URLs and expiry beyond a day', () => {
    expect(
      DocumentDownloadResponseSchema.safeParse({ downloadUrl: 'not-a-url', expiresInSeconds: 60 })
        .success,
    ).toBe(false);
    expect(
      DocumentDownloadResponseSchema.safeParse({
        downloadUrl: 'https://docs.karvan.trade/d/x',
        expiresInSeconds: 86401,
      }).success,
    ).toBe(false);
    expect(
      DocumentDownloadResponseSchema.safeParse({
        downloadUrl: 'https://docs.karvan.trade/d/x',
        expiresInSeconds: 0,
      }).success,
    ).toBe(false);
  });
});
