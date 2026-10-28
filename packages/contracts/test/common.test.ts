import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  API_ERROR_CODES,
  ApiErrorResponseSchema,
  COUNTRY_CODES,
  CURRENCY_CODES,
  CurrencyCodeSchema,
  IdempotencyKeySchema,
  INCOTERMS_2020,
  MoneyStringSchema,
  MoneyWithCurrencySchema,
  PaginationQuerySchema,
  SEAPORT_INCOTERMS,
  apiError,
  apiSuccess,
  createApiPaginatedResponseSchema,
  createApiResponseSchema,
  validateIncotermNamedPlace,
} from '../src';

describe('currency codes', () => {
  it('exposes exactly the six trading currencies', () => {
    expect([...CURRENCY_CODES]).toEqual(['USD', 'EUR', 'AED', 'CNY', 'TRY', 'IRR']);
    expect(CurrencyCodeSchema.safeParse('IRR').success).toBe(true);
    expect(CurrencyCodeSchema.safeParse('GBP').success).toBe(false);
    expect(CurrencyCodeSchema.safeParse('usd').success).toBe(false);
  });
});

describe('incoterms', () => {
  it('lists the nine trade terms of Incoterms 2020', () => {
    expect([...INCOTERMS_2020]).toEqual([
      'EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DDP',
    ]);
    expect([...SEAPORT_INCOTERMS]).toEqual(['FOB', 'CFR', 'CIF']);
  });

  it('requires a named port for seaport terms', () => {
    expect(validateIncotermNamedPlace('FOB', 'Bandar Abbas')).toBe(true);
    expect(validateIncotermNamedPlace('CIF', '  Jebel Ali ')).toBe(true);
    expect(validateIncotermNamedPlace('FOB', undefined)).toBe(false);
    expect(validateIncotermNamedPlace('CFR', '   ')).toBe(false);
    expect(validateIncotermNamedPlace('CIF', 'A')).toBe(false);
  });

  it('treats the named place as optional for the other terms', () => {
    expect(validateIncotermNamedPlace('EXW', undefined)).toBe(true);
    expect(validateIncotermNamedPlace('DAP', 'Almaty')).toBe(true);
    expect(validateIncotermNamedPlace('DDP', 'A')).toBe(false);
    expect(validateIncotermNamedPlace('FCA', 'Tehran')).toBe(true);
  });
});

describe('country codes', () => {
  it('carries the full ISO 3166-1 alpha-2 list of 249 officially assigned codes', () => {
    expect(COUNTRY_CODES).toHaveLength(249);
    expect(new Set(COUNTRY_CODES).size).toBe(249);
    for (const code of COUNTRY_CODES) {
      expect(code).toMatch(/^[A-Z]{2}$/);
    }
    expect(COUNTRY_CODES).toContain('IR');
    expect(COUNTRY_CODES).toContain('AE');
    expect(COUNTRY_CODES).toContain('DE');
  });
});

describe('money strings', () => {
  it('accepts non-negative decimals with at most four fraction digits', () => {
    expect(MoneyStringSchema.safeParse('0').success).toBe(true);
    expect(MoneyStringSchema.safeParse('1250').success).toBe(true);
    expect(MoneyStringSchema.safeParse('1250.5').success).toBe(true);
    expect(MoneyStringSchema.safeParse('1250.0001').success).toBe(true);
  });

  it('rejects negatives, separators and excess precision', () => {
    expect(MoneyStringSchema.safeParse('-1250').success).toBe(false);
    expect(MoneyStringSchema.safeParse('1,250').success).toBe(false);
    expect(MoneyStringSchema.safeParse('1250.12345').success).toBe(false);
    expect(MoneyStringSchema.safeParse('۱۲۵۰').success).toBe(false);
    expect(MoneyStringSchema.safeParse('').success).toBe(false);
  });

  it('binds amount and currency in a strict object', () => {
    expect(MoneyWithCurrencySchema.safeParse({ amount: '99.90', currency: 'EUR' }).success).toBe(true);
    expect(
      MoneyWithCurrencySchema.safeParse({ amount: '99.90', currency: 'EUR', note: 'x' }).success,
    ).toBe(false);
    expect(MoneyWithCurrencySchema.safeParse({ amount: '99.90', currency: 'JPY' }).success).toBe(false);
  });
});

