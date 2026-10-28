import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  ApiErrorResponseSchema,
  ContractValidationError,
  CreateRfqSchema,
  formatZodError,
  formatZodErrorResponse,
  parseOrThrow,
  validate,
} from '../src';

const validRfq = {
  company: { name: 'Arya Polymer Khaleej Fars LLC', country: 'AE' },
  contact: { name: 'Sara Ahmadi', email: 'sara@aryapolymer.example', role: 'Procurement Manager' },
  destinationCountry: 'AE',
  destinationCity: 'Jebel Ali',
  incoterm: 'CIF',
  incotermNamedPlace: 'Bandar Abbas',
  targetDeliveryDate: '2099-06-30',
  lines: [{ description: 'HDPE film grade', quantity: '12500', unit: 'kg' }],
  websiteUrlHp: '',
  consentToTerms: true,
};

describe('validate', () => {
  it('returns typed data on success', () => {
    const result = validate(z.strictObject({ reference: z.string() }), { reference: 'RFQ-1405-00001' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.reference).toBe('RFQ-1405-00001');
  });

  it('returns flattened issue details plus the raw error on failure', () => {
    const result = validate(CreateRfqSchema, { ...validRfq, websiteUrlHp: 'spam' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toEqual(
        expect.objectContaining({ path: 'websiteUrlHp', code: expect.any(String), message: expect.any(String) }),
      );
      expect(result.rawError).toBeInstanceOf(z.ZodError);
    }
  });
});

describe('parseOrThrow', () => {
  it('returns parsed data on success', () => {
    const data = parseOrThrow(z.strictObject({ n: z.number().int() }), { n: 7 });
    expect(data).toEqual({ n: 7 });
  });

  it('throws ContractValidationError carrying details and a readable message', () => {
    let caught: unknown;
    try {
      parseOrThrow(z.strictObject({ city: z.string().min(2) }), { city: 'A', extra: true });
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(ContractValidationError);
    const details = (caught as ContractValidationError).details;
    expect(details.some((detail) => detail.code === 'unrecognized_keys' && detail.message.includes('extra'))).toBe(true);
    expect(details.some((detail) => detail.path === 'city')).toBe(true);
    expect((caught as Error).message).toContain('extra');
  });
});

describe('formatZodError', () => {
  it('maps zod 4 issues to flat ApiErrorDetail objects with dotted paths', () => {
    const parsed = CreateRfqSchema.safeParse({
      ...validRfq,
      contact: { name: 'S', email: 'bad', role: '' },
      lines: [],
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const details = formatZodError(parsed.error);
      expect(details.every((detail) => typeof detail.path === 'string')).toBe(true);
      expect(details.every((detail) => detail.code.length > 0)).toBe(true);
      expect(details.some((detail) => detail.path === 'contact.name')).toBe(true);
      expect(details.some((detail) => detail.path === 'contact.email')).toBe(true);
      expect(details.some((detail) => detail.path === 'lines')).toBe(true);
    }
  });
});

describe('formatZodErrorResponse', () => {
  it('builds a validation_error envelope parseable by ApiErrorResponseSchema', () => {
    const parsed = CreateRfqSchema.safeParse({ ...validRfq, consentToTerms: false });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const envelope = formatZodErrorResponse(parsed.error, { requestId: 'req-42' });
      expect(envelope.success).toBe(false);
      expect(envelope.error.code).toBe('validation_error');
      expect(envelope.error.message).toBe('Request validation failed');
      expect(envelope.error.details?.length).toBeGreaterThan(0);
      expect(envelope.error.requestId).toBe('req-42');
      expect(envelope.error.timestamp).toEqual(expect.any(String));
      expect(ApiErrorResponseSchema.safeParse(envelope).success).toBe(true);
    }
  });
});
