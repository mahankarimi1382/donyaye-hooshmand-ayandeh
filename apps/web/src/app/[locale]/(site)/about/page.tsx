import type { Metadata } from 'next';
import { getDictionary, formatJalaliDate, toFarsiDigits } from '@karvan/i18n';
import { Notice, PageHeader, SectionHeader } from '@karvan/ui';
import { Building2, ShieldCheck, Truck, Scale, Award } from 'lucide-react';

import { SiteFrame, sectionIndex } from '../_components/site-chrome';

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

const HUB_CODES = ['THR', 'BIK', 'AMR'] as const;

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === 'fa';
  return {
    title: isFa ? 'درباره شرکت دنیای هوشمند آینده — مأموریت و چشم‌انداز' : 'About Donyaye Hooshmand Ayandeh',
    description: isFa
      ? 'آشنایی با تاریخچه، ارزش‌ها، مأموریت و زنجیره تأمین نهاده‌های دامی شرکت بازرگانی دنیای هوشمند آینده.'
      : 'Learn about Donyaye Hooshmand Ayandeh — animal feed procurement, quality testing, and supply chain network.',
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const dictionary = getDictionary(locale);
  const isFa = locale === 'fa';
  const index = (n: number) => sectionIndex(locale, n);
  const today = formatJalaliDate(new Date().toISOString(), isFa ? 'fa' : 'en');
  const num = (n: number) => (isFa ? toFarsiDigits(n) : String(n));

  const feedValues = [
    {
      title: isFa ? 'اصالت آزمایشگاهی و آنالیز مستند' : 'Laboratory Verified Quality',
      description: isFa
        ? 'تمامی اقلام عرضه شده بر پایه برگه آنالیز معتبر، سنجش پروتئین، رطوبت و کنترل دقیق سموم قارچی (آفلاتوکسین) توزیع می‌شوند. هیچ محموله‌ای بدون تاییدیه کیفی وارد زنجیره توزیع نمی‌گردد.'
        : 'All feed ingredients are distributed with verified laboratory assays, protein verification, and strict mycotoxin screening.',
    },
    {
      title: isFa ? 'پایداری تأمین در مبادی ورودی کشور' : 'Supply Stability at Major Ports',
      description: isFa
        ? 'حضور مؤثر در بنادر شمالی (امیرآباد، انزلی) برای غلات خزر و بنادر جنوبی (بندر امام خمینی) برای محموله‌های فله اقیانوسی، تضمین‌کننده تأمین بی‌وقفه کارخانجات خوراک دام و مزارع پرورشی است.'
        : 'Active presence at northern Caspian ports and southern ocean gateways ensures uninterrupted ingredient supply for livestock producers.',
    },
    {
      title: isFa ? 'تعهد قراردادی و شفافیت تجاری' : 'Contractual Integrity & Transparency',
      description: isFa
        ? 'پیش‌فاکتورها با اعتبار معین صادر شده و وزن‌کشی دقیق با باسکول دیجیتال و نظارت مستقل بازرسان بین‌المللی (SGS/Cotecna) انجام می‌گیرد.'
        : 'Official proformas carry strict validity windows and verified digital customs weighbridge tickets under independent inspection.',
    },
    {
      title: isFa ? 'مشاوره تخصصی و همراهی با جیره‌نویسان' : 'Nutritional & Technical Support',
      description: isFa
        ? 'ارائه اطلاعات تخصصی در خصوص ارزش غذایی، انرژی متابولیسمی و خصوصیات فیزیکی نهاده‌ها جهت بهبود راندمان خوراک و کاهش بهای تمام‌شده تولید.'
        : 'Providing technical nutrition data and amino acid profiles to optimize feed formulations and economic conversion ratios.',
    },
  ];

  const operationalHubs = [
    {
      code: 'THR',
      city: isFa ? 'تهران — ستاد مرکزی و امور بازرگانی' : 'Tehran — Corporate HQ',
      address: isFa ? 'خیابان ولی‌عصر، مرکز تجارت و بازرگانی، واحد کارشناسی نهاده‌ها' : 'Valiasr St, Commercial Center',
      hours: isFa ? 'شنبه تا چهارشنبه، ۸:۰۰ تا ۱۷:۰۰' : 'Sat-Wed, 08:00 to 17:00',
    },
    {
      code: 'BIK',
      city: isFa ? 'بندر امام خمینی — پایانه غلات جنوبی' : 'Bandar Imam — Southern Grain Terminal',
      address: isFa ? 'منطقه ویژه اقتصادی بندر امام خمینی، سیلوی ترانزیت و بارگیری غلات' : 'BIK Special Economic Zone, Grain Silos',
      hours: isFa ? 'فعالیت شبانه‌روزی ترخیص و بارگیری کشتی' : '24/7 Bulk Vessel Discharge',
    },
    {
      code: 'AMR',
      city: isFa ? 'بندر امیرآباد — هاب غلات حوزه خزر' : 'Amirabad Port — Caspian Hub',
      address: isFa ? 'منطقه ویژه اقتصادی بندر امیرآباد، سیلوهای غلات وارداتی و بوجاری' : 'Amirabad Port, Silo & Rail Depot',
      hours: isFa ? 'پذیرش واگن باری و بارگیری تریلی' : 'Rail & Truck Bulk Loading',
    },
  ];

  return (
    <main>
      <SiteFrame marginNote="DHA-ABOUT-1405" className="py-10">
        <PageHeader
          title={isFa ? 'درباره شرکت دنیای هوشمند آینده' : dictionary.about.title}
          meta={[
            { label: dictionary.common.meta.documentNumber, value: 'DHA-ABOUT-1405' },
            { label: dictionary.common.meta.date, value: today },
            { label: dictionary.common.meta.reference, value: isFa ? 'تأمین تخصصی نهاده‌های دامی' : 'Feed Sourcing & Logistics' },
          ]}
        />

        <p className="mt-8 max-w-3xl text-lg leading-8 text-ink-soft">
          {isFa
            ? 'شرکت «دنیای هوشمند آینده» با هدف ایجاد یک زنجیره تأمین شفاف، سریع و مبتنی بر دانش مهندسی در حوزه نهاده‌های خوراک دام و طیور کشور فعالیت می‌نماید. ما پلی پایدار میان تولیدکنندگان و تأمین‌کنندگان معتبر جهانی و کارخانجات خوراک، مزارع پرورش طیور و واحدهای دامداری صنعتی ایران هستیم.'
            : dictionary.about.intro}
        </p>

        {/* 1. Core Corporate Values */}
        <section className="mt-14">
          <SectionHeader
            index={index(1)}
            title={isFa ? 'اصول و ارزش‌های حاکم بر بازرگانی ما' : dictionary.about.valuesTitle}
          />
          <ol className="mt-8 grid gap-4 sm:grid-cols-2">
            {feedValues.map((value, i) => (
              <li
                key={value.title}
                className="bento-card bg-surface-container-lowest p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="size-8 rounded-xl bg-primary-fixed/80 text-on-primary-fixed-variant flex items-center justify-center font-bold text-xs">{num(i + 1)}</span>
                    <h3 className="font-bold text-on-surface text-base">{value.title}</h3>
                  </div>
                  <p className="mt-3 text-xs leading-6 text-on-surface-variant">{value.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* 2. Operational Hubs & Silos */}
        <section className="mt-14">
          <SectionHeader
            index={index(2)}
            title={isFa ? 'پایگاه‌های عملیاتی و هاب‌های بندری' : dictionary.about.officesTitle}
          />
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {operationalHubs.map((hub) => (
              <li
                key={hub.city}
                className="bento-card bg-surface-container-lowest p-6 flex flex-col gap-3"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <bdi className="font-mono text-xs font-bold text-primary bg-primary-fixed/40 px-2 py-0.5 rounded-full">{hub.code}</bdi>
                  <span className="flex-1 border-b border-dashed border-outline-variant/35" aria-hidden="true" />
                  <span className="font-bold text-on-surface text-sm">{hub.city}</span>
                </div>
                <p className="text-xs leading-6 text-on-surface-variant">{hub.address}</p>
                <p className="mt-auto border-t border-outline-variant/25 pt-3 font-mono text-[11px] text-on-surface-variant/70">
                  {hub.hours}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* 3. Credentials & Assurances */}
        <section className="mt-14">
          <SectionHeader
            index={index(3)}
            title={isFa ? 'تأییدیه‌ها و تعهدات اجرایی' : dictionary.about.credentialsTitle}
          />
          <ol className="mt-8 rounded-3xl border border-outline-variant/35 bg-surface-container-lowest p-6 sm:p-8 shadow-bento">
            {dictionary.about.credentials.map((credential, i) => (
              <li
                key={credential}
                className="flex items-baseline gap-4 border-b border-outline-variant/25 py-4 last:border-b-0"
              >
                <span className="font-mono text-[13px] text-on-surface-variant/70">{num(i + 1)}</span>
                <span className="text-sm leading-7 text-on-surface">{credential}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4">
            <Notice variant="info" tag={dictionary.common.tags.note}>
              {dictionary.about.credentialsNote}
            </Notice>
          </div>
        </section>
      </SiteFrame>
    </main>
  );
}
