import type { Metadata } from 'next';
import { getDictionary, formatJalaliDate } from '@karvan/i18n';
import { PageHeader } from '@karvan/ui';

import { getStore } from '@/lib/store';
import { SiteFrame } from '../_components/site-chrome';
import { RfqForm } from './rfq-form';

interface RfqPageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ product?: string; port?: string; volume?: string }>;
}

export async function generateMetadata({ params }: RfqPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === 'fa';
  return {
    title: isFa ? 'درخواست استعلام قیمت و شرایط تأمین نهاده‌های دامی' : 'Request for Quotation (RFQ) — Feed Inputs',
    description: isFa
      ? 'سامانه رسمی ثبت استعلام قیمت، تناژ و شرایط تحویل نهاده‌های خوراک دام و طیور، غلات، کنجاله‌ها و مکمل‌ها شرکت دنیای هوشمند آینده.'
      : 'Official RFQ portal for animal feed grains, meals, and feed additives supply quotations.',
  };
}

export default async function RfqPage({ params, searchParams }: RfqPageProps) {
  const { locale } = await params;
  const search = await searchParams;
  const initialProductId = search?.product ?? '';
  const initialPort = search?.port ?? '';
  const initialVolume = search?.volume ?? '';

  const dictionary = getDictionary(locale);
  const isFa = locale === 'fa';
  const lang = isFa ? 'fa' : 'en';
  const today = formatJalaliDate(new Date().toISOString(), lang);

  const products = getStore().listProducts();

  return (
    <main>
      <SiteFrame marginNote="DHA-RFQ-FORM" className="py-10">
        <PageHeader
          title={isFa ? 'ثبت استعلام رسمی نهاده‌های دامی' : 'Request for Quotation (RFQ)'}
          meta={[
            { label: dictionary.common.meta.documentNumber, value: 'DHA-RFQ-1405' },
            { label: dictionary.common.meta.date, value: today },
            { label: dictionary.common.meta.status, value: isFa ? 'پذیرش استعلام' : 'Open for Inquiries' },
          ]}
        />

        <p className="mt-6 max-w-3xl text-lg leading-8 text-ink-soft">
          {isFa
            ? 'برای دریافت پیش‌فاکتور رسمی، مشخصات نهاده، تناژ مورد نیاز، محل تحویل و اطلاعات شرکت خریدار را وارد نمایید. کارشناسان بازرگانی و تغذیه ظرف ۲۴ ساعت کاری پیش‌فاکتور رسمی را با گواهی آنالیز و شرایط حمل صادر خواهند نمود.'
            : 'Submit your commercial volume requirements, preferred delivery terms, and specifications. Our procurement desk issues official quotations within 24 business hours.'}
        </p>

        <div className="mt-10">
          <RfqForm
            products={products}
            initialProductId={initialProductId}
            initialPort={initialPort}
            initialVolume={initialVolume}
            dictionary={dictionary}
            locale={locale}
          />
        </div>
      </SiteFrame>
    </main>
  );
}
