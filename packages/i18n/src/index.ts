import { formatDateTime, formatJalaliDate, formatMoney, toFarsiDigits } from './format';
import { en } from './locales/en';
import { fa } from './locales/fa';
import type { Dictionary, LocaleDirection, SupportedLocale } from './types';

export const SUPPORTED_LOCALES = ['fa', 'en'] as const;

export const dictionaries: Record<SupportedLocale, Dictionary> = { fa, en };

export { fa, en };

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return value === 'fa' || value === 'en';
}

export function getDictionary(locale: string | null | undefined): Dictionary {
  return isSupportedLocale(locale) ? dictionaries[locale] : dictionaries.fa;
}

export function isRtlLocale(locale: SupportedLocale): boolean {
  return locale === 'fa';
}

export function getLocaleDirection(locale: SupportedLocale): LocaleDirection {
  return isRtlLocale(locale) ? 'rtl' : 'ltr';
}

export { formatDateTime, formatJalaliDate, formatMoney, toFarsiDigits };

export type { Dictionary, LocaleDirection, SupportedLocale };
