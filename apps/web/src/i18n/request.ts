import {hasLocale} from 'next-intl';
import {getRequestConfig, type RequestConfig} from 'next-intl/server';

import {getDictionary} from '@karvan/i18n';

import {routing} from './routing';

type IntlMessages = NonNullable<RequestConfig['messages']>;

function sanitizeIntlMessages(val: unknown): unknown {
  if (val === null || typeof val !== 'object') return val;
  if (Array.isArray(val)) return val.map(sanitizeIntlMessages);
  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(val as Record<string, unknown>)) {
    const cleanKey = key.includes('.') ? key.replace(/\./g, '_') : key;
    out[cleanKey] = sanitizeIntlMessages(child);
  }
  return out;
}

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: sanitizeIntlMessages(getDictionary(locale)) as unknown as IntlMessages,
  };
});
