import { describe, expect, it } from 'vitest';

import { TrackQuerySchema } from '../src';

describe('TrackQuerySchema', () => {
  it('accepts a reference of 6 to 64 characters with surrounding whitespace trimmed', () => {
    const result = TrackQuerySchema.safeParse({ reference: '  RFQ-1405-00001  ' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.reference).toBe('RFQ-1405-00001');
    expect(TrackQuerySchema.safeParse({ reference: 'TC-1405-0007' }).success).toBe(true);
    expect(TrackQuerySchema.safeParse({ reference: 'a'.repeat(64) }).success).toBe(true);
  });

  it('accepts an optional matching email', () => {
    expect(
      TrackQuerySchema.safeParse({ reference: 'Q-1405-0001', email: 'buyer@tenant.example' }).success,
    ).toBe(true);
    expect(TrackQuerySchema.safeParse({ reference: 'Q-1405-0001' }).success).toBe(true);
    expect(
      TrackQuerySchema.safeParse({ reference: 'Q-1405-0001', email: 'not-an-email' }).success,
    ).toBe(false);
  });

  it('rejects short references and unknown keys', () => {
    expect(TrackQuerySchema.safeParse({ reference: 'RFQ-1' }).success).toBe(false);
    expect(TrackQuerySchema.safeParse({ reference: 'a'.repeat(65) }).success).toBe(false);
    expect(TrackQuerySchema.safeParse({ reference: 'Q-1405-0001', phone: '+9715' }).success).toBe(false);
  });
});
