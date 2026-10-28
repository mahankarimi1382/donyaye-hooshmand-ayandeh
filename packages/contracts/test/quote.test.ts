import { describe, expect, it } from 'vitest';

import {
  AcceptQuoteSchema,
  ApproveQuoteSchema,
  CreateQuoteSchema,
  DeclineQuoteSchema,
  HS_CODE_PATTERN,
  QuoteLineItemSchema,
  QUOTE_DECLINE_REASONS,
  ReviseQuoteSchema,
} from '../src';

const futureDate = '2099-06-30';

function validQuoteDraft() {
  return {
    rfqId: 'rfq_01',
    currency: 'USD',
    lines: [
      {
        description: 'Urea 46% prilled, bulk',
        quantity: '500',
        unit: 'metric_ton',
        unitPrice: '410.50',
        lineTotal: '205250',
        hsCode: '3102.10',
        discountPercentage: 0,
      },
    ],
    shippingAmount: '18000',
    insuranceAmount: '850',
    taxAmount: '0',
    discountPercentage: 2.5,
    incoterm: 'CFR',
    incotermNamedPlace: 'Jebel Ali',
    paymentTerms: '30% advance, 70% against copy of B/L',
    leadTimeDays: 21,
    validUntil: futureDate,
  } as const;
}

describe('HS code pattern', () => {
  it('accepts 6 to 10 digit codes and dotted groups', () => {
    expect(HS_CODE_PATTERN.test('090111')).toBe(true);
    expect(HS_CODE_PATTERN.test('09011121')).toBe(true);
    expect(HS_CODE_PATTERN.test('0901112100')).toBe(true);
    expect(HS_CODE_PATTERN.test('3102.10')).toBe(true);
    expect(HS_CODE_PATTERN.test('3102.10.00')).toBe(true);
    expect(HS_CODE_PATTERN.test('3102.10.0001')).toBe(true);
  });

  it('rejects malformed codes', () => {
    expect(HS_CODE_PATTERN.test('3102')).toBe(false);
    expect(HS_CODE_PATTERN.test('09011')).toBe(false);
    expect(HS_CODE_PATTERN.test('09011121000')).toBe(false);
    expect(HS_CODE_PATTERN.test('3102.1')).toBe(false);
    expect(HS_CODE_PATTERN.test('3102.100')).toBe(false);
    expect(HS_CODE_PATTERN.test('abc')).toBe(false);
  });
});

describe('CreateQuoteSchema', () => {
  it('accepts a full draft with totals and logistics terms', () => {
    const result = CreateQuoteSchema.safeParse(validQuoteDraft());
    expect(result.success).toBe(true);
  });

  it('requires a named port for seaport terms', () => {
    const missing = { ...validQuoteDraft(), incotermNamedPlace: undefined };
    expect(CreateQuoteSchema.safeParse(missing).success).toBe(false);
  });

  it('rejects an expired validity date', () => {
    expect(CreateQuoteSchema.safeParse({ ...validQuoteDraft(), validUntil: '2020-01-01' }).success).toBe(
      false,
    );
  });

  it('bounds discount percentage and requires positive lead time', () => {
    expect(CreateQuoteSchema.safeParse({ ...validQuoteDraft(), discountPercentage: 101 }).success).toBe(
      false,
    );
    expect(CreateQuoteSchema.safeParse({ ...validQuoteDraft(), discountPercentage: -1 }).success).toBe(
      false,
    );
    expect(CreateQuoteSchema.safeParse({ ...validQuoteDraft(), leadTimeDays: 0 }).success).toBe(false);
  });

  it('bounds payment terms length and line count', () => {
    expect(CreateQuoteSchema.safeParse({ ...validQuoteDraft(), paymentTerms: 'X' }).success).toBe(false);
    expect(
      CreateQuoteSchema.safeParse({ ...validQuoteDraft(), lines: [] }).success,
    ).toBe(false);
  });
});

