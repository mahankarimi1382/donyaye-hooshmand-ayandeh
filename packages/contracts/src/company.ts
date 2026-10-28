import { z } from 'zod';

import { CountryCodeSchema } from './common';

export const E164_PHONE_PATTERN = /^\+[1-9]\d{6,14}$/;

export const PhoneE164Schema = z
  .string()
  .regex(E164_PHONE_PATTERN, { error: 'Phone number must be in E.164 format' });

export type PhoneE164 = z.output<typeof PhoneE164Schema>;

export const ContactPersonSchema = z.strictObject({
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  phone: PhoneE164Schema.optional(),
  role: z.string().trim().min(2).max(100),
});

export type ContactPerson = z.output<typeof ContactPersonSchema>;

export const CompanyProfileSchema = z.strictObject({
  name: z.string().trim().min(2).max(200),
  country: CountryCodeSchema,
  registrationNumber: z.string().trim().min(1).max(50).optional(),
  website: z.url().optional(),
  taxId: z.string().trim().min(1).max(50).optional(),
  address: z.string().trim().max(500).optional(),
  city: z.string().trim().min(2).max(100).optional(),
});

export type CompanyProfile = z.output<typeof CompanyProfileSchema>;
