import { getDictionary, type Dictionary } from '@karvan/i18n';
import type { ThemeName } from '@/lib/theme';

import { Link } from '@/i18n/navigation';
import { LocaleSwitch } from '@/components/locale-switch';
import { ThemeToggle } from '@/components/theme-toggle';
import { MobileNav } from '@/components/mobile-nav';

interface NavbarProps {
  locale: string;
  theme: ThemeName;
}

const NAV_LINKS: readonly { key: keyof ReturnType<typeof getDictionary>['nav']; href: string }[] = [
  { key: 'products', href: '/products' },
  { key: 'services', href: '/services' },
  { key: 'quality', href: '/quality' },
  { key: 'blog', href: '/blog' },
  { key: 'faq', href: '/faq' },
  { key: 'about', href: '/about' },
  { key: 'contact', href: '/contact' },
];

export function Navbar({ locale, theme }: NavbarProps) {
  const dictionary: Dictionary = getDictionary(locale);
  const isFa = locale === 'fa';

  return (
    <header className="sticky top-0 z-50 w-full px-3 py-2.5 sm:px-6 sm:py-4 pointer-events-none">
      <div className="pointer-events-auto mx-auto flex h-16 sm:h-20 max-w-[1360px] items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6 lg:px-8 bg-surface-container-lowest/90 backdrop-blur-md rounded-full border border-outline-variant/35 shadow-glass transition-all">
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 min-w-0">
          <MobileNav locale={locale} theme={theme} dictionary={dictionary} />

          {/* Brand Logo & Identity */}
          <Link href="/" className="group flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="flex size-9 sm:size-11 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-xs transition-transform duration-200 group-hover:scale-105 shrink-0">
              <svg className="size-5 sm:size-6 text-primary-fixed fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-extrabold tracking-tight text-on-surface lg:text-lg whitespace-nowrap">
                  {dictionary.common.brandName}
                </span>
                <span className="hidden rounded-full bg-primary-fixed/60 border border-primary-fixed/40 px-2.5 py-0.5 text-[10px] font-semibold text-on-primary-fixed-variant xl:inline-block whitespace-nowrap">
                  تأمین و لجستیک نهاده‌ها
                </span>
              </div>
              <span className="hidden sm:block font-mono text-[10px] uppercase tracking-wider text-on-surface-variant/70 whitespace-nowrap" dir="ltr">
                Donyaye Hooshmand Ayandeh
              </span>
            </div>
          </Link>

          {/* Navigation Chips */}
          <nav aria-label={dictionary.common.meta.mainNavigation} className="hidden items-center gap-0.5 xl:gap-1 lg:flex text-xs xl:text-sm font-medium text-on-surface-variant">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-2.5 xl:px-3.5 py-2 transition-colors hover:bg-surface-container-low hover:text-primary whitespace-nowrap"
              >
                {dictionary.nav[item.key]}
              </Link>
            ))}
          </nav>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Live Berth Status Indicator */}
          <div className="hidden xl:flex items-center gap-2 rounded-full border border-outline-variant/35 bg-surface-container-low px-3.5 py-1.5 text-xs font-mono text-on-surface-variant shadow-xs">
            <span className="size-2 rounded-full bg-secondary animate-pulse"></span>
            <span>بندر امام: اسکله ۳۴ فعال</span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <LocaleSwitch />
            <ThemeToggle theme={theme} label={dictionary.common.meta.themeToggle} />
          </div>

          {/* Primary Consultation Action */}
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-on-primary shadow-terracotta hover:bg-primary-container hover:-translate-y-0.5 active:translate-y-0 transition-all shrink-0"
          >
            <span>{isFa ? 'مشاوره و استعلام' : 'Consultation'}</span>
            <span className="rtl:rotate-180 text-xs hidden sm:inline">←</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
