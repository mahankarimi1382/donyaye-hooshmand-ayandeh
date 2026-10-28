import type { Metadata } from 'next';
import { getDictionary, formatJalaliDate } from '@karvan/i18n';
import { PageHeader, SectionHeader } from '@karvan/ui';
import { ArrowLeft, MessageSquare, PhoneCall } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { SiteFrame } from '../_components/site-chrome';
import { FaqAccordion, type FaqCategory } from './faq-accordion';

interface FaqPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: FaqPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === 'fa';
  return {
    title: isFa ? 'پرسش‌های متداول تأمین و خرید نهاده‌های دامی' : 'Frequently Asked Questions (FAQ)',
    description: isFa
      ? 'پاسخ به سوالات پرتکرار خریداران در خصوص نحوه استعلام، تخصیص سهمیه بازارگاه، استانداردهای آزمایشگاهی SGS و تحویل در سیلوهای بنادر.'
      : 'Frequently asked questions regarding animal feed supply, port discharge, quality assays, and payment terms.',
  };
}

export default async function FaqPage({ params }: FaqPageProps) {
  const { locale } = await params;
  const dictionary = getDictionary(locale);
  const isFa = locale === 'fa';
  const lang = isFa ? 'fa' : 'en';
  const today = formatJalaliDate(new Date().toISOString(), lang);

  const faqCategories: FaqCategory[] = [
    {
      title: { fa: '۱. شرایط استعلام و خرید نهاده‌ها', en: '1. Sourcing & Procurement Terms' },
      items: [
        {
          id: 'faq-1',
          question: {
            fa: 'فرآیند ثبت استعلام و دریافت پیش‌فاکتور نهاده‌ها چگونه است؟',
            en: 'What is the procedure for requesting a quotation and proforma?',
          },
          answer: {
            fa: 'شما می‌توانید از طریق فرم تماس و مشاوره وب‌سایت یا تماس تلفنی با واحد بازرگانی، تناژ، مشخصات نهاده و بندر مقصد را اعلام نمایید. کارشناسان ما ظرف کمتر از ۲ ساعت کاری پس از ارزیابی ظرفیت‌های انبارش، پیش‌فاکتور رسمی ممهور را برای شما ارسال خواهند کرد.',
            en: 'You can submit your required volume, commodity specifications, and delivery destination via our contact form or direct phone desk. Our procurement specialists issue an official proforma within 2 business hours.',
          },
        },
        {
          id: 'faq-2',
          question: {
            fa: 'حداقل مقدار سفارش (MOQ) برای غلات و کنجاله‌ها چقدر است؟',
            en: 'What is the Minimum Order Quantity (MOQ)?',
          },
          answer: {
            fa: 'حداقل تناژ سفارش برای محموله‌های فله پای اسکله (ذرت، جو، کنجاله سویا) به صورت بار تریلی معادل ۲۵ تن متری می‌باشد. برای سفارشات مکمل‌ها و اسیدهای آمینه بسته‌بندی‌شده (مانند DCP و لیزین)، حداقل سفارش ۱ الی ۵ تن تعیین شده است.',
            en: 'The standard minimum volume for bulk grain shipments ex-quay (corn, barley, soybean meal) is one full truckload (approx. 25 MT). For packaged additives such as DCP and amino acids, MOQ ranges from 1 to 5 MT.',
          },
        },
        {
          id: 'faq-3',
          question: {
            fa: 'آیا امکان عقد قراردادهای تأمین بلندمدت سالانه وجود دارد؟',
            en: 'Can we establish long-term annual supply contracts?',
          },
          answer: {
            fa: 'بله؛ برای کارخانجات صنعتی تولید خوراک دام و مزارع پرورشی بزرگ، امکان انعقاد قراردادهای تأمین منظم ماهانه بر اساس جدول زمان‌بندی ورود کشتی‌ها و تضمین اولویت بارگیری از سیلوها وجود دارد.',
            en: 'Yes. For industrial feed manufacturers and large-scale poultry/dairy operations, we execute structured monthly supply contracts aligned with vessel arrival schedules and guaranteed loading priority.',
          },
        },
      ],
    },
    {
      title: { fa: '۲. کنترل کیفیت و آنالیز آزمایشگاهی', en: '2. Quality Assurance & Laboratory Assays' },
      items: [
        {
          id: 'faq-4',
          question: {
            fa: 'تاییدیه‌های آزمایشگاهی و گواهی سلامت کالا چگونه صادر می‌شود؟',
            en: 'How are certified laboratory assays and health clearances issued?',
          },
          answer: {
            fa: 'تمامی محموله‌های وارداتی پیش از ترخیص و خروج از بندر، توسط شرکت‌های مستقل بین‌المللی (نظیر SGS و Cotecna) و آزمایشگاه‌های همکار سازمان دامپزشکی کشور نمونه‌برداری می‌شوند. گواهی رسمی حاوی درصد پروتئین خام، رطوبت، اوره‌آز و سنجش آفلاتوکسین به همراه هر بارنامه تحویل خریدار می‌گردد.',
            en: 'Every imported shipment is sampled and tested by accredited international inspection agencies (e.g. SGS, Cotecna) and approved veterinary laboratories before customs release. Verified certificates detailing crude protein, moisture, urease index, and aflatoxin are attached to all shipping manifests.',
          },
        },
        {
          id: 'faq-5',
          question: {
            fa: 'حد مجاز آفلاتوکسین و سموم قارچی در ذرت دامی چقدر است؟',
            en: 'What are the permissible aflatoxin limits in feed corn?',
          },
          answer: {
            fa: 'مطابق استانداردهای ملی و دستورالعمل‌های سازمان دامپزشکی کل کشور، حداکثر مجاز آفلاتوکسین B1 در ذرت دامی ۲۰ ppb می‌باشد. شرکت دنیای هوشمند آینده با نمونه‌برداری دوره‌ای، محموله‌های دارای حد مجاز و گواهی عدم آلودگی مایکوتوکسین را تضمین می‌نماید.',
            en: 'Per national veterinary guidelines, the maximum permissible ceiling for Aflatoxin B1 in feed corn is strictly 20 ppb. We enforce rigorous chromatographic HPLC screening to ensure complete toxicological safety.',
          },
        },
        {
          id: 'faq-6',
          question: {
            fa: 'در صورت هرگونه مغایرت در باسکول یا آنالیز کالا، چه اقدامی انجام می‌شود؟',
            en: 'What is the recourse procedure for weight or assay discrepancies?',
          },
          answer: {
            fa: 'وزن مبنا بر اساس قبوض رسمی باسکول دیجیتال گمرکی مبدأ تعیین می‌شود و تلورانس طبیعی تا ۰٫۵٪ پذیرفته است. در صورت کسری بالاتر از حد مجاز، صورت‌جلسه رسمی با حضور نماینده شرکت حمل تنظیم شده و مازاد کسر شده در فاکتور نهایی تعدیل و عودت داده می‌شود.',
            en: 'Cargo weight is determined by certified customs digital weighbridges with an allowable moisture tolerance of 0.5%. Any verified deficit exceeding this margin is documented via official surveyor inspection and credited back in the final settlement invoice.',
          },
        },
      ],
    },
    {
      title: { fa: '۳. لجستیک، پایانه‌ها و حمل', en: '3. Logistics, Ports & Dispatch' },
      items: [
        {
          id: 'faq-7',
          question: {
            fa: 'تخلیه و بارگیری نهاده‌ها از کدام بنادر کشور انجام می‌گیرد؟',
            en: 'Which ports handle bulk vessel discharge and loading?',
          },
          answer: {
            fa: 'پایانه اصلی جنوبی ما در مجتمع بندری بندر امام خمینی (ره) واقع است که کشتی‌های اقیانوسی فله‌بر (ذرت برزیل و سویا) در آنجا پهلو می‌گیرند. در شمال کشور نیز پایانه اختصاصی سیلوهای غلات بندر امیرآباد و بندر انزلی مسئولیت ترخیص نهاده‌های حوزه خزر (جو و گندم دامی) را بر عهده دارند.',
            en: 'Our primary southern gateway is Bandar Imam Khomeini (BIK), handling ocean-going bulk carriers from South America. In the north, our dedicated terminal at Amirabad Port manages Caspian grain corridors with direct rail integration.',
          },
        },
        {
          id: 'faq-8',
          question: {
            fa: 'آیا امکان بارگیری مستقیم واگن‌های ریلی وجود دارد؟',
            en: 'Is direct rail hopper loading available?',
          },
          answer: {
            fa: 'بله؛ سیلوهای غلات بندر امیرآباد به شبکه سراسری راه‌آهن متصل هستند و امکان بارگیری مستقیم واگن‌های باری فله‌بر سرپوشیده جهت ارسال باصرفه به کارخانجات خوراک در استان‌های مرکزی و شرقی فراهم است.',
            en: 'Yes. The grain silos at Amirabad Port feature direct national railway siding access, allowing automated hopper wagon loading for cost-effective freight across central and eastern provinces.',
          },
        },
      ],
    },
    {
      title: { fa: '۴. امور مالی، فاکتور و قوانین بازرگانی', en: '4. Commercial, Invoicing & Financial Terms' },
      items: [
        {
          id: 'faq-9',
          question: {
            fa: 'آیا فاکتور رسمی معتبر در سامانه مودیان صادر می‌شود؟',
            en: 'Are official tax invoices issued in compliance with statutory systems?',
          },
          answer: {
            fa: 'بله؛ کلیه معاملات شرکت دنیای هوشمند آینده به صورت ۱۰۰٪ رسمی، همراه با صورتحساب الکترونیکی ثبت‌شده در سامانه مودیان مالیاتی و سامانه بازارگاه جهاد کشاورزی صادر می‌گردد.',
            en: 'Yes. All transactions executed by Donyaye Hooshmand Ayandeh are 100% compliant with the National Taxpayers Portal and the official Bazargah agricultural settlement network.',
          },
        },
        {
          id: 'faq-10',
          question: {
            fa: 'ضوابط تحویل طبق قواعد اینکوترمز ۲۰۲۰ چگونه است؟',
            en: 'Which Incoterms 2020 rules are supported?',
          },
          answer: {
            fa: 'معاملات عمدتاً بر پایه ترم FOB (پای اسکله بنادر بارگیری مبدأ)، CFR (تحویل روی کشتی در بنادر ایران) و تحویل پای سیلو (Ex-Silo) با احتساب هزینه‌های ترخیص و باسکول انجام می‌گیرد.',
            en: 'Commercial transactions are executed under FOB origin ports, CFR Iranian maritime ports, or cleared Ex-Silo delivery terms with certified weighbridge verification.',
          },
        },
      ],
    },
  ];

  return (
    <main>
      <SiteFrame marginNote="DHA-FAQ-1405" className="py-10">
        <PageHeader
          title={isFa ? 'پرسش‌های متداول بازرگانی نهاده‌ها' : 'Frequently Asked Questions (FAQ)'}
          meta={[
            { label: dictionary.common.meta.documentNumber, value: 'DHA-FAQ-1405' },
            { label: dictionary.common.meta.date, value: today },
            { label: isFa ? 'دسته‌بندی' : 'Classification', value: isFa ? 'راهنمای جامع مشتریان' : 'Customer Guidelines' },
          ]}
        />

        <p className="mt-8 max-w-3xl text-lg leading-8 text-on-surface-variant">
          {isFa
            ? 'پاسخ به سوالات متداول مدیران خرید کارخانجات خوراک دام، مسئولان فارم‌های پرورشی و همکاران بازرگانی در خصوص شرایط تحویل، کیفیت آزمایشگاهی، ظرفیت پایانه‌ها و فرآیند عقد قرارداد.'
            : 'Clear answers to common questions regarding feed procurement, laboratory testing, port terminal handling, and commercial terms.'}
        </p>

        {/* FAQ Accordion Component */}
        <div className="mt-12 max-w-4xl">
          <FaqAccordion categories={faqCategories} locale={locale} />
        </div>

        {/* Still Have Questions CTA */}
        <section className="mt-16 max-w-4xl">
          <div className="bento-card-static bg-surface-container-lowest p-8 sm:p-10 border border-outline-variant/35 shadow-bento flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="font-display text-xl font-bold text-on-surface">
                {isFa ? 'هنوز پاسخ سوال خود را نیافته‌اید؟' : 'Still Have Questions?'}
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant max-w-lg">
                {isFa
                  ? 'کارشناسان بازرگانی و تغذیه دام شرکت در تمامی ساعات کاری آماده ارائه مشاوره‌های دقیق هستند.'
                  : 'Our commercial and animal nutrition specialists are available to answer your technical questions.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs sm:text-sm font-semibold text-on-primary shadow-terracotta hover:bg-primary-container transition-all"
              >
                <span>{isFa ? 'ارسال پیام به واحد فروش' : 'Contact Us'}</span>
                <ArrowLeft className="size-4 rtl:rotate-0 ltr:rotate-180" />
              </Link>
            </div>
          </div>
        </section>
      </SiteFrame>
    </main>
  );
}
