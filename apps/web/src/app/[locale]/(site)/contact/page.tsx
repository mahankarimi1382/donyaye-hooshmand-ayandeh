import type { Metadata } from 'next';
import { getDictionary, formatJalaliDate } from '@karvan/i18n';
import { PageHeader, SectionHeader } from '@karvan/ui';

import { SiteFrame, sectionIndex } from '../_components/site-chrome';
import { ContactForm } from '../_components/contact-form';

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

const OFFICE_CODES = ['THR', 'DXB', 'IST'] as const;

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = getDictionary(locale);
  return { title: dictionary.contact.title, description: dictionary.contact.intro };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  const dictionary = getDictionary(locale);
  const isFa = locale === 'fa';
  const lang = isFa ? 'fa' : 'en';
  const index = (n: number) => sectionIndex(locale, n);
  const today = formatJalaliDate(new Date().toISOString(), lang);

  const corporateOffices = [
    {
      code: 'THR',
      city: isFa ? 'تهران — ستاد مرکزی و امور بازرگانی' : 'Tehran — Corporate HQ',
      address: isFa ? 'خیابان ولیعصر، بالاتر از میدان ونک، برج نگار، طبقه ۱۵، واحد ۴' : 'Valiasr St, Above Vanak Sq, Negar Tower, Fl 15',
      phone: '۰۲۱-۸۸۸۸۸۸۸۸',
      hours: isFa ? 'شنبه تا چهارشنبه، ۸:۰۰ تا ۱۷:۰۰' : 'Sat-Wed, 08:00 to 17:00',
    },
    {
      code: 'BIK',
      city: isFa ? 'بندر امام خمینی — پایانه غلات فله (جنوب)' : 'Bandar Imam — Southern Bulk Terminal',
      address: isFa ? 'منطقه ویژه اقتصادی بندرامام، محوطه سیلوهای غلات فله (اسکله ۳۴)' : 'BIK Special Economic Zone, Silo Quay 34',
      phone: '۰۶۱-۵۲۲۲۲۲۲۲',
      hours: isFa ? 'فعالیت شبانه‌روزی تخلیه پای اسکله و باسکول' : '24/7 Bulk Discharge & Weighbridge',
    },
    {
      code: 'AMR',
      city: isFa ? 'بندر امیرآباد — هاب غلات حوزه خزر (شمال)' : 'Amirabad Port — Caspian Grain Hub',
      address: isFa ? 'منطقه ویژه اقتصادی بندر امیرآباد، انبار اختصاصی ترخیص نهاده‌ها و اتصال ریلی' : 'Amirabad Special Economic Zone, Silo & Rail Depot',
      phone: '۰۱۱-۳۴۴۴۴۴۴۴',
      hours: isFa ? 'پذیرش واگن باری و بارگیری تریلی، ۸:۰۰ تا ۱۸:۰۰' : 'Rail & Truck Loading, 08:00 to 18:00',
    },
  ];

  return (
    <main>
      <SiteFrame marginNote="DHA-CTC-1405" className="py-10">
        <PageHeader
          title={isFa ? 'تماس با ما و دفاتر بازرگانی' : dictionary.contact.title}
          meta={[
            { label: dictionary.common.meta.documentNumber, value: 'DHA-CTC-1405' },
            { label: dictionary.common.meta.date, value: today },
            { label: isFa ? 'پاسخگویی مستقیم' : 'Direct Line', value: '۰۲۱-۸۸۸۸۸۸۸۸' },
          ]}
        />

        <p className="mt-8 max-w-3xl text-lg leading-8 text-on-surface-variant">
          {isFa
            ? 'جهت دریافت مشاوره فنی جیره‌نویسی، اطلاع از آخرین کشف قیمت روز نهاده‌ها در بنادر امام و امیرآباد، یا هماهنگی زمان‌بندی بارگیری از سیلوها، با کارشناسان شرکت دنیای هوشمند آینده در ارتباط باشید.'
            : dictionary.contact.intro}
        </p>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section>
            <SectionHeader
              index={index(1)}
              title={isFa ? 'ارسال پیام یا درخواست مشاوره خرید' : dictionary.contact.formTitle}
              description={isFa ? 'فرم زیر را تکمیل فرمایید؛ کارشناس مربوطه در اسرع وقت با شما تماس خواهد گرفت.' : undefined}
            />
            <div className="mt-8 bento-card-static bg-surface-container-lowest p-6 sm:p-8 shadow-bento">
              <ContactForm dictionary={dictionary} />
            </div>
          </section>

          <aside className="space-y-8">
            <div>
              <SectionHeader index={index(2)} title={isFa ? 'دفاتر ستادی و پایانه‌ها' : dictionary.contact.officesTitle} />
              <ul className="mt-8 flex flex-col gap-4">
                {corporateOffices.map((office) => (
                  <li
                    key={office.city}
                    className="bento-card bg-surface-container-lowest p-6 flex flex-col gap-2"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <bdi className="font-mono text-xs font-bold text-on-primary-fixed-variant bg-primary-fixed/60 px-2.5 py-0.5 rounded-full">{office.code}</bdi>
                      <span className="font-bold text-on-surface text-sm">{office.city}</span>
                    </div>
                    <p className="text-xs sm:text-sm leading-6 text-on-surface-variant mt-1">{office.address}</p>
                    <div className="border-t border-outline-variant/25 pt-3 mt-1 flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-primary" dir="ltr">{office.phone}</span>
                      <span className="font-mono text-[11px] text-on-surface-variant/70">{office.hours}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Direct WhatsApp Card */}
            <div className="bento-card-static bg-surface-container-lowest p-6 shadow-xs border border-outline-variant/35 space-y-3">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-secondary animate-pulse" />
                <h4 className="text-sm font-bold text-on-surface">مشاوره سریع در واتساپ</h4>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                امکان ارسال سریع مدارک، استعلام ظرفیت و برگه آنالیز روزانه در پیام‌رسان واتساپ.
              </p>
              <a
                href="https://wa.me/989128888888"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full bg-secondary text-on-secondary font-semibold text-xs shadow-xs hover:bg-secondary-container hover:text-on-secondary-container transition-all"
              >
                <span>ارتباط مستقیم در واتساپ</span>
                <span className="font-mono" dir="ltr">+98 912 888 8888</span>
              </a>
            </div>
          </aside>
        </div>
      </SiteFrame>
    </main>
  );
}
