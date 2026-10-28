import type { Metadata } from 'next';
import { getDictionary, formatJalaliDate } from '@karvan/i18n';
import { KpiTile, LedgerTable, Notice, Perforation, SectionHeader, StampBadge } from '@karvan/ui';
import type { LedgerColumnDef } from '@karvan/ui';

import { Link } from '@/i18n/navigation';
import { getStore } from '@/lib/store';

import { linkButtonClasses, sectionIndex, unitShort } from './_components/site-chrome';
import { HeroSearchHub } from './_components/hero-search-hub';
import { FeaturedCommoditiesGrid } from './_components/featured-commodities-grid';

interface SiteHomePageProps {
  params: Promise<{ locale: string }>;
}

interface FeaturedRow {
  id: string;
  hsCode: string;
  name: string;
  categoryLabel: string;
  moq: string;
  price: string;
}

export async function generateMetadata({ params }: SiteHomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = getDictionary(locale);
  return {
    title: { absolute: `${dictionary.common.brandName} — ${dictionary.common.tagline}` },
    description: dictionary.home.hero.subtitle,
  };
}

export default async function SiteHomePage({ params }: SiteHomePageProps) {
  const { locale } = await params;
  const isFa = locale === 'fa';
  const dictionary = getDictionary(locale);
  const index = (n: number) => sectionIndex(locale, n);
  const today = formatJalaliDate(new Date().toISOString(), locale === 'fa' ? 'fa' : 'en');

  const featured = getStore()
    .listProducts()
    .filter((product) => product.featured)
    .slice(0, 4);

  const featuredRows: FeaturedRow[] = featured.map((product) => ({
    id: product.id,
    hsCode: product.hsCode,
    name: product.name[locale === 'fa' ? 'fa' : 'en'],
    categoryLabel: dictionary.products.categoryLabels[product.category],
    moq: `${product.moqQuantity} ${unitShort(product.moqUnit)}`,
    price: product.priceIndication[locale === 'fa' ? 'fa' : 'en'],
  }));

  const featuredColumns: ReadonlyArray<LedgerColumnDef<FeaturedRow>> = [
    {
      key: 'hsCode',
      header: <bdi>HS</bdi>,
      mono: true,
      width: '7rem',
      render: (row) => <bdi>{row.hsCode}</bdi>,
    },
    {
      key: 'name',
      header: dictionary.products.tableHeaders.product,
      render: (row) => (
        <Link href={`/products/${row.id}`} className="group flex flex-col gap-0.5">
          <span className="font-medium text-ink group-hover:text-harbor">{row.name}</span>
          <span className="text-[13px] text-ink-faint">{row.categoryLabel}</span>
        </Link>
      ),
    },
    {
      key: 'moq',
      header: dictionary.products.tableHeaders.moq,
      mono: true,
      numeric: true,
      render: (row) => <bdi>{row.moq}</bdi>,
    },
    {
      key: 'price',
      header: dictionary.products.tableHeaders.price,
      render: (row) => row.price,
    },
  ];

  return (
    <main className="w-full">
      {/* ================= HERO SECTION (WARM EDITORIAL BENTO GRID) ================= */}
      <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 py-6 lg:py-10">
        <div className="relative rounded-[2.5rem] bg-surface-container-lowest/95 border border-outline-variant/35 p-6 lg:p-10 shadow-hero overflow-hidden">
          {/* Ambient Glow Accents */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary-fixed/35 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-secondary-fixed/40 blur-3xl pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Right Narrative Column (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between items-start text-right space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container border border-outline-variant/40 text-on-surface font-semibold text-xs shadow-xs">
                  <span className="size-2 rounded-full bg-primary animate-pulse" />
                  <span>تأمین مستقیم غلات و کنجاله‌های پروتئینی بنادر کشور</span>
                </div>

                <h1 className="font-display text-3xl sm:text-5xl lg:text-[46px] text-on-surface font-extrabold tracking-tight leading-[1.3]">
                  تأمین بی‌واسطه نهاده‌های دامی با{' '}
                  <span className="relative inline-block text-primary underline decoration-primary-fixed underline-offset-8">
                    آنالیز آزمایشگاهی معتبر
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-xl">
                  توزیع تخصصی غلات خوراکی دام و طیور، کنجاله سویا و مکمل‌های فسفاته با گواهی بازرسی بین‌المللی، ترخیص پایدار و بارگیری روزانه از سیلوهای بندر امام خمینی (ره) و بندر امیرآباد.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-primary text-on-primary font-semibold text-sm shadow-terracotta hover:bg-primary-container transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>{isFa ? 'درخواست مشاوره و استعلام' : 'Consultation & Inquiry'}</span>
                  <span className="rtl:rotate-180 text-xs">←</span>
                </Link>

                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-surface-container border border-outline-variant/35 text-on-surface font-semibold text-sm hover:bg-surface-container-high transition-all duration-200"
                >
                  <span>{isFa ? 'کاتالوگ جامع نهاده‌ها' : 'View Catalog'}</span>
                </Link>
              </div>

              {/* Search Hub */}
              <div className="w-full">
                <HeroSearchHub locale={locale} />
              </div>

              {/* Inline Trust Strip */}
              <div className="w-full pt-4 border-t border-outline-variant/25 flex flex-wrap items-center gap-3 text-xs font-medium text-on-surface-variant">
                <div className="flex items-center gap-1.5 bg-surface-container/70 px-3.5 py-1.5 rounded-full border border-outline-variant/20">
                  <span className="size-2 rounded-full bg-secondary"></span>
                  <span>گواهی بازرسی بین‌المللی SGS & IGI</span>
                </div>
                <div className="flex items-center gap-1.5 bg-surface-container/70 px-3.5 py-1.5 rounded-full border border-outline-variant/20">
                  <span className="size-2 rounded-full bg-primary"></span>
                  <span>کنترل آفلاتوکسین و سموم قارچی (&lt;20 ppb)</span>
                </div>
                <div className="flex items-center gap-1.5 bg-surface-container/70 px-3.5 py-1.5 rounded-full border border-outline-variant/20">
                  <span className="size-2 rounded-full bg-tertiary"></span>
                  <span>تسویه رسمی ریالی طبق اینکوترمز ۲۰۲۰</span>
                </div>
              </div>
            </div>

            {/* Left Bento Collage Column (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-5">
              {/* Primary Editorial Image Card */}
              <div className="relative rounded-3xl overflow-hidden border border-outline-variant/35 shadow-bento group h-[270px] sm:h-[300px] bg-surface-container">
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent z-10 flex flex-col justify-end p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold text-white border border-white/20">
                      پایانه بندر امام خمینی (ره)
                    </span>
                    <span className="px-3 py-1 rounded-full bg-primary/90 backdrop-blur-md text-[11px] font-semibold text-white">
                      اسکله ۳۴ سیلوها
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold">تخلیه مستقیم کشتی‌های پاناماکس</h3>
                  <p className="text-xs text-white/80 mt-1">تخلیه مکانیزه روزانه بیش از ۷,۵۰۰ تن نهاده دامی فله</p>
                </div>
                {/* Fallback decorative textured backing */}
                <div className="w-full h-full bg-[#1B362F] flex items-center justify-center text-white/10 font-display text-6xl font-black">
                  BIK PORT
                </div>
              </div>

              {/* Twin Bento Bottom Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bento 1: Active Corridors */}
                <div className="p-5 rounded-3xl bg-surface-container/70 border border-outline-variant/35 flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-on-surface">۲ پایانه استراتژیک</span>
                    <div className="relative flex size-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                      <span className="relative inline-flex rounded-full size-3 bg-secondary"></span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-black text-secondary font-mono">۴۸۰,۰۰۰+</div>
                    <div className="text-[11px] text-on-surface-variant font-medium mt-0.5">تن توزیع سالانه غلات و کنجاله</div>
                  </div>
                </div>

                {/* Bento 2: Live Tracking Terminal */}
                <div className="p-5 rounded-3xl bg-surface-container/70 border border-outline-variant/35 flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-on-surface">
                    <span>پیشرفت ترخیص جاری</span>
                    <span className="font-mono text-primary font-bold">۸۲٪</span>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden mb-2">
                      <div className="bg-primary h-2 rounded-full w-[82%]" />
                    </div>
                    <div className="text-[11px] text-on-surface-variant flex justify-between font-mono">
                      <span>محموله ذرت زرد</span>
                      <span className="text-secondary font-semibold">بارنامه سبز</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4-STEP TRADE PIPELINE (#how-we-work) ================= */}
      <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 py-14 lg:py-20" id="how-we-work">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary-fixed/50 text-on-primary-fixed-variant text-xs font-semibold border border-primary-fixed/40">
            <span>فرآیند مطمئن و گام‌به‌گام</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-on-surface">
            مسیر ۴ مرحله‌ای تأمین امن نهاده‌های دامی
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            از منبع‌یابی بین‌المللی غلات تا تخصیص ارز، پهلوگیری کشتی و تحویل نهایی فله به فارم و کارخانه خوراک.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="relative p-7 rounded-3xl bg-surface-container-lowest border border-outline-variant/35 shadow-bento flex flex-col justify-between overflow-hidden hover:-translate-y-1.5 transition-all duration-300">
            <span className="absolute -bottom-4 -left-3 font-display text-7xl font-black text-on-surface/5 select-none pointer-events-none">
              ۰۱
            </span>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="size-11 rounded-2xl bg-primary-fixed/70 text-on-primary-fixed-variant flex items-center justify-center font-bold text-base shadow-xs">
                  ۰۱
                </span>
                <span className="text-xs font-mono text-on-surface-variant/60">Sourcing</span>
              </div>
              <h3 className="font-display text-lg text-on-surface font-bold mb-2">سورسینگ و بازرسی مبدا</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                اعتبارسنجی کیفی غلات، بازرسی استانداردهای SGS در بنادر بارگیری برزیل و روسیه، و کنترل رطوبت و افت وزنی.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-outline-variant/30 flex items-center gap-2 text-xs font-semibold text-secondary">
              <span>گواهی خلوص و عدم آلودگی</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative p-7 rounded-3xl bg-surface-container-lowest border border-outline-variant/35 shadow-bento flex flex-col justify-between overflow-hidden hover:-translate-y-1.5 transition-all duration-300">
            <span className="absolute -bottom-4 -left-3 font-display text-7xl font-black text-on-surface/5 select-none pointer-events-none">
              ۰۲
            </span>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="size-11 rounded-2xl bg-secondary-fixed/70 text-on-secondary-fixed-variant flex items-center justify-center font-bold text-base shadow-xs">
                  ۰۲
                </span>
                <span className="text-xs font-mono text-on-surface-variant/60">Contract</span>
              </div>
              <h3 className="font-display text-lg text-on-surface font-bold mb-2">ثبت سفارش و قرارداد رسمی</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                تخصیص سهمیه ارز رسمی، صدور پیش‌فاکتور شفاف در سامانه بازارگاه، و انعقاد قرارداد تجاری حقوقی.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-outline-variant/30 flex items-center gap-2 text-xs font-semibold text-secondary">
              <span>تسویه ریالی طبق اینکوترمز</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative p-7 rounded-3xl bg-surface-container-lowest border border-outline-variant/35 shadow-bento flex flex-col justify-between overflow-hidden hover:-translate-y-1.5 transition-all duration-300">
            <span className="absolute -bottom-4 -left-3 font-display text-7xl font-black text-on-surface/5 select-none pointer-events-none">
              ۰۳
            </span>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="size-11 rounded-2xl bg-primary-fixed/70 text-on-primary-fixed-variant flex items-center justify-center font-bold text-base shadow-xs">
                  ۰۳
                </span>
                <span className="text-xs font-mono text-on-surface-variant/60">Logistics</span>
              </div>
              <h3 className="font-display text-lg text-on-surface font-bold mb-2">حمل و بیمه جامع دریایی</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                بارگیری شناورهای فله‌بر پاناماکس، بیمه دریایی معتبر کالا، و رهگیری مستمر موقعیت کشتی تا لنگرگاه مقصد.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-outline-variant/30 flex items-center gap-2 text-xs font-semibold text-secondary">
              <span>پایش ۲۴ ساعته ترانزیت دریایی</span>
            </div>
          </div>

          {/* Step 4 */}
          <div className="relative p-7 rounded-3xl bg-surface-container-lowest border border-outline-variant/35 shadow-bento flex flex-col justify-between overflow-hidden hover:-translate-y-1.5 transition-all duration-300">
            <span className="absolute -bottom-4 -left-3 font-display text-7xl font-black text-on-surface/5 select-none pointer-events-none">
              ۰۴
            </span>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="size-11 rounded-2xl bg-secondary-fixed/70 text-on-secondary-fixed-variant flex items-center justify-center font-bold text-base shadow-xs">
                  ۰۴
                </span>
                <span className="text-xs font-mono text-on-surface-variant/60">Clearance</span>
              </div>
              <h3 className="font-display text-lg text-on-surface font-bold mb-2">ترخیص سبز و بارگیری داخلی</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                اخذ مجوز بهداشت و دامپزشکی، ترخیص از اسکله‌های سیلو، بارگیری کمپرسی و صدور بارنامه رسمی حمل.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-outline-variant/30 flex items-center gap-2 text-xs font-semibold text-secondary">
              <span>تطابق باسکول و سلامت بار</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BENTO SERVICES GRID (#services) ================= */}
      <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 py-14 lg:py-20" id="services">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed-variant text-xs font-semibold mb-2 border border-secondary-fixed">
              <span>خدمات تخصصی تجارت نهاده‌ها</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-on-surface">
              سبد جامع خدمات بازرگانی و لجستیک
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-md leading-relaxed">
            مدیریت یکپارچه تأمین از تخصیص ارز تا ترخیص سبز و انبارداری مکانیزه در بنادر شمالی و جنوبی کشور.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Sourcing & Supply */}
          <div className="p-8 lg:p-9 rounded-[2rem] bg-[#fbf5f2] border border-outline-variant/35 shadow-bento hover:shadow-bento-hover transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="size-12 rounded-full bg-primary-fixed/80 border border-primary-fixed text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <svg className="size-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
                <span className="px-3.5 py-1 rounded-full bg-surface-container-lowest border border-outline-variant/30 text-primary font-semibold text-xs">
                  تأمین و سورسینگ
                </span>
              </div>
              <h3 className="font-display text-xl text-on-surface font-bold mb-3">تأمین پیوسته غلات دامی و پروتئین</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                تأمین ذرت دانه‌ای برزیل و روسیه، کنجاله سویا پلیت پلت آرژانتین و برزیل، جو دامی قزاقستان و دی‌کلسیم فسفات با ظرفیت تأمین پیوسته ماهانه.
              </p>
            </div>
            <div className="mt-8 pt-5 border-t border-outline-variant/25 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-on-surface font-medium">
              <span className="flex items-center gap-1.5">✓ قراردادهای بلندمدت</span>
              <span className="flex items-center gap-1.5">✓ پایش روزانه کشف قیمت</span>
              <span className="flex items-center gap-1.5">✓ ضمانت اصالت محصول</span>
            </div>
          </div>

          {/* Card 2: Port Logistics & Silos */}
          <div className="p-8 lg:p-9 rounded-[2rem] bg-[#f5edea] border border-outline-variant/35 shadow-bento hover:shadow-bento-hover transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="size-12 rounded-full bg-secondary-fixed/80 border border-secondary-fixed text-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <svg className="size-6 fill-current" viewBox="0 0 24 24">
                    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                  </svg>
                </div>
                <span className="px-3.5 py-1 rounded-full bg-surface-container-lowest border border-outline-variant/30 text-secondary font-semibold text-xs">
                  لجستیک بندری
                </span>
              </div>
              <h3 className="font-display text-xl text-on-surface font-bold mb-3">انبارداری مکانیزه و سیلوهای بندرامام</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                بهره‌برداری از پایانه‌های اختصاصی تخلیه غلات، سیلوهای با تهویه استاندارد و خطوط بارگیری مکانیزه برای حداقل رساندن خواب ناوگان حمل.
              </p>
            </div>
            <div className="mt-8 pt-5 border-t border-outline-variant/25 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-on-surface font-medium">
              <span className="flex items-center gap-1.5">✓ بارگیری روزانه فله</span>
              <span className="flex items-center gap-1.5">✓ باسکول الکترونیک</span>
              <span className="flex items-center gap-1.5">✓ صدور آنی بارنامه</span>
            </div>
          </div>

          {/* Card 3: Quality Control & Lab */}
          <div className="p-8 lg:p-9 rounded-[2rem] bg-[#f5edea] border border-outline-variant/35 shadow-bento hover:shadow-bento-hover transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="size-12 rounded-full bg-secondary-fixed/80 border border-secondary-fixed text-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <svg className="size-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                  </svg>
                </div>
                <span className="px-3.5 py-1 rounded-full bg-surface-container-lowest border border-outline-variant/30 text-secondary font-semibold text-xs">
                  کنترل کیفیت
                </span>
              </div>
              <h3 className="font-display text-xl text-on-surface font-bold mb-3">تضمین بیوشیمیایی و سلامت دامپزشکی</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                آزمایش‌های جامع برای سنجش پروتئین، رطوبت، اوره‌آز، خاکستر، فسفر و غربالگری مایکوتوکسین‌ها پیش از بارگیری و تحویل به مشتری.
              </p>
            </div>
            <div className="mt-8 pt-5 border-t border-outline-variant/25 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-on-surface font-medium">
              <span className="flex items-center gap-1.5">✓ آنالیز رسمی SGS</span>
              <span className="flex items-center gap-1.5">✓ تاییدیه دامپزشکی</span>
              <span className="flex items-center gap-1.5">✓ هش احراز SHA-256</span>
            </div>
          </div>

          {/* Card 4: Currency & Commerce */}
          <div className="p-8 lg:p-9 rounded-[2rem] bg-[#fbf5f2] border border-outline-variant/35 shadow-bento hover:shadow-bento-hover transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="size-12 rounded-full bg-primary-fixed/80 border border-primary-fixed text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <svg className="size-6 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                </div>
                <span className="px-3.5 py-1 rounded-full bg-surface-container-lowest border border-outline-variant/30 text-primary font-semibold text-xs">
                  تسهیلات و تسویه
                </span>
              </div>
              <h3 className="font-display text-xl text-on-surface font-bold mb-3">تسویه رسمی و انطباق اینکوترمز ۲۰۲۰</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                صدور فاکتور الکترونیک معتبر سامانه مودیان، امکان خرید اعتباری برای کارخانجات معتبر و عقد قراردادهای ارزی/ریالی شفاف.
              </p>
            </div>
            <div className="mt-8 pt-5 border-t border-outline-variant/25 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-on-surface font-medium">
              <span className="flex items-center gap-1.5">✓ فاکتور رسمی مالیاتی</span>
              <span className="flex items-center gap-1.5">✓ قوانین CIF و FOB</span>
              <span className="flex items-center gap-1.5">✓ تسویه در بازارگاه</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STRATEGIC FEED COMMODITIES (WARM BENTO CARDS) ================= */}
      <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 py-14 lg:py-20" id="products">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-fixed/50 text-on-primary-fixed-variant text-xs font-semibold border border-primary-fixed/40">
              <span>نهاده‌های اصلی موجود در بنادر</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-on-surface mt-2">
              اقلام استراتژیک خوراک دام و طیور
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-md leading-relaxed">
            کشف قیمت بر پایه عرضه روز بنادر کشور، آنالیز معتبر آزمایشگاهی و تحویل بدون واسطه از سیلوها.
          </p>
        </div>

        <FeaturedCommoditiesGrid products={featured} locale={locale} />
      </section>

      {/* ================= TRUST STORY & METRICS STRIP (#trust-story) ================= */}
      <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 py-14 lg:py-20" id="trust-story">
        <div className="rounded-3xl bg-surface-container-lowest border border-outline-variant/35 p-6 lg:p-8 shadow-bento grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-outline-variant/25 mb-10">
          <div className="py-4 md:py-0 px-6 text-center">
            <div className="font-display text-4xl lg:text-5xl font-black text-primary">۱۵+ سال</div>
            <div className="font-bold text-sm text-on-surface mt-2">تجربه تخصصی بازرگانی غلات</div>
            <div className="text-xs text-on-surface-variant mt-1">تأمین مطمئن از حوزه‌های برزیل، روسیه و خزر</div>
          </div>
          <div className="py-4 md:py-0 px-6 text-center">
            <div className="font-display text-4xl lg:text-5xl font-black text-secondary">۴۸۰k تن</div>
            <div className="font-bold text-sm text-on-surface mt-2">ظرفیت توزیع سالانه</div>
            <div className="text-xs text-on-surface-variant mt-1">بارگیری پایدار و توزیع در فارم‌های سراسر کشور</div>
          </div>
          <div className="py-4 md:py-0 px-6 text-center">
            <div className="font-display text-4xl lg:text-5xl font-black text-on-surface">۱۰۰٪</div>
            <div className="font-bold text-sm text-on-surface mt-2">تطابق با استانداردهای دامپزشکی</div>
            <div className="text-xs text-on-surface-variant mt-1">کنترل دقیق سموم قارچی و مایکوتوکسین‌ها</div>
          </div>
        </div>

        {/* Testimonials Bento Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl bg-surface-container-lowest/90 border border-outline-variant/35 shadow-bento flex flex-col justify-between relative backdrop-blur-xs">
            <p className="text-sm sm:text-base text-on-surface leading-relaxed pt-2">
              «تأمین منظم ذرت و کنجاله برای فارم‌های گوشتی ما مستلزم سرعت بارگیری در بنادر و آنالیز بدون نوسان بود. شرکت دنیای هوشمند آینده با بارگیری منظم از سیلوهای بندر امام این دغدغه را به‌طور کامل مرتفع کرده است.»
            </p>
            <div className="mt-8 pt-5 border-t border-outline-variant/25 flex items-center gap-3.5">
              <div className="size-11 rounded-full bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center font-bold text-base shadow-xs">
                م.ر
              </div>
              <div>
                <div className="text-sm font-bold text-on-surface">مهندس رستمی</div>
                <div className="text-xs text-on-surface-variant">مدیر بازرگانی زنجیره تولید خوراک غرب</div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-surface-container-lowest/90 border border-outline-variant/35 shadow-bento flex flex-col justify-between relative backdrop-blur-xs">
            <p className="text-sm sm:text-base text-on-surface leading-relaxed pt-2">
              «شفافیت کامل در ارائه برگه‌های آزمایشگاهی پیش از بارگیری و تسویه دقیق مطابق پیش‌فاکتور رسمی، شاخص‌ترین وجه تمایز همکاری با این مجموعه بازرگانی است.»
            </p>
            <div className="mt-8 pt-5 border-t border-outline-variant/25 flex items-center gap-3.5">
              <div className="size-11 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center font-bold text-base shadow-xs">
                ع.ص
              </div>
              <div>
                <div className="text-sm font-bold text-on-surface">دکتر صادقی</div>
                <div className="text-xs text-on-surface-variant">مشاور تغذیه و مدیر فنی هلدینگ پرورش دام</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= QUICK INQUIRY BENTO CARD (#quick-inquiry) ================= */}
      <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 py-10 lg:py-16" id="quick-inquiry">
        <div className="rounded-[2.5rem] bg-surface-container-lowest border border-outline-variant/35 p-6 lg:p-10 shadow-hero">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Form Left Column (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div className="space-y-3 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed/50 text-on-primary-fixed-variant text-xs font-semibold">
                  درخواست مشاوره و استعلام خرید
                </span>
                <h3 className="font-display text-2xl font-bold text-on-surface">مشاوره تخصصی و استعلام نرخ روز نهاده‌ها</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  فرم زیر را تکمیل کنید تا کارشناسان بازرگانی شرکت برای بررسی شرایط تخصیص و بارگیری با شما تماس بگیرند.
                </p>
              </div>

              <form action="/contact" method="GET" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-on-surface block">انتخاب نهاده مورد نظر:</label>
                  <div className="flex flex-wrap gap-2">
                    {['ذرت برزیلی', 'کنجاله سویا ۴۴٪', 'جو دامی خزر', 'دی‌کلسیم فسفات', 'سبوس گندم'].map((name, i) => (
                      <span
                        key={i}
                        className={`chip-btn ${i === 0 ? 'bg-primary text-on-primary font-semibold shadow-xs' : 'bg-surface-container-low text-on-surface hover:bg-surface-container border border-outline-variant/25'}`}
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1">تناژ تقریبی مورد نیاز</label>
                    <input
                      type="text"
                      placeholder="مثال: ۲۰۰ تن"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-on-surface-variant/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1">پایانه تحویل بار</label>
                    <select
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                    >
                      <option>بندر امام خمینی (ره)</option>
                      <option>بندر امیرآباد (مازندران)</option>
                      <option>تحویل انبار مرکزی کارخانه</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1">نام و نام خانوادگی / نام شرکت</label>
                    <input
                      type="text"
                      placeholder="نام متقاضی یا شرکت"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-on-surface-variant/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-on-surface block mb-1">شماره تماس مستقیم</label>
                    <input
                      type="tel"
                      dir="ltr"
                      placeholder="0912..."
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-on-surface-variant/40"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-4 w-full py-3.5 px-6 rounded-full bg-primary text-on-primary font-semibold text-sm shadow-terracotta hover:bg-primary-container transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <span>دریافت پیش‌فاکتور رسمی نهاده‌ها</span>
                  <span className="rtl:rotate-180 text-xs">←</span>
                </button>
              </form>
            </div>

            {/* Action Strip Right Column (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4 lg:border-r lg:border-outline-variant/30 lg:pr-8">
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-on-surface">ارتباط مستقیم با واحد بازرگانی</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  جهت دریافت قیمت‌های ویژه تناژ بالا یا استعلام محموله‌های در حال تخلیه، مستقیماً تماس حاصل فرمایید.
                </p>
              </div>

              {/* WhatsApp Card */}
              <a
                href="https://wa.me/989128888888"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 flex items-center justify-between hover:bg-secondary-container/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center shrink-0">
                    <svg className="size-6 fill-current" viewBox="0 0 24 24">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-on-surface">واتساپ واحد فروش و استعلام</div>
                    <div className="text-[11px] text-on-surface-variant font-mono" dir="ltr">+98 912 888 8888</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-secondary group-hover:translate-x-1 transition-transform rtl:rotate-180">←</span>
              </a>

              {/* Direct Phone Card */}
              <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center shrink-0">
                    <svg className="size-5 fill-current" viewBox="0 0 24 24">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-on-surface">خط مستقیم بازرگانی تهران</div>
                    <div className="text-[11px] text-on-surface-variant font-mono" dir="ltr">۰۲۱-۸۸۸۸۸۸۸۸</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-primary">پاسخگویی ۹ تا ۱۸</span>
              </div>

              {/* Duty Shift Badge */}
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/25 text-xs text-on-surface-variant flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-secondary animate-pulse" />
                  <span>شیفت ترخیص و هماهنگی باسکول:</span>
                </span>
                <span className="font-semibold text-on-surface font-mono">۲۴/۷ فعال</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DETAILED LEDGER TABLE ================= */}
      <div className="relative mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-12 py-10">
        <Perforation className="mb-8" />
        <section className="overflow-hidden">
          <SectionHeader
            index={index(1)}
            title={dictionary.products.title}
            description={dictionary.home.productsIntro}
            actions={
              <Link
                href="/products"
                className="font-mono text-[13px] text-primary hover:underline font-semibold"
              >
                {dictionary.home.productsCta} ←
              </Link>
            }
          />
          <div className="mt-8 overflow-x-auto max-w-full rounded-2xl border border-outline-variant/35 bg-surface-container-lowest shadow-xs">
            <LedgerTable
              columns={featuredColumns}
              rows={featuredRows}
              rowKey={(row) => row.id}
              caption={dictionary.home.productsIntro}
              density="comfortable"
            />
          </div>
          <div className="mt-4">
            <Notice variant="info" tag={dictionary.common.tags.note}>
              {dictionary.products.sampleNote} {dictionary.products.priceNote}
            </Notice>
          </div>
        </section>
      </div>
    </main>
  );
}