describe('idempotency keys', () => {
  it('accepts 16 to 128 url-safe characters', () => {
    expect(IdempotencyKeySchema.safeParse('a'.repeat(16)).success).toBe(true);
    expect(IdempotencyKeySchema.safeParse('rfq-create-0123456789_ABCDEFGH').success).toBe(true);
    expect(IdempotencyKeySchema.safeParse('A'.repeat(128)).success).toBe(true);
  });

  it('rejects keys outside the bounds or alphabet', () => {
    expect(IdempotencyKeySchema.safeParse('a'.repeat(15)).success).toBe(false);
    expect(IdempotencyKeySchema.safeParse('a'.repeat(129)).success).toBe(false);
    expect(IdempotencyKeySchema.safeParse('a'.repeat(15) + '!').success).toBe(false);
    expect(IdempotencyKeySchema.safeParse('key with spaces-0123').success).toBe(false);
  });
});

describe('pagination query', () => {
  it('applies defaults and coerces query strings', () => {
    expect(PaginationQuerySchema.parse({})).toEqual({ page: 1, pageSize: 20, sortOrder: 'desc' });
    expect(PaginationQuerySchema.parse({ page: '3', pageSize: '50', sortOrder: 'asc' })).toEqual({
      page: 3,
      pageSize: 50,
      sortOrder: 'asc',
    });
  });

  it('rejects out-of-range pages and unknown sort orders', () => {
    expect(PaginationQuerySchema.safeParse({ page: 0 }).success).toBe(false);
    expect(PaginationQuerySchema.safeParse({ page: 1.5 }).success).toBe(false);
    expect(PaginationQuerySchema.safeParse({ pageSize: 101 }).success).toBe(false);
    expect(PaginationQuerySchema.safeParse({ pageSize: 0 }).success).toBe(false);
    expect(PaginationQuerySchema.safeParse({ sortOrder: 'up' }).success).toBe(false);
  });
});

describe('api envelope', () => {
  it('shapes a success envelope from the factory', () => {
    const response = apiSuccess('RFQ-1405-00001', 'req-1');
    expect(response.success).toBe(true);
    expect(response.data).toBe('RFQ-1405-00001');
    expect(response.requestId).toBe('req-1');
    expect(response.timestamp).toEqual(expect.any(String));
    expect(createApiResponseSchema(z.string()).safeParse(response).success).toBe(true);
  });

  it('omits the requestId when not provided', () => {
    const response = apiSuccess(42);
    expect('requestId' in response).toBe(false);
  });

  it('shapes a paginated success envelope', () => {
    const page = { items: ['a', 'b'], pagination: { page: 1, pageSize: 20, total: 2, totalPages: 1 } };
    const schema = createApiPaginatedResponseSchema(z.string());
    expect(schema.safeParse({ ...apiSuccess(page), data: page }).success).toBe(true);
    expect(
      schema.safeParse({ ...apiSuccess(page), data: { ...page, pagination: { ...page.pagination, total: -1 } } })
        .success,
    ).toBe(false);
  });

  it('shapes an error envelope from the factory', () => {
    const response = apiError(
      'not_found',
      'No trade case with this reference',
      [{ path: 'reference', code: 'custom', message: 'unknown reference' }],
      'req-9',
    );
    expect(response.success).toBe(false);
    expect(response.error.code).toBe('not_found');
    expect(response.error.details).toHaveLength(1);
    expect(response.error.requestId).toBe('req-9');
    expect(ApiErrorResponseSchema.safeParse(response).success).toBe(true);
  });

  it('limits error codes to the platform union', () => {
    expect(API_ERROR_CODES).toHaveLength(11);
    expect(API_ERROR_CODES).toContain('version_conflict');
    expect(API_ERROR_CODES).toContain('honeypot');
    expect(apiError('made_up' as never, 'x').error.code).toBe('made_up' as never);
    expect(ApiErrorResponseSchema.safeParse(apiError('made_up' as never, 'x')).success).toBe(false);
  });
});
