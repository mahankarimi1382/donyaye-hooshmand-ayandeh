'use client';

import { Languages } from 'lucide-react';
import { useLocale } from 'next-intl';

import { Link, usePathname } from '@/i18n/navigation';

export function LocaleSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const target = locale === 'fa' ? 'en' : 'fa';

  return (
    <Link
      href={pathname}
      locale={target}
      className="inline-flex h-8 items-center gap-1.5 rounded-[2px] border border-rule bg-sheet px-2 font-mono text-xs text-ink-soft shadow-register hover:bg-well hover:text-ink"
    >
      <Languages size={14} aria-hidden />
      <span>{target === 'en' ? 'EN' : 'فا'}</span>
    </Link>
  );
}