describe('QuoteLineItemSchema', () => {
  const base = {
    description: 'Aluminum ingot A7',
    quantity: '120',
    unit: 'metric_ton',
    unitPrice: '2380',
    lineTotal: '285600',
    discountPercentage: 0,
  } as const;

  it('accepts money strings and an optional HS code', () => {
    expect(QuoteLineItemSchema.safeParse(base).success).toBe(true);
    expect(QuoteLineItemSchema.safeParse({ ...base, hsCode: '7601.10' }).success).toBe(true);
  });

  it('rejects non-monetary unit prices and out-of-range discounts', () => {
    expect(QuoteLineItemSchema.safeParse({ ...base, unitPrice: '2,380' }).success).toBe(false);
    expect(QuoteLineItemSchema.safeParse({ ...base, lineTotal: '285600.00001' }).success).toBe(false);
    expect(QuoteLineItemSchema.safeParse({ ...base, discountPercentage: 100 }).success).toBe(true);
    expect(QuoteLineItemSchema.safeParse({ ...base, discountPercentage: 100.5 }).success).toBe(false);
  });
});

describe('quote action schemas', () => {
  it('approves with an optional note', () => {
    expect(ApproveQuoteSchema.safeParse({ quoteId: 'q_01' }).success).toBe(true);
    expect(
      ApproveQuoteSchema.safeParse({ quoteId: 'q_01', approvalNote: 'Within thresholds' }).success,
    ).toBe(true);
    expect(ApproveQuoteSchema.safeParse({}).success).toBe(false);
  });

  it('accepts a quote only with a full signature', () => {
    const valid = AcceptQuoteSchema.safeParse({
      quoteId: 'q_02',
      acceptanceSignature: { name: 'Sara Ahmadi', companyRole: 'Procurement Manager', consentAccepted: true },
      poNumber: 'PO-2026-118',
    });
    expect(valid.success).toBe(true);
    expect(
      AcceptQuoteSchema.safeParse({
        quoteId: 'q_02',
        acceptanceSignature: { name: 'Sara Ahmadi', companyRole: 'Procurement Manager' },
        poNumber: 'PO-2026-118',
      }).success,
    ).toBe(false);
    expect(
      AcceptQuoteSchema.safeParse({
        quoteId: 'q_02',
        acceptanceSignature: { name: 'S', companyRole: 'Procurement Manager', consentAccepted: true },
        poNumber: 'PO-2026-118',
      }).success,
    ).toBe(false);
    expect(
      AcceptQuoteSchema.safeParse({
        quoteId: 'q_02',
        acceptanceSignature: { name: 'Sara Ahmadi', companyRole: 'Procurement Manager', consentAccepted: true },
        poNumber: '',
      }).success,
    ).toBe(false);
  });

  it('requires revision notes of at least five characters', () => {
    expect(ReviseQuoteSchema.safeParse({ quoteId: 'q_03', notes: 'too short' }).success).toBe(true);
    expect(ReviseQuoteSchema.safeParse({ quoteId: 'q_03', notes: 'abc' }).success).toBe(false);
    expect(ReviseQuoteSchema.safeParse({ quoteId: 'q_03', notes: 'x'.repeat(2001) }).success).toBe(false);
  });

  it('restricts decline reasons to the buyer vocabulary', () => {
    expect([...QUOTE_DECLINE_REASONS]).toHaveLength(5);
    for (const reason of QUOTE_DECLINE_REASONS) {
      expect(DeclineQuoteSchema.safeParse({ quoteId: 'q_04', reason }).success).toBe(true);
    }
    expect(DeclineQuoteSchema.safeParse({ quoteId: 'q_04', reason: 'cheaper_elsewhere' }).success).toBe(
      false,
    );
    expect(
      DeclineQuoteSchema.safeParse({ quoteId: 'q_04', reason: 'other', comment: 'x'.repeat(2001) })
        .success,
    ).toBe(false);
  });
});
