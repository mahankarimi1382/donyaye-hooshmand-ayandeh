'use client';

import { useEffect, useState } from 'react';
import { Menu, X, ArrowLeft, Phone, Search, FileText, Compass, ShieldCheck, Info } from 'lucide-react';
import type { Dictionary } from '@karvan/i18n';
import type { ThemeName } from '@/lib/theme';

import { Link } from '@/i18n/navigation';
import { LocaleSwitch } from '@/components/locale-switch';
import { ThemeToggle } from '@/components/theme-toggle';

interface MobileNavProps {
  locale: string;
  theme: ThemeName;
  dictionary: Dictionary;
}

export function MobileNav({ locale, theme, dictionary }: MobileNavProps) {
  const isFa = locale === 'fa';
  const [isOpen, setIsOpen] = useState(false);

  // Close drawer on Escape key and prevent body scroll when open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const navItems = [
    { href: '/products', label: dictionary.nav.products, icon: Compass },
    { href: '/services', label: dictionary.nav.services, icon: FileText },
    { href: '/quality', label: dictionary.nav.quality, icon: ShieldCheck },
    { href: '/blog', label: dictionary.nav.blog || 'مقالات', icon: Search },
    { href: '/faq', label: dictionary.nav.faq || 'پرسش‌های متداول', icon: Info },
    { href: '/about', label: dictionary.nav.about, icon: Info },
    { href: '/contact', label: dictionary.nav.contact, icon: Phone },
  ];

  return (
    <div className="lg:hidden shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="باز کردن منوی ناوبری"
        aria-expanded={isOpen}
        className="flex size-10 items-center justify-center rounded-full border border-outline-variant/35 bg-surface-container-low text-on-surface hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0 transition-colors"
      >
        <Menu className="size-5 text-primary" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="منوی سایت"
            className="relative ms-0 flex h-full w-full max-w-xs flex-col justify-between border-e border-outline-variant/35 bg-surface-container-lowest p-6 shadow-2xl transition-transform"
          >
            <div>
              {/* Header inside drawer */}
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 text-base font-extrabold tracking-tight text-on-surface"
                >
                  <span className="size-2.5 rounded-full bg-primary inline-block"></span>
                  <span>{dictionary.common.brandName}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="بستن منو"
                  className="flex size-9 items-center justify-center rounded-full border border-outline-variant/30 text-on-surface hover:bg-surface-container transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav aria-label="منوی همراه" className="mt-6 flex flex-col gap-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between rounded-2xl px-3.5 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="size-5 text-primary" />
                        <span>{item.label}</span>
                      </span>
                      <ArrowLeft className="size-4 text-on-surface-variant/60 rtl:rotate-0 ltr:rotate-180" />
                    </Link>
                  );
                })}
              </nav>

              {/* Primary Actions inside drawer */}
              <div className="mt-8 flex flex-col gap-3">
                <Link
                  href="/contact"
                  onClick={() => setIsOpen(false)}
                  className="flex h-12 items-center justify-center rounded-full bg-primary px-4 text-center font-bold text-sm text-on-primary shadow-terracotta hover:bg-primary-container transition-all"
                >
                  {isFa ? 'درخواست مشاوره و استعلام' : 'Consultation & Inquiry'}
                </Link>
                <Link
                  href="/products"
                  onClick={() => setIsOpen(false)}
                  className="flex h-11 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-low px-4 text-center text-xs font-semibold text-on-surface hover:bg-surface-container transition-all"
                >
                  {isFa ? 'کاتالوگ جامع نهاده‌های دامی' : 'Browse Feed Catalog'}
                </Link>
              </div>
            </div>

            {/* Footer / Controls */}
            <div className="border-t border-outline-variant/30 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">تنظیمات:</span>
                <div className="flex items-center gap-2">
                  <LocaleSwitch />
                  <ThemeToggle theme={theme} label={dictionary.common.meta.themeToggle} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
