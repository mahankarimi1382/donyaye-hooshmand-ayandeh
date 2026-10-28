import type { SupportedLocale } from './types';

const FARSI_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'] as const;

export function toFarsiDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (digit) => FARSI_DIGITS[Number(digit)]);
}

function resolveDate(iso: string): Date | null {
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function dateFormatter(locale: SupportedLocale, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR-u-ca-persian' : 'en-US', {
    timeZone: 'UTC',
    ...options,
  });
}

export function formatJalaliDate(iso: string, locale: SupportedLocale): string {
  const date = resolveDate(iso);
  if (date === null) return iso;
  return dateFormatter(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
}

export function formatDateTime(iso: string, locale: SupportedLocale): string {
  const date = resolveDate(iso);
  if (date === null) return iso;
  return dateFormatter(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatMoney(amountString: string, currency: string, locale: SupportedLocale): string {
  const amount = Number(amountString);
  if (!Number.isFinite(amount)) return amountString;
  const fractionDigits = currency === 'IRR' ? 0 : 2;
  const formatter = new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  return formatter.format(amount);
}
