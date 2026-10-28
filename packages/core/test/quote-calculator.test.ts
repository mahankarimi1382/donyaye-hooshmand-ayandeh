import { describe, expect, it } from 'vitest';
import {
  Money,
  calculateLineTotal,
  calculateQuoteSubtotal,
  calculateQuoteTotal,
  canonicalJsonStringify,
  createQuoteSnapshot,
  requiresManagementApproval,
  sha256,
  verifyQuoteSnapshot,
} from '../src';
import type { QuoteSnapshot, QuoteSnapshotInput } from '../src';

describe('Line totals', () => {
  it('multiplies unit price by quantity', () => {
    const total = calculateLineTotal({ unitPrice: '1250.50', quantity: 3 }, 'USD');
    expect(total.toMinorUnits()).toBe(375150n);
  });

  it('handles fractional quantities exactly', () => {
    const total = calculateLineTotal({ unitPrice: '10.50', quantity: '12.5' }, 'USD');
    expect(total.toMinorUnits()).toBe(13125n);
  });

  it('applies no discount at zero percent', () => {
    const total = calculateLineTotal({ unitPrice: '100.00', quantity: 2, discountPct: 0 }, 'USD');
    expect(total.toMinorUnits()).toBe(20000n);
  });

  it('applies partial discounts', () => {
    const total = calculateLineTotal({ unitPrice: '100.00', quantity: 2, discountPct: 10 }, 'USD');
    expect(total.toMinorUnits()).toBe(18000n);
    const fractional = calculateLineTotal({ unitPrice: '100.00', quantity: 1, discountPct: 12.5 }, 'USD');
    expect(fractional.toMinorUnits()).toBe(8750n);
    const precise = calculateLineTotal(
      { unitPrice: '1085.00', quantity: 24, discountPct: 2.5 },
      'USD',
    );
    expect(precise.toMinorUnits()).toBe(2538900n);
  });

  it('reduces to zero at a full discount', () => {
    const total = calculateLineTotal({ unitPrice: '99.99', quantity: 7, discountPct: 100 }, 'USD');
    expect(total.isZero()).toBe(true);
  });

  it('rounds HALF_EVEN to currency decimals', () => {
    expect(calculateLineTotal({ unitPrice: '0.125', quantity: 1 }, 'USD').toDecimalString()).toBe('0.12');
    expect(calculateLineTotal({ unitPrice: '2.675', quantity: 1 }, 'USD').toDecimalString()).toBe('2.68');
    expect(calculateLineTotal({ unitPrice: '2.665', quantity: 1 }, 'USD').toDecimalString()).toBe('2.66');
  });

  it('rejects discount percentages outside the range', () => {
    expect(() => calculateLineTotal({ unitPrice: '10', quantity: 1, discountPct: -1 }, 'USD')).toThrow(RangeError);
    expect(() => calculateLineTotal({ unitPrice: '10', quantity: 1, discountPct: 100.5 }, 'USD')).toThrow(RangeError);
  });
});

describe('Quote totals', () => {
  const lines = [
    { unitPrice: '1250.50', quantity: 3 },
    { unitPrice: '480.20', quantity: 2, discountPct: 5 },
  ];

  it('sums the line totals as the subtotal', () => {
    const subtotal = calculateQuoteSubtotal(lines, 'USD');
    expect(subtotal.toMinorUnits()).toBe(466388n);
  });

  it('returns zero for an empty quote', () => {
    expect(calculateQuoteSubtotal([], 'USD').isZero()).toBe(true);
  });

  it('adds charges and subtracts the order discount', () => {
    const total = calculateQuoteTotal({
      lines,
      shipping: '50.00',
      insurance: '10.00',
      tax: '25.00',
      discount: '100.00',
      currency: 'USD',
    });
    expect(total.toMinorUnits()).toBe(464888n);
  });

  it('accepts Money values for adjustments', () => {
    const total = calculateQuoteTotal({
      lines: [{ unitPrice: '100.00', quantity: 1 }],
      shipping: Money.from('40', 'USD'),
      currency: 'USD',
    });
    expect(total.toMinorUnits()).toBe(14000n);
  });

  it('clamps negative totals to zero', () => {
    const total = calculateQuoteTotal({
      lines: [{ unitPrice: '10.00', quantity: 1 }],
      discount: '99999.00',
      currency: 'USD',
    });
    expect(total.isZero()).toBe(true);
    expect(total.isNegative()).toBe(false);
    expect(total.toMinorUnits()).toBe(0n);
  });
});

