import { getTranslations } from 'next-intl/server';
import { Home, Compass, FileText, ArrowRight, ArrowLeft } from 'lucide-react';

import { Link } from '@/i18n/navigation';

export default async function LocaleNotFound() {
  const t = await getTranslations();

  return (
    <main className="mx-auto flex min-h-[75vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="bento-card-static bg-surface-container-lowest p-8 sm:p-12 shadow-hero max-w-2xl w-full flex flex-col items-center gap-6">
        <div className="flex size-20 items-center justify-center rounded-3xl bg-primary-fixed/80 border border-primary-fixed text-on-primary-fixed-variant font-display text-3xl font-black shadow-xs">
          ۴۰۴
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-on-surface">
          {t('notFound.title') || 'صفحه مورد نظر یافت نشد'}
        </h1>

        <p className="max-w-xl text-sm leading-7 text-on-surface-variant">
          {t('notFound.description') ||
            'آدرس واردشده تغییر کرده یا حذف شده است. می‌توانید از پیوندهای زیر برای دسترسی مستقیم به کاتالوگ نهاده‌ها، ثبت استعلام یا بازگشت به صفحه اصلی استفاده فرمایید.'}
        </p>

        {/* Recovery Links Grid */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-on-primary shadow-terracotta hover:bg-primary-container transition-all duration-200"
          >
            <Home className="size-4" />
            <span>{t('nav.home') || 'صفحه اصلی'}</span>
          </Link>

          <Link
            href="/products"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-outline-variant/35 bg-surface-container-low px-6 text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
          >
            <Compass className="size-4 text-primary" />
            <span>{t('nav.products') || 'کاتالوگ نهاده‌های دامی'}</span>
          </Link>

          <Link
            href="/rfq"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-outline-variant/35 bg-surface-container-low px-6 text-sm font-semibold text-on-surface hover:border-primary/40 transition-colors"
          >
            <FileText className="size-4 text-secondary" />
            <span>{t('nav.rfq') || 'ثبت استعلام خرید'}</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
