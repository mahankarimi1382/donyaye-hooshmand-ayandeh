import { describe, expect, it } from 'vitest';

import { CompanyProfileSchema, ContactPersonSchema, E164_PHONE_PATTERN } from '../src';

describe('E.164 phone pattern', () => {
  it('accepts international numbers with a plus prefix', () => {
    expect(E164_PHONE_PATTERN.test('+982123456789')).toBe(true);
    expect(E164_PHONE_PATTERN.test('+971501234567')).toBe(true);
    expect(E164_PHONE_PATTERN.test('+13051234567')).toBe(true);
  });

  it('rejects local formats and malformed prefixes', () => {
    expect(E164_PHONE_PATTERN.test('09121234567')).toBe(false);
    expect(E164_PHONE_PATTERN.test('+02123456789')).toBe(false);
    expect(E164_PHONE_PATTERN.test('+98212')).toBe(false);
    expect(E164_PHONE_PATTERN.test('982123456789')).toBe(false);
    expect(E164_PHONE_PATTERN.test('+98 21 2345 6789')).toBe(false);
  });
});

describe('ContactPersonSchema', () => {
  it('accepts a named contact with role and optional phone', () => {
    expect(
      ContactPersonSchema.safeParse({
        name: 'Sara Ahmadi',
        email: 'sara@aryapolymer.example',
        role: 'Procurement Manager',
        phone: '+971501234567',
      }).success,
    ).toBe(true);
    expect(
      ContactPersonSchema.safeParse({
        name: 'Sara Ahmadi',
        email: 'sara@aryapolymer.example',
        role: 'Procurement Manager',
      }).success,
    ).toBe(true);
  });

  it('rejects short names, bad emails and unknown keys', () => {
    expect(
      ContactPersonSchema.safeParse({
        name: 'S',
        email: 'sara@aryapolymer.example',
        role: 'Procurement Manager',
      }).success,
    ).toBe(false);
    expect(
      ContactPersonSchema.safeParse({
        name: 'Sara Ahmadi',
        email: 'not-an-email',
        role: 'Procurement Manager',
      }).success,
    ).toBe(false);
    expect(
      ContactPersonSchema.safeParse({
        name: 'Sara Ahmadi',
        email: 'sara@aryapolymer.example',
        role: 'Procurement Manager',
        nickname: 'sara',
      }).success,
    ).toBe(false);
    expect(
      ContactPersonSchema.safeParse({
        name: 'Sara Ahmadi',
        email: 'sara@aryapolymer.example',
        phone: '09121234567',
        role: 'Procurement Manager',
      }).success,
    ).toBe(false);
  });
});

describe('CompanyProfileSchema', () => {
  it('accepts a minimal profile with name and country', () => {
    expect(
      CompanyProfileSchema.safeParse({ name: 'Arya Polymer Khaleej Fars LLC', country: 'AE' }).success,
    ).toBe(true);
  });

  it('accepts the full registration dossier', () => {
    expect(
      CompanyProfileSchema.safeParse({
        name: 'Bayerisch Metallhandel GmbH',
        country: 'DE',
        registrationNumber: 'HRB 188422',
        website: 'https://bayerisch-metallhandel.example',
        taxId: 'DE811907980',
        address: 'Leopoldstrasse 240, Muenchen',
        city: 'Munich',
      }).success,
    ).toBe(true);
  });

  it('rejects unknown countries, bad URLs and unknown keys', () => {
    expect(CompanyProfileSchema.safeParse({ name: 'X Trade Co', country: 'XX' }).success).toBe(false);
    expect(
      CompanyProfileSchema.safeParse({ name: 'X Trade Co', country: 'DE', website: 'not-a-url' })
        .success,
    ).toBe(false);
    expect(
      CompanyProfileSchema.safeParse({ name: 'X Trade Co', country: 'DE', vat: 'DE123' }).success,
    ).toBe(false);
    expect(CompanyProfileSchema.safeParse({ name: 'X', country: 'DE' }).success).toBe(false);
  });
});