describe('Approval gate', () => {
  it('passes below both thresholds', () => {
    expect(requiresManagementApproval(10, 1000)).toBe(false);
    expect(requiresManagementApproval(0, 50000)).toBe(false);
    expect(requiresManagementApproval(10, 50000)).toBe(false);
  });

  it('trips strictly above either threshold', () => {
    expect(requiresManagementApproval(10.01, 0)).toBe(true);
    expect(requiresManagementApproval(0, 50000.01)).toBe(true);
    expect(requiresManagementApproval(10.01, 50000.01)).toBe(true);
    expect(requiresManagementApproval(25, 100)).toBe(true);
    expect(requiresManagementApproval(0, 75000)).toBe(true);
  });

  it('honors threshold overrides', () => {
    expect(requiresManagementApproval(20, 100000, { discountPct: 25, total: 200000 })).toBe(false);
    expect(requiresManagementApproval(25.01, 0, { discountPct: 25 })).toBe(true);
    expect(requiresManagementApproval(0, 200000.01, { total: 200000 })).toBe(true);
  });
});

describe('Canonical JSON', () => {
  it('sorts keys at every level', () => {
    expect(canonicalJsonStringify({ b: 1, a: 2 })).toBe('{"a":2,"b":1}');
    expect(canonicalJsonStringify({ z: { c: 3, a: 1 }, m: [{ y: 2, x: 1 }] })).toBe(
      '{"m":[{"x":1,"y":2}],"z":{"a":1,"c":3}}',
    );
  });

  it('drops undefined values but keeps null and array order', () => {
    expect(canonicalJsonStringify({ a: 1, b: undefined, c: { d: undefined, e: null } })).toBe(
      '{"a":1,"c":{"e":null}}',
    );
    expect(canonicalJsonStringify([1, undefined, 2])).toBe('[1,null,2]');
    expect(canonicalJsonStringify([{ b: 1, a: 2 }])).toBe('[{"a":2,"b":1}]');
  });

  it('serializes primitives like JSON.stringify', () => {
    expect(canonicalJsonStringify('text')).toBe('"text"');
    expect(canonicalJsonStringify(42)).toBe('42');
    expect(canonicalJsonStringify(true)).toBe('true');
    expect(canonicalJsonStringify(null)).toBe('null');
  });
});

