import type { Metadata } from 'next';
import { getDictionary, formatJalaliDate, toFarsiDigits } from '@karvan/i18n';
import { PageHeader, Perforation, SectionHeader } from '@karvan/ui';
import { Ship, Train, Warehouse, ShieldCheck, ArrowLeft } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { SiteFrame, sectionIndex, linkButtonClasses } from '../_components/site-chrome';
import { FeedCalculator } from '../_components/feed-calculator';

interface ServicesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ServicesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = getDictionary(locale);
  const isFa = locale === 'fa';
  return {
    title: isFa ? 'خدمات تأمین، انبارداری بندری و لجستیک نهاده‌های دامی' : dictionary.services.title,
    description: isFa
      ? 'خدمات زنجیره تأمین غلات دامی، تخلیه پای اسکله در بنادر خزر و خلیج فارس، نمونه‌برداری آزمایشگاهی و حمل ریلی به کارخانجات خوراک دام.'
      : dictionary.services.intro,
  };
}

export default async function ServicesPage({ params }: ServicesPageProps) {
  const { locale } = await params;
  const dictionary = getDictionary(locale);
  const isFa = locale === 'fa';
  const index = (n: number) => sectionIndex(locale, n);
  const today = formatJalaliDate(new Date().toISOString(), isFa ? 'fa' : 'en');

  const capabilities = [
    {
      icon: Ship,
      title: isFa ? 'تخلیه مکانیزه پای کشتی در بنادر' : 'Port Bulk Vessel Discharge',
      desc: isFa
        ? 'تخلیه هم‌زمان کشتی‌های فله‌بر با دستگاه‌های مکنده نیوماتیک جهت به حداقل رساندن شکستگی دانه و جلوگیری از افت کیفی.'
        : 'Automated pneumatic discharge minimizing broken kernels and moisture exposure.',
    },
    {
      icon: Warehouse,
      title: isFa ? 'سیلوداری و انبارش استاندارد' : 'Mechanized Silo & Storage',
      desc: isFa
        ? 'نگهداری غلات و کنجاله‌ها در سیلوهای مجهز به سیستم‌های هوادهی، پایش دما و کنترل رطوبت در هاب‌های بندری امیرآباد و بندر امام.'
        : 'Climate-controlled silos with aeration and temperature monitoring in northern & southern hubs.',
    },
    {
      icon: Train,
      title: isFa ? 'ترانزیت ریلی و ناوگان جاده‌ای' : 'Rail & Road Intermodal Transport',
      desc: isFa
        ? 'بارگیری مستقیم از سیلو به واگن‌های باری مخزن‌دار و ارسال برنامه‌ریزی‌شده به کارخانجات خوراک دام در سراسر کشور.'
        : 'Direct hopper rail loading and certified road fleet dispatch directly to manufacturing plants.',
    },
    {
      icon: ShieldCheck,
      title: isFa ? 'تسهیل ترخیص و آزمون‌های قرنطینه' : 'Quarantine & Fast-Track Customs',
      desc: isFa
        ? 'همکاری با آزمایشگاه‌های همکار دامپزشکی، صدور گواهی عدم آلودگی مایکوتوکسین و تسریع فرایند ترخیص کالا.'
        : 'Expedited veterinary clearance, aflatoxin screening, and certified customs release protocols.',
    },
  ];

  return (
    <main>
      <SiteFrame marginNote="DHA-SRV-1405" className="py-10">
        <PageHeader
          title={isFa ? 'خدمات زنجیره تأمین و لجستیک نهاده‌ها' : dictionary.services.title}
          meta={[
            { label: dictionary.common.meta.documentNumber, value: 'DHA-SRV-1405' },
            { label: dictionary.common.meta.date, value: today },
            { label: dictionary.common.meta.reference, value: 'BULK · SILO · LOGISTICS' },
          ]}
        />

        <p className="mt-8 max-w-3xl text-lg leading-8 text-ink-soft">
          {isFa
            ? 'شرکت دنیای هوشمند آینده خدمات یکپارچه زنجیره تأمین نهاده‌های دامی را از نقطه بارگیری در مبادی تولید جهانی تا تحویل درب سیلوهای کارخانجات خوراک دام، با استانداردهای مکتوب و پایش زمان‌بندی دقیق به انجام می‌رساند.'
            : dictionary.services.intro}
        </p>

        {/* 1. Infrastructure & Capabilities Grid */}
        <section className="mt-14">
          <SectionHeader
            index={index(1)}
            title={isFa ? 'زیرساخت‌های لجستیک و پایانه‌ها' : 'Logistics Infrastructure & Capabilities'}
            description={
              isFa
                ? 'توانمندی‌های سخت‌افزاری و نرم‌افزاری شرکت در انبارداری، حفظ ارزش تغذیه‌ای و حمل بهنگام'
                : 'Advanced terminal equipment, bulk discharge facilities, and intermodal transport capabilities.'
            }
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <div
                  key={cap.title}
                  className="bento-card bg-surface-container-lowest p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-primary-fixed/80 text-on-primary-fixed-variant shadow-xs">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-on-surface">{cap.title}</h3>
                    <p className="mt-2 text-xs leading-6 text-on-surface-variant">{cap.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 2. Structured Services List */}
        <section className="mt-14">
          <SectionHeader
            index={index(2)}
            title={isFa ? 'فهرست خدمات تجاری و تحویل‌شدنی‌ها' : dictionary.services.title}
            description={
              isFa
                ? 'مراحل اجرایی و تعهدات مکتوب هر خدمت از نقطه استعلام تا تسویه حساب و تحویل'
                : dictionary.services.intro
            }
          />
          <ol className="mt-8">
            {dictionary.services.items.map((service, i) => (
              <li key={service.slug}>
                {i > 0 && <Perforation />}
                <Link
                  href={`/services/${service.slug}`}
                  className="group grid gap-3 py-8 md:grid-cols-[4rem_1fr_12rem] md:items-baseline"
                >
                  <span className="font-mono text-[13px] text-ink-faint">{index(i + 1)}</span>
                  <span className="flex flex-col gap-1.5">
                    <span className="font-display text-2xl text-ink group-hover:text-harbor md:text-3xl transition-colors">
                      {service.title}
                    </span>
                    <span className="max-w-2xl text-sm leading-7 text-ink-soft">{service.summary}</span>
                    <span className="mt-1 font-mono text-[13px] text-ink-faint">
                      {dictionary.services.deliverablesTitle}:{' '}
                      {locale === 'fa' ? toFarsiDigits(service.deliverables.length) : service.deliverables.length}
                      {' · '}
                      {dictionary.services.stepsTitle}:{' '}
                      {locale === 'fa' ? toFarsiDigits(service.steps.length) : service.steps.length}
                    </span>
                  </span>
                  <bdi className="font-mono text-[13px] text-ink-faint group-hover:text-harbor">
                    {service.slug.toUpperCase()}
                  </bdi>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* 3. Interactive Feed Tonnage Calculator */}
        <section className="mt-14">
          <SectionHeader
            index={index(3)}
            title={isFa ? 'محاسبه‌گر تخصصی تناژ نهاده‌ها و برآورد ناوگان باری' : 'Feed Tonnage & Freight Fleet Estimator'}
            description={
              isFa
                ? 'ابزار محاسباتی ویژه کارخانجات خوراک، مزارع مرغداری و گاوداری‌های شیری جهت برآورد دقیق تناژ مصرفی ذرت، کنجاله سویا و مکمل‌ها بر پایه ظرفیت گله.'
                : 'Interactive tonnage estimation for broiler, layer, and dairy operations to plan bulk procurement and freight logistics.'
            }
          />
          <div className="mt-8">
            <FeedCalculator locale={locale} />
          </div>
        </section>

        {/* 4. Inquiry CTA Band */}
        <section className="mt-14">
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-primary p-8 text-on-primary shadow-terracotta md:p-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-on-primary">
                {isFa ? 'نیاز به تأمین یا خدمات لجستیک دارید؟' : 'Ready to Procure Feed Ingredients?'}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-7 text-primary-fixed">
                {isFa
                  ? 'مشخصات نهاده، تناژ مورد نظر و محل تحویل را در سامانه استعلام ثبت نمایید تا پیش‌فاکتور رسمی ظرف ۲ ساعت کاری برای شما صادر گردد.'
                  : 'Submit your requirements via our official RFQ portal for a binding quotation within 2 business hours.'}
              </p>
            </div>
            <Link
              href="/rfq"
              className="inline-flex items-center gap-2 rounded-full bg-primary-fixed hover:bg-primary-fixed-dim text-on-primary-fixed-variant font-bold px-7 py-3 text-sm transition-all shadow-xs shrink-0"
            >
              <span>{isFa ? 'شروع استعلام نهاده‌ها' : dictionary.nav.rfq}</span>
              <span className="rtl:rotate-180">←</span>
            </Link>
          </div>
        </section>
      </SiteFrame>
    </main>
  );
}
