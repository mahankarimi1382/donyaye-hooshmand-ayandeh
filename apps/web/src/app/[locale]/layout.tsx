import type {Metadata, Viewport} from 'next';
import {cookies} from 'next/headers';
import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import type {ReactNode} from 'react';

import {getDictionary} from '@karvan/i18n';

import {routing} from '@/i18n/routing';
import {normalizeTheme, THEME_COOKIE_NAME, type ThemeName} from '@/lib/theme';

import '@fontsource-variable/vazirmatn';
import '@fontsource/lalezar';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{locale: string}>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({params}: LocaleLayoutProps): Promise<Metadata> {
  const {locale} = await params;
  const dictionary = getDictionary(locale);

  return {
    metadataBase: new URL('https://karvan.trade'),
    title: {
      default: `${dictionary.common.brandName} — ${dictionary.common.tagline}`,
      template: `%s | ${dictionary.common.brandName}`,
    },
    description: dictionary.home.hero.subtitle,
  };
}

type IntlMessageCatalog = {readonly [key: string]: string | IntlMessageCatalog};

export default async function LocaleLayout({children, params}: LocaleLayoutProps) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const theme: ThemeName = normalizeTheme((await cookies()).get(THEME_COOKIE_NAME)?.value);
  const dictionary = getDictionary(locale);

  return (
    <html lang={locale} dir={locale === 'fa' ? 'rtl' : 'ltr'} data-theme={theme}>
      <body className="bg-paper text-ink">
        <NextIntlClientProvider locale={locale} messages={dictionary as unknown as IntlMessageCatalog}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
