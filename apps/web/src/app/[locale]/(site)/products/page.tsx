import type { Metadata } from 'next';
import { getDictionary, formatJalaliDate } from '@karvan/i18n';
import { PageHeader } from '@karvan/ui';

import { getStore } from '@/lib/store';
import { SiteFrame } from '../_components/site-chrome';
import { CatalogBrowser } from './catalog-browser';

interface ProductsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ProductsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = getDictionary(locale);
  const isFa = locale === 'fa';
  return {
    title: isFa ? 'کاتالوگ جامع نهاده‌های دامی و طیور' : dictionary.products.title,
    description: isFa
      ? 'فهرست مشخصات فنی، آنالیز کیفی، حداقل سفارش و شرایط تأمین ذرت، جو، کنجاله سویا، مکمل‌ها و اسیدهای آمینه دامی شرکت دنیای هوشمند آینده.'
      : dictionary.products.intro,
  };
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { locale } = await params;
  const dictionary = getDictionary(locale);
  const isFa = locale === 'fa';
  const lang = isFa ? 'fa' : 'en';
  const today = formatJalaliDate(new Date().toISOString(), lang);

  const products = getStore().listProducts();

  return (
    <main>
      <SiteFrame marginNote="DHA-PRD-1405" className="py-10">
        <PageHeader
          title={isFa ? 'کاتالوگ تخصصی نهاده‌های دامی و طیور' : dictionary.products.title}
          meta={[
            { label: dictionary.common.meta.documentNumber, value: 'DHA-CAT-1405' },
            { label: dictionary.common.meta.date, value: today },
            { label: dictionary.products.fields.hsCode, value: 'HS-2022' },
          ]}
        />

        <p className="mt-6 max-w-3xl text-lg leading-8 text-ink-soft">
          {isFa
            ? 'سبد تأمین و توزیع شرکت دنیای هوشمند آینده شامل غلات اساسی خوراک دام، کنجاله‌های روغنی غنی از پروتئین، مکمل‌های معدنی و اسیدهای آمینه استاندارد. برای دریافت آنالیز آزمایشگاهی و شرایط تحویل در بنادر شمالی و جنوبی از سامانه استعلام استفاده نمایید.'
            : dictionary.products.intro}
        </p>

        {/* Interactive Filterable & Searchable Product Browser */}
        <CatalogBrowser products={products} dictionary={dictionary} locale={locale} />
      </SiteFrame>
    </main>
  );
}
