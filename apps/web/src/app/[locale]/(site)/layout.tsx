import { getDictionary } from '@karvan/i18n';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';

import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { Ticker } from '@/components/ticker';
import { normalizeTheme, THEME_COOKIE_NAME, type ThemeName } from '@/lib/theme';

interface SiteLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function SiteLayout({ children, params }: SiteLayoutProps) {
  const { locale } = await params;
  const dictionary = getDictionary(locale);
  const theme: ThemeName = normalizeTheme((await cookies()).get(THEME_COOKIE_NAME)?.value);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden w-full max-w-full">
      <Ticker dictionary={dictionary} />
      <Navbar locale={locale} theme={theme} />
      <div className="flex-1 overflow-x-hidden w-full max-w-full">{children}</div>
      <Footer locale={locale} dictionary={dictionary} />
    </div>
  );
}
