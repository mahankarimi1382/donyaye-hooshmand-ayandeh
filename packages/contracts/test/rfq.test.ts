import { describe, expect, it } from 'vitest';

import { CreateRfqSchema, RfqFilterSchema, RfqLineItemSchema, UpdateRfqStatusSchema } from '../src';

const futureDate = '2099-06-30';

function validRfqDraft() {
  return {
    company: {
      name: 'Arya Polymer Khaleej Fars LLC',
      country: 'AE',
      city: 'Dubai',
    },
    contact: {
      name: 'Sara Ahmadi',
      email: 'sara@aryapolymer.example',
      role: 'Procurement Manager',
    },
    destinationCountry: 'AE',
    destinationCity: 'Jebel Ali',
    incoterm: 'CIF',
    incotermNamedPlace: 'Bandar Abbas',
    targetDeliveryDate: futureDate,
    lines: [
      {
        description: 'HDPE film grade, blow molding',
        quantity: '12500',
        unit: 'kg',
        specifications: 'MFI 0.05, density 0.952',
      },
    ],
    notes: 'Annual contract, monthly shipments.',
    websiteUrlHp: '',
    consentToTerms: true,
  } as const;
}

describe('CreateRfqSchema', () => {
  it('accepts a complete intake payload', () => {
    const result = CreateRfqSchema.safeParse(validRfqDraft());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.lines).toHaveLength(1);
      expect(result.data.incoterm).toBe('CIF');
      expect(result.data.consentToTerms).toBe(true);
    }
  });

  it('rejects a filled honeypot field', () => {
    const result = CreateRfqSchema.safeParse({
      ...validRfqDraft(),
      websiteUrlHp: 'https://spam.example/submit',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'websiteUrlHp')).toBe(true);
    }
  });

  it('demands explicit consent', () => {
    expect(CreateRfqSchema.safeParse({ ...validRfqDraft(), consentToTerms: false }).success).toBe(false);
    const { consentToTerms: _omitted, ...withoutConsent } = validRfqDraft();
    expect(CreateRfqSchema.safeParse(withoutConsent).success).toBe(false);
  });

  it('requires a named port for seaport terms and allows omitting it otherwise', () => {
    expect(CreateRfqSchema.safeParse(validRfqDraft()).success).toBe(true);
    expect(
      CreateRfqSchema.safeParse({ ...validRfqDraft(), incotermNamedPlace: undefined }).success,
    ).toBe(false);
    const exw = { ...validRfqDraft(), incoterm: 'EXW', incotermNamedPlace: undefined };
    expect(CreateRfqSchema.safeParse(exw).success).toBe(true);
    expect(
      CreateRfqSchema.safeParse({ ...validRfqDraft(), incotermNamedPlace: 'A' }).success,
    ).toBe(false);
  });

  it('rejects delivery dates in the past', () => {
    expect(
      CreateRfqSchema.safeParse({ ...validRfqDraft(), targetDeliveryDate: '2020-01-01' }).success,
    ).toBe(false);
    expect(
      CreateRfqSchema.safeParse({ ...validRfqDraft(), targetDeliveryDate: '2099-06-30T09:30:00Z' })
        .success,
    ).toBe(true);
  });

  it('bounds the line items between one and fifty', () => {
    expect(CreateRfqSchema.safeParse({ ...validRfqDraft(), lines: [] }).success).toBe(false);
    const fiftyOne = Array.from({ length: 51 }, () => validRfqDraft().lines[0]);
    expect(CreateRfqSchema.safeParse({ ...validRfqDraft(), lines: fiftyOne }).success).toBe(false);
  });

  it('rejects unknown keys on the strict object', () => {
    expect(CreateRfqSchema.safeParse({ ...validRfqDraft(), isAdmin: true }).success).toBe(false);
  });
});

describe('QuantitySchema via line items', () => {
  const base = {
    description: 'Copper cathode Grade A',
    unit: 'metric_ton',
  } as const;

  it('accepts decimal strings of up to four fraction digits and positive integers', () => {
    expect(RfqLineItemSchema.safeParse({ ...base, quantity: '12.5' }).success).toBe(true);
    expect(RfqLineItemSchema.safeParse({ ...base, quantity: '0.0001' }).success).toBe(true);
    expect(RfqLineItemSchema.safeParse({ ...base, quantity: 40 }).success).toBe(true);
  });

  it('rejects zero, negatives and excess precision', () => {
    expect(RfqLineItemSchema.safeParse({ ...base, quantity: '0' }).success).toBe(false);
    expect(RfqLineItemSchema.safeParse({ ...base, quantity: '-5' }).success).toBe(false);
    expect(RfqLineItemSchema.safeParse({ ...base, quantity: '12.12345' }).success).toBe(false);
    expect(RfqLineItemSchema.safeParse({ ...base, quantity: 12.5 }).success).toBe(false);
    expect(RfqLineItemSchema.safeParse({ ...base, quantity: 0 }).success).toBe(false);
  });

  it('limits specifications to 2000 characters', () => {
    expect(
      RfqLineItemSchema.safeParse({ ...base, quantity: '10', specifications: 'x'.repeat(2000) })
        .success,
    ).toBe(true);
    expect(
      RfqLineItemSchema.safeParse({ ...base, quantity: '10', specifications: 'x'.repeat(2001) })
        .success,
    ).toBe(false);
  });
});

describe('RfqFilterSchema', () => {
  it('accepts a single status, an array of statuses and pagination fields', () => {
    const single = RfqFilterSchema.safeParse({ status: 'quoted', page: '2' });
    expect(single.success).toBe(true);
    const multiple = RfqFilterSchema.safeParse({
      status: ['submitted', 'under_review'],
      sortOrder: 'asc',
    });
    expect(multiple.success).toBe(true);
  });

  it('rejects unknown statuses, bad dates and unknown keys', () => {
    expect(RfqFilterSchema.safeParse({ status: 'archived' }).success).toBe(false);
    expect(RfqFilterSchema.safeParse({ dateFrom: '2025-13-01' }).success).toBe(false);
    expect(RfqFilterSchema.safeParse({ search: 'urea', sortHack: 'x' }).success).toBe(false);
    expect(RfqFilterSchema.safeParse({ search: 'x'.repeat(101) }).success).toBe(false);
  });
});

describe('UpdateRfqStatusSchema', () => {
  it('accepts a target status with optimistic version', () => {
    expect(
      UpdateRfqStatusSchema.safeParse({ targetStatus: 'under_review', expectedVersion: 3 }).success,
    ).toBe(true);
    expect(
      UpdateRfqStatusSchema.safeParse({
        targetStatus: 'rejected',
        reason: 'Outside product basket',
        expectedVersion: 3,
      }).success,
    ).toBe(true);
  });

  it('rejects a missing version, bad statuses and oversized reasons', () => {
    expect(UpdateRfqStatusSchema.safeParse({ targetStatus: 'quoted' }).success).toBe(false);
    expect(
      UpdateRfqStatusSchema.safeParse({ targetStatus: 'quoted', expectedVersion: 0 }).success,
    ).toBe(false);
    expect(
      UpdateRfqStatusSchema.safeParse({
        targetStatus: 'quoted',
        expectedVersion: 1,
        reason: 'x'.repeat(501),
      }).success,
    ).toBe(false);
    expect(
      UpdateRfqStatusSchema.safeParse({ targetStatus: 'archived', expectedVersion: 1 }).success,
    ).toBe(false);
  });
});
