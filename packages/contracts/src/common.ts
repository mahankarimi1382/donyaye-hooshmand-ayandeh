import { z } from 'zod';

export const CURRENCY_CODES = ['USD', 'EUR', 'AED', 'CNY', 'TRY', 'IRR'] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export const CurrencyCodeSchema = z.enum(CURRENCY_CODES);

export const INCOTERMS_2020 = [
  'EXW',
  'FCA',
  'FOB',
  'CFR',
  'CIF',
  'CPT',
  'CIP',
  'DAP',
  'DDP',
] as const;
export type Incoterm = (typeof INCOTERMS_2020)[number];

export const IncotermSchema = z.enum(INCOTERMS_2020);

export const SEAPORT_INCOTERMS = ['FOB', 'CFR', 'CIF'] as const;
export type SeaportIncoterm = (typeof SEAPORT_INCOTERMS)[number];

export function isSeaportIncoterm(incoterm: Incoterm): incoterm is SeaportIncoterm {
  return (SEAPORT_INCOTERMS as readonly string[]).includes(incoterm);
}

export function validateIncotermNamedPlace(
  incoterm: Incoterm,
  namedPlace: string | undefined | null,
): boolean {
  const place = (namedPlace ?? '').trim();
  if (isSeaportIncoterm(incoterm)) return place.length >= 2;
  return place.length === 0 || place.length >= 2;
}

export const COUNTRY_CODES = [
  'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
  'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS',
  'BT', 'BV', 'BW', 'BY', 'BZ',
  'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CW',
  'CX', 'CY', 'CZ',
  'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ',
  'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET',
  'FI', 'FJ', 'FK', 'FM', 'FO', 'FR',
  'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT',
  'GU', 'GW', 'GY',
  'HK', 'HM', 'HN', 'HR', 'HT', 'HU',
  'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT',
  'JE', 'JM', 'JO', 'JP',
  'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ',
  'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY',
  'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS',
  'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ',
  'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ',
  'OM',
  'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY',
  'QA',
  'RE', 'RO', 'RS', 'RU', 'RW',
  'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS',
  'ST', 'SV', 'SX', 'SY', 'SZ',
  'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ',
  'UA', 'UG', 'UM', 'US', 'UY', 'UZ',
  'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU',
  'WF', 'WS',
  'YE', 'YT',
  'ZA', 'ZM', 'ZW',
] as const;
export type CountryCode = (typeof COUNTRY_CODES)[number];

export const CountryCodeSchema = z.enum(COUNTRY_CODES);

export const MONEY_STRING_PATTERN = /^\d+(\.\d{1,4})?$/;

export const MoneyStringSchema = z
  .string()
  .regex(MONEY_STRING_PATTERN, { error: 'Amount must be a non-negative decimal string with at most 4 fraction digits' });

export type MoneyString = z.output<typeof MoneyStringSchema>;

export const MoneyWithCurrencySchema = z.strictObject({
  amount: MoneyStringSchema,
  currency: CurrencyCodeSchema,
});

export type MoneyWithCurrency = z.output<typeof MoneyWithCurrencySchema>;

export const IDEMPOTENCY_KEY_PATTERN = /^[a-zA-Z0-9_-]{16,128}$/;

export const IdempotencyKeySchema = z
  .string()
  .regex(IDEMPOTENCY_KEY_PATTERN, {
    error: 'Idempotency key must be 16 to 128 characters of [A-Za-z0-9_-]',
  });

const paginationShape = {
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
};

export const PaginationQuerySchema = z.object(paginationShape);

export type PaginationQuery = z.output<typeof PaginationQuerySchema>;

export const PaginationMetaSchema = z.strictObject({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(100),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

export type PaginationMeta = z.output<typeof PaginationMetaSchema>;

export function createApiResponseSchema<T extends z.ZodType>(data: T) {
  return z.strictObject({
    success: z.literal(true),
    data,
    requestId: z.string().min(1).optional(),
    timestamp: z.iso.datetime().optional(),
  });
}

export function createApiPaginatedResponseSchema<T extends z.ZodType>(data: T) {
  return createApiResponseSchema(
    z.strictObject({ items: z.array(data), pagination: PaginationMetaSchema }),
  );
}

export type ApiResponse<T> = {
  success: true;
  data: T;
  requestId?: string;
  timestamp?: string;
};

export type ApiPaginatedResponse<T> = ApiResponse<{ items: T[]; pagination: PaginationMeta }>;

export const ApiErrorDetailSchema = z.strictObject({
  path: z.string(),
  code: z.string(),
  message: z.string(),
});

export type ApiErrorDetail = z.output<typeof ApiErrorDetailSchema>;

export const API_ERROR_CODES = [
  'validation_error',
  'unauthorized',
  'forbidden',
  'not_found',
  'conflict',
  'invalid_transition',
  'version_conflict',
  'idempotency_conflict',
  'rate_limited',
  'honeypot',
  'internal_error',
] as const;
export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export const ApiErrorCodeSchema = z.enum(API_ERROR_CODES);

export const ApiErrorBodySchema = z.strictObject({
  code: ApiErrorCodeSchema,
  message: z.string().min(1),
  details: z.array(ApiErrorDetailSchema).optional(),
  requestId: z.string().min(1).optional(),
  timestamp: z.iso.datetime().optional(),
});

export const ApiErrorResponseSchema = z.strictObject({
  success: z.literal(false),
  error: ApiErrorBodySchema,
});

export type ApiErrorResponse = z.output<typeof ApiErrorResponseSchema>;

export function apiSuccess<T>(data: T, requestId?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    ...(requestId === undefined ? {} : { requestId }),
  };
}

export function apiError(
  code: ApiErrorCode,
  message: string,
  details?: ApiErrorDetail[],
  requestId?: string,
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details === undefined ? {} : { details }),
      ...(requestId === undefined ? {} : { requestId }),
      timestamp: new Date().toISOString(),
    },
  };
}
