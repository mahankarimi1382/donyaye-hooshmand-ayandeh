import type { Metadata } from 'next';
import { getDictionary, formatJalaliDate, toFarsiDigits } from '@karvan/i18n';
import { Check, ShieldCheck, FileCheck, FlaskConical, Scale, ArrowLeft } from 'lucide-react';
import { PageHeader, SectionHeader, Notice } from '@karvan/ui';
import { sha256 } from '@karvan/core';

import { Link } from '@/i18n/navigation';
import { SiteFrame, sectionIndex } from '../_components/site-chrome';
import { FeedFaq } from './feed-faq';

interface QualityPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: QualityPageProps): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = getDictionary(locale);
  const isFa = locale === 'fa';
  return {
    title: isFa ? 'کنترل کیفیت، آنالیز آزمایشگاهی و استانداردهای نهاده‌ها' : dictionary.quality.title,
    description: isFa
      ? 'دستورالعمل‌های بازرسی مستقل، آزمایش‌های سنجش پروتئین، رطوبت، آفلاتوکسین و اوره‌آز نهاده‌های خوراک دام و طیور شرکت دنیای هوشمند آینده.'
      : dictionary.quality.intro,
  };
}

export default async function QualityPage({ params }: QualityPageProps) {
  const { locale } = await params;
  const dictionary = getDictionary(locale);
  const isFa = locale === 'fa';
  const index = (n: number) => sectionIndex(locale, n);
  const today = formatJalaliDate(new Date().toISOString(), isFa ? 'fa' : 'en');
  const num = (n: number) => (isFa ? toFarsiDigits(n) : String(n));

  const pageChecksum = sha256(`dha-quality|${locale}|${dictionary.quality.integrityPolicy}|feed-assays`);

  const feedQualityParameters = [
    {
      title: isFa ? 'پروتئین خام (Crude Protein)' : 'Crude Protein (CP)',
      standard: isFa ? 'استاندارد ملی ۳۲۱ و ۲۳۴۴' : 'ISO 5983 / Kjeldahl Method',
      description: isFa
        ? 'سنجش دقیق میزان نیتروژن و ضریب تبدیل پروتئین در کنجاله سویا (حداقل ۴۴٪)، ذرت و جو با تاییدیه آزمایشگاه معتمد.'
        : 'Precise nitrogen determination and protein factor verification for soybean meal, corn, and barley.',
    },
    {
      title: isFa ? 'پایش رطوبت و افت وزنی (Moisture & Loss on Drying)' : 'Moisture & Volatile Matter',
      standard: isFa ? 'حداکثر ۱۲ تا ۱۴ درصد' : 'Max 12-14% depending on commodity',
      description: isFa
        ? 'کنترل رطوبت محموله جهت جلوگیری از فساد، کلوخه‌شدن و خوداشتعالی در سیلوها و انبارهای بندری.'
        : 'Continuous moisture tracking to prevent mold proliferation and spoilage during silo storage.',
    },
    {
      title: isFa ? 'سنجش سموم قارچی و مایکوتوکسین‌ها (Mycotoxins & Aflatoxin)' : 'Mycotoxin Assay (Aflatoxin B1)',
      standard: isFa ? 'زیر حد مجاز سازمان دامپزشکی (زیر ۲۰ ppb)' : 'Strictly below IVO threshold (< 20 ppb)',
      description: isFa
        ? 'آنالیز HPLC و الایزا برای اطمینان کامل از عدم وجود آفلاتوکسین، زیرالنون و اکراتوکسین در ذرت و دانه‌ها.'
        : 'Chromatographic HPLC and ELISA screening ensuring absolute toxicological safety for animal health.',
    },
    {
      title: isFa ? 'شاخص فعالیت اوره‌آز (Urease Activity Index)' : 'Urease Activity in Soybean Meal',
      standard: isFa ? 'بازه مجاز ۰٫۰۵ تا ۰٫۲۰ میلی‌گرم نیتروژن' : 'Index between 0.05 - 0.20 mg N/g/min',
      description: isFa
        ? 'سنجش درجه حرارت‌دیدگی و غیرفعال‌سازی فاکتورهای ضدتغذیه‌ای در کنجاله سویای پلت‌شده.'
        : 'Verification of optimal thermal processing and anti-nutritional inhibitor inactivation.',
    },
    {
      title: isFa ? 'فلزات سنگین و ناخالصی‌ها (Heavy Metals & Impurities)' : 'Heavy Metals & Foreign Matter',
      standard: isFa ? 'سرب، کادمیم، جیوه و فلوئور' : 'Lead, Cadmium, Mercury, Fluorine',
      description: isFa
        ? 'کنترل میزان فلوئور در دی‌کلسیم فسفات (DCP زیر ۰٫۱۸٪) و عدم وجود ناخالصی‌های فیزیکی در دانه‌ها.'
        : 'Rigorous ICP testing for fluorine in feed phosphates and screening for foreign agricultural debris.',
    },
  ];

  return (
    <main>
      <SiteFrame marginNote="DHA-QLT-1405" className="py-10">
        <PageHeader
          title={isFa ? 'کنترل کیفیت و راستی‌آزمایی آزمایشگاهی' : dictionary.quality.title}
          meta={[
            { label: dictionary.common.meta.documentNumber, value: 'DHA-QLT-1405' },
            { label: dictionary.common.meta.date, value: today },
            { label: dictionary.common.meta.checksum, value: pageChecksum.slice(0, 12).toUpperCase() },
          ]}
        />

        <p className="mt-8 max-w-3xl text-lg leading-8 text-ink-soft">
          {isFa
            ? 'در زنجیره تأمین نهاده‌های خوراک دام و طیور شرکت دنیای هوشمند آینده، کیفیت یک ادعای بازاریابی نیست؛ بلکه مجموعه‌ای از آزمون‌های آنالیز شیمیایی، سنجش سموم قارچی و گواهی‌های بهداشتی بین‌المللی است که قبل از ترخیص و بارگیری صادر و به خریدار تحویل می‌شود.'
            : dictionary.quality.intro}
        </p>

        {/* 1. Feed Quality Assays Matrix */}
        <section className="mt-14">
          <SectionHeader
            index={index(1)}
            title={isFa ? 'پارامترهای کیفی و آزمون‌های استاندارد نهاده‌ها' : 'Nutritional & Safety Assay Parameters'}
            description={
              isFa
                ? 'شاخص‌های کلیدی که در هر محموله با نمونه‌برداری رسمی بازرسان بین‌المللی (SGS/Cotecna) مورد ارزیابی قرار می‌گیرند'
                : 'Key physicochemical and microbiological criteria evaluated on every commercial shipment.'
            }
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {feedQualityParameters.map((param) => (
              <div
                key={param.title}
                className="bento-card bg-surface-container-lowest p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2.5 text-primary">
                    <FlaskConical className="size-5 shrink-0" />
                    <h3 className="font-bold text-on-surface text-base">{param.title}</h3>
                  </div>
                  <span className="mt-3 inline-block rounded-full bg-surface-container-low border border-outline-variant/30 px-3 py-1 font-mono text-[11px] font-semibold text-secondary">
                    {param.standard}
                  </span>
                  <p className="mt-3 text-xs leading-6 text-on-surface-variant">{param.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Standards Checklist */}
        <section className="mt-14">
          <SectionHeader index={index(2)} title={dictionary.quality.standardsTitle} />
          <ul className="mt-8 rounded-3xl border border-outline-variant/35 bg-surface-container-lowest p-6 sm:p-8 shadow-bento">
            {dictionary.quality.standards.map((standard, i) => (
              <li
                key={standard}
                className="flex items-baseline gap-4 border-b border-outline-variant/25 py-4 last:border-b-0"
              >
                <span className="font-mono text-[13px] text-on-surface-variant/70">{num(i + 1)}</span>
                <Check aria-hidden="true" className="size-4 shrink-0 self-center text-secondary font-bold" />
                <span className="max-w-3xl text-sm leading-7 text-on-surface">{standard}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 3. Inspection Protocol — Numbered steps */}
        <section className="mt-14">
          <SectionHeader index={index(3)} title={dictionary.quality.protocolTitle} />
          <ol className="mt-8 grid gap-4 md:grid-cols-2">
            {dictionary.quality.inspectionProtocol.map((step, i) => (
              <li
                key={step}
                className="bento-card bg-surface-container-lowest p-6 flex items-start gap-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed/80 text-on-primary-fixed-variant font-bold text-base shadow-xs">
                  {num(i + 1)}
                </span>
                <span className="text-sm leading-7 text-on-surface">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* 4. Integrity Policy + Checksum Strip */}
        <section className="mt-14">
          <SectionHeader index={index(4)} title={dictionary.quality.integrityTitle} />
          <figure className="mt-8 rounded-3xl border border-outline-variant/35 bg-surface-container-lowest p-8 shadow-bento md:p-10">
            <blockquote className="border-s-4 border-primary ps-6">
              <p className="max-w-3xl leading-8 text-on-surface text-base">{dictionary.quality.integrityPolicy}</p>
            </blockquote>
          </figure>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-outline-variant/35 bg-surface-container-low px-5 py-4 shadow-xs">
            <div>
              <p className="font-mono text-xs text-on-surface-variant/70">{dictionary.quality.checksumLabel}</p>
              <p className="mt-1 font-mono text-[11px] text-on-surface-variant font-semibold">
                <bdi>SHA-256 DIGEST: </bdi>
                <bdi dir="ltr">{pageChecksum}</bdi>
              </p>
            </div>
            <Link
              href="/rfq"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-on-primary shadow-terracotta hover:bg-primary-container transition-all"
            >
              <span>{isFa ? 'درخواست برگه آنالیز و استعلام' : 'Request Certified Assay'}</span>
              <ArrowLeft className="size-3.5 rtl:rotate-0 ltr:rotate-180" />
            </Link>
          </div>
        </section>

        {/* 5. Scientific Feed Guidelines & FAQ */}
        <section className="mt-14">
          <SectionHeader
            index={index(5)}
            title={isFa ? 'پرسش‌های متداول و راهنمای علمی نهاده‌ها' : 'Technical Guidelines & FAQ'}
            description={
              isFa
                ? 'پاسخ به مهم‌ترین ابهامات جیره‌نویسان و خریداران در خصوص شاخص‌های آزمایشگاهی و استانداردهای کیفی'
                : 'Scientific explanations for key laboratory assays and feed standards.'
            }
          />
          <div className="mt-8">
            <FeedFaq locale={locale} />
          </div>
        </section>
      </SiteFrame>
    </main>
  );
}
