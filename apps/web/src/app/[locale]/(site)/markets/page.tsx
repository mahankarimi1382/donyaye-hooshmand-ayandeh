import type { Metadata } from 'next';
import { getDictionary, formatJalaliDate } from '@karvan/i18n';
import { IncotermChip, PageHeader, SectionHeader } from '@karvan/ui';
import { Anchor, Ship, Train, Compass, CheckCircle2 } from 'lucide-react';

import { SiteFrame, sectionIndex } from '../_components/site-chrome';
import { CorridorsVisualizer } from '../_components/corridors-visualizer';
import { IncotermsMatrix } from '../_components/incoterms-matrix';

interface MarketsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: MarketsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === 'fa';
  return {
    title: isFa ? 'کریدورهای بازرگانی و مبادی ورودی نهاده‌ها' : 'Feed Trade Corridors & Entry Ports',
    description: isFa
      ? 'آشنایی با بنادر ورودی غلات، کریدورهای حمل فله خزر و خلیج فارس، اینکوترمز ۲۰۲۰ و ترانزیت ریلی نهاده‌های دامی.'
      : 'Maritime grain shipping corridors, Caspian & Persian Gulf bulk discharge ports, Incoterms 2020 rules, and rail transit.',
  };
}

export default async function MarketsPage({ params }: MarketsPageProps) {
  const { locale } = await params;
  const dictionary = getDictionary(locale);
  const isFa = locale === 'fa';
  const index = (n: number) => sectionIndex(locale, n);
  const today = formatJalaliDate(new Date().toISOString(), isFa ? 'fa' : 'en');

  const feedCorridors = [
    {
      codeOrigin: 'BRSSZ',
      codeDest: 'IRBKI',
      origin: isFa ? 'آمریکای جنوبی / بنادر سانتوس و پاراناگوا' : 'South America / Santos & Paranagua',
      destination: isFa ? 'بندر امام خمینی (پایانه غلات فله)' : 'Bandar Imam Khomeini Grain Terminal',
      description: isFa
        ? 'کریدور اصلی کشتی‌های پاناماکس و سوپراماکس حامل ذرت دامی و کنجاله سویای پلت‌شده با بازرسی در مبدأ و تخلیه پای اسکله.'
        : 'Primary ocean corridor for Panamax vessels carrying bulk feed yellow corn and pelleted soybean meal.',
    },
    {
      codeOrigin: 'RUAST',
      codeDest: 'IRAMR',
      origin: isFa ? 'حوزه خزر / آستراخان و ماخاچ‌قلعه روسیه' : 'Caspian Basin / Astrakhan & Makhachkala',
      destination: isFa ? 'بندر امیرآباد (سیلوهای غلات و اتصال ریلی)' : 'Amirabad Port Rail & Silo Terminal',
      description: isFa
        ? 'مسیر دریایی مستقیم غلات دامی (جو دامی و گندم) حوزه خزر همراه با بارگیری در واگن‌های باری سرپوشیده و حمل جاده‌ای.'
        : 'Direct maritime corridor for Russian feed barley and feed wheat with automated rail wagon loading.',
    },
    {
      codeOrigin: 'KZAKU',
      codeDest: 'IRANZ',
      origin: isFa ? 'قزاقستان / بندر آکتائو' : 'Kazakhstan / Aktau Port',
      destination: isFa ? 'بندر انزلی و نوشهر' : 'Anzali & Noshahr Ports',
      description: isFa
        ? 'تأمین جو دامی با عیار پروتئین بالا، بارگیری سریع و ترخیص گمرکی همراه با تاییدیه قرنطینه استانی.'
        : 'High-protein barley shipments with accelerated customs clearance and provincial quarantine inspections.',
    },
    {
      codeOrigin: 'IRBKI',
      codeDest: 'IRTHR',
      origin: isFa ? 'سیلوهای بنادر جنوبی و شمالی' : 'Coastal Hub Silos',
      destination: isFa ? 'مراکز توزیع تهران، اصفهان، خراسان و فارس' : 'Nationwide Distribution Feed Hubs',
      description: isFa
        ? 'ناوگان باری اختصاصی و حمل ریلی جهت انتقال مستقیم به کارخانجات خوراک دام و مزارع مرغداری و گاوداری‌های شیری.'
        : 'Dedicated freight fleet and rail logistics ensuring direct, scheduled delivery to animal nutrition plants.',
    },
  ];

  return (
    <main>
      <SiteFrame marginNote="DHA-MKT-1405" className="py-10">
        <PageHeader
          title={isFa ? 'کریدورهای تأمین و بنادر ورودی نهاده‌ها' : dictionary.markets.title}
          meta={[
            { label: dictionary.common.meta.documentNumber, value: 'DHA-MKT-1405' },
            { label: dictionary.common.meta.date, value: today },
            { label: dictionary.common.meta.reference, value: 'IRBKI · IRAMR · IRANZ' },
          ]}
        />

        <p className="mt-8 max-w-3xl text-lg leading-8 text-ink-soft">
          {isFa
            ? 'تأمین بهنگام نهاده‌های دامی مستلزم بهره‌گیری هم‌زمان از شبکه کریدورهای دریایی اقیانوسی، خطوط کشتیرانی دریای خزر و پایانه‌های ریلی مجهز به سیلوهای تخلیه مکانیزه است. شرکت دنیای هوشمند آینده با حضور مستقیم در گمرکات کلیدی، ریسک‌های خواب بار و دموراژ کشتی‌ها را مدیریت می‌نماید.'
            : dictionary.markets.intro}
        </p>

        {/* 1. Feed Shipping & Rail Corridors */}
        <section className="mt-14">
          <SectionHeader
            index={index(1)}
            title={isFa ? 'کریدورهای کشتیرانی و ترانزیت نهاده‌ها' : dictionary.markets.corridorsTitle}
            description={
              isFa
                ? 'مسیرهای فعال حمل فله دریایی و ترانزیت داخلی با بارنامه‌های مکتوب و نظارت ۲۴ ساعته'
                : 'Active maritime bulk lines and domestic freight routes with real-time bill of lading tracking.'
            }
          />
          <ol className="mt-8 grid gap-4">
            {feedCorridors.map((corridor) => (
              <li
                key={`${corridor.origin}-${corridor.destination}`}
                className="bento-card bg-surface-container-lowest p-6"
              >
                <div className="flex flex-wrap items-baseline gap-2 md:gap-3">
                  <bdi className="font-mono text-xs font-bold text-on-secondary-fixed-variant bg-secondary-fixed/60 px-2.5 py-0.5 rounded-full border border-secondary-fixed">{corridor.codeOrigin}</bdi>
                  <span className="font-bold text-on-surface">{corridor.origin}</span>
                  <span
                    aria-hidden="true"
                    className="mx-1 hidden min-w-24 flex-1 border-b border-dashed border-outline-variant/35 md:block"
                  />
                  <bdi className="font-mono text-xs font-bold text-on-primary-fixed-variant bg-primary-fixed/70 px-2.5 py-0.5 rounded-full border border-primary-fixed">{corridor.codeDest}</bdi>
                  <span className="font-bold text-on-surface">{corridor.destination}</span>
                </div>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">{corridor.description}</p>
              </li>
            ))}
          </ol>

          {/* Interactive Port Terminal Visualizer */}
          <div className="mt-8">
            <CorridorsVisualizer locale={locale} />
          </div>
        </section>

        {/* 2. Incoterms 2020 in Animal Feed Trading */}
        <section className="mt-14">
          <SectionHeader
            index={index(2)}
            title={isFa ? 'اصطلاحات بازرگانی بین‌المللی (Incoterms 2020) در مبادلات نهاده‌ها' : dictionary.markets.incotermsTitle}
            description={
              isFa
                ? 'تعیین دقیق نقطه انتقال ریسک، هزینه بیمه، کرایه حمل دریایی و مسئولیت ترخیص در پیش‌فاکتورهای رسمی شرکت'
                : dictionary.markets.incotermsIntro
            }
          />

          {/* Interactive Incoterms Matrix */}
          <div className="mt-8">
            <IncotermsMatrix locale={locale} />
          </div>

          <ul className="mt-8">
            {dictionary.markets.incotermGlossary.map((term) => (
              <li
                key={term.code}
                className="grid gap-2 border-t border-rule py-5 last:border-b md:grid-cols-[10rem_1fr] md:items-baseline"
              >
                <div className="flex items-center gap-3">
                  <IncotermChip term={term.code} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-ink">{term.title}</span>
                  <span className="max-w-3xl text-sm leading-7 text-ink-soft">{term.description}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </SiteFrame>
    </main>
  );
}
