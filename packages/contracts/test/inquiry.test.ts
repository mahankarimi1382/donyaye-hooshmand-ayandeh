import { describe, expect, it } from 'vitest';

import { INQUIRY_TOPICS, CreateInquirySchema } from '../src';

function validInquiry() {
  return {
    name: 'Sara Ahmadi',
    email: 'sara@aryapolymer.example',
    company: 'Arya Polymer Khaleej Fars LLC',
    phone: '+971501234567',
    topic: 'sales',
    subject: 'HDPE film grade supply',
    message: 'We need a monthly supply of HDPE film grade with CIF Jebel Ali terms.',
    websiteUrlHp: '',
    consent: true,
  } as const;
}

describe('CreateInquirySchema', () => {
  it('accepts a complete contact message', () => {
    expect(CreateInquirySchema.safeParse(validInquiry()).success).toBe(true);
  });

  it('rejects a filled honeypot and missing consent', () => {
    expect(
      CreateInquirySchema.safeParse({ ...validInquiry(), websiteUrlHp: 'https://spam.example' })
        .success,
    ).toBe(false);
    expect(CreateInquirySchema.safeParse({ ...validInquiry(), consent: false }).success).toBe(false);
  });

  it('accepts an empty or well-formed phone and rejects other formats', () => {
    expect(CreateInquirySchema.safeParse({ ...validInquiry(), phone: '' }).success).toBe(true);
    expect(CreateInquirySchema.safeParse({ ...validInquiry(), phone: undefined }).success).toBe(true);
    expect(CreateInquirySchema.safeParse({ ...validInquiry(), phone: '09121234567' }).success).toBe(false);
  });

  it('bounds subject and message length', () => {
    expect(CreateInquirySchema.safeParse({ ...validInquiry(), subject: 'abc' }).success).toBe(false);
    expect(CreateInquirySchema.safeParse({ ...validInquiry(), subject: 'abcd' }).success).toBe(true);
    expect(
      CreateInquirySchema.safeParse({ ...validInquiry(), message: 'Too short to matter' }).success,
    ).toBe(false);
    expect(CreateInquirySchema.safeParse({ ...validInquiry(), message: 'x'.repeat(4001) }).success).toBe(
      false,
    );
  });

  it('restricts topics to the commercial vocabulary', () => {
    expect([...INQUIRY_TOPICS]).toEqual([
      'sales',
      'procurement',
      'logistics',
      'compliance',
      'partnership',
    ]);
    expect(CreateInquirySchema.safeParse({ ...validInquiry(), topic: 'support' }).success).toBe(false);
  });
});