describe('SHA-256', () => {
  it('matches FIPS 180-4 test vectors', () => {
    expect(sha256('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(sha256('hello world')).toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9');
    expect(sha256('The quick brown fox jumps over the lazy dog')).toBe(
      'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592',
    );
  });

  it('encodes UTF-8 multibyte input', () => {
    expect(sha256('کاروان')).toBe('cc7b2a2bd4bd1f8fc1ba226de48b76bd75a71d9750ed0f1b44ee99d2abb3310d');
  });

  it('handles block-boundary padding lengths', () => {
    expect(sha256('a'.repeat(55))).toBe('9f4390f8d30c2dd92ec9f095b65e2b9ae9b0a925a5258e241c9f1e910f734318');
    expect(sha256('a'.repeat(56))).toBe('b35439a4ac6f0948b6d6f9e3c6af0f5f590ce20f1bde7090ef7970686ec6738a');
    expect(sha256('a'.repeat(63))).toBe('7d3e74a05d7db15bce4ad9ec0658ea98e3f06eeecf16b4c6fff2da457ddc2f34');
    expect(sha256('a'.repeat(64))).toBe('ffe054fe7ae0cb6dc65c3af9b61d5209f439851db43d0ba5997337df154668eb');
  });

  it('handles multi-block messages', () => {
    expect(sha256('a'.repeat(1000000))).toBe(
      'cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0',
    );
  });
});

describe('Quote snapshots', () => {
  const createdAt = '2026-01-15T09:30:00.000Z';

  function buildInput(): QuoteSnapshotInput {
    return {
      quoteId: 'quote_1',
      quoteNumber: 'Q-1405-0001',
      rfqId: 'rfq_1',
      rfqReference: 'RFQ-1405-00001',
      version: 1,
      seller: {
        organizationId: 'org_karvan',
        name: 'Karvan International Trading Co. Ltd.',
        country: 'IR',
      },
      buyer: {
        organizationId: 'org_arya_polymer',
        name: 'Arya Polymer Gulf FZE',
        country: 'AE',
        taxNumber: 'TAX-8899',
      },
      lines: [
        {
          id: 'line_1',
          productId: 'prod_hdpe',
          description: 'HDPE film grade F009',
          hsCode: '3901.10',
          unit: 'MT',
          quantity: 24,
          unitPrice: '1085.00',
          discountPct: 2.5,
          lineTotal: '25389.00',
        },
        {
          id: 'line_2',
          productId: 'prod_saffron',
          description: 'Negin saffron, bulk packing',
          hsCode: '0910.20',
          unit: 'KG',
          quantity: 120,
          unitPrice: '2450.00',
          discountPct: 0,
          lineTotal: '294000.00',
        },
      ],
      financials: {
        currency: 'USD',
        subtotal: '319389.00',
        shipping: '1850.00',
        insurance: '640.00',
        tax: '0.00',
        discount: '0.00',
        total: '321879.00',
      },
      incoterms: { code: 'CIF', location: 'Jebel Ali, AE' },
      leadTime: { productionDays: 14, transitDays: 18, totalDays: 32 },
      validUntil: '2026-02-28',
      notes: 'Packing in 25 kg sacks.',
    };
  }

  it('embeds the version, creation time and checksum', () => {
    const snapshot = createQuoteSnapshot(buildInput(), { createdAt });
    expect(snapshot.snapshotVersion).toBe(1);
    expect(snapshot.createdAt).toBe(createdAt);
    expect(snapshot.checksum).toMatch(/^[0-9a-f]{64}$/);
    expect(Object.isFrozen(snapshot)).toBe(true);
  });

  it('verifies an intact snapshot', () => {
    const snapshot = createQuoteSnapshot(buildInput(), { createdAt });
    expect(verifyQuoteSnapshot(snapshot)).toBe(true);
  });

  it('recomputes the checksum over the canonical payload', () => {
    const input = buildInput();
    const snapshot = createQuoteSnapshot(input, { createdAt });
    const payload = { ...input, snapshotVersion: 1 as const, createdAt };
    expect(snapshot.checksum).toBe(sha256(canonicalJsonStringify(payload)));
  });

  it('is stable across key insertion order', () => {
    const ordered = buildInput();
    const reordered: QuoteSnapshotInput = {
      notes: ordered.notes,
      validUntil: ordered.validUntil,
      leadTime: ordered.leadTime,
      incoterms: ordered.incoterms,
      financials: ordered.financials,
      lines: ordered.lines,
      buyer: ordered.buyer,
      seller: ordered.seller,
      version: ordered.version,
      rfqReference: ordered.rfqReference,
      rfqId: ordered.rfqId,
      quoteNumber: ordered.quoteNumber,
      quoteId: ordered.quoteId,
    };
    const first = createQuoteSnapshot(ordered, { createdAt });
    const second = createQuoteSnapshot(reordered, { createdAt });
    expect(first.checksum).toBe(second.checksum);
  });

  it('detects any tampering', () => {
    const snapshot = createQuoteSnapshot(buildInput(), { createdAt });
    const tamperedTotals = {
      ...snapshot,
      financials: { ...snapshot.financials, total: '1.00' },
    } as QuoteSnapshot;
    expect(verifyQuoteSnapshot(tamperedTotals)).toBe(false);
    const tamperedValidity = { ...snapshot, validUntil: '2027-02-28' } as QuoteSnapshot;
    expect(verifyQuoteSnapshot(tamperedValidity)).toBe(false);
    const tamperedChecksum = { ...snapshot, checksum: 'ff'.repeat(32) } as QuoteSnapshot;
    expect(verifyQuoteSnapshot(tamperedChecksum)).toBe(false);
  });

  it('rejects malformed snapshots', () => {
    expect(verifyQuoteSnapshot({} as unknown as QuoteSnapshot)).toBe(false);
    expect(verifyQuoteSnapshot(null as unknown as QuoteSnapshot)).toBe(false);
  });
});
