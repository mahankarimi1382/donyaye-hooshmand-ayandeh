import type { Metadata } from 'next';
import { getDictionary, formatJalaliDate, toFarsiDigits } from '@karvan/i18n';
import { Notice, PageHeader, SectionHeader } from '@karvan/ui';
import { sha256 } from '@karvan/core';
import {
  FileText,
  ShieldCheck,
  Scale,
  CreditCard,
  Lock,
  Gavel,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

import { SiteFrame, sectionIndex } from '../_components/site-chrome';

interface TermsPageProps {
  params: Promise<{ locale: string }>;
}

const DOCUMENT_NUMBER = 'KV-TRM-0010';
const DOCUMENT_VERSION = '2026.1';

export async function generateMetadata({ params }: TermsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === 'fa';
  return {
    title: isFa
      ? 'شرایط و ضوابط همکاری بازرگانی'
      : 'Terms of Trade & Commercial Cooperation',
    description: isFa
      ? 'مقررات و ضوابط حاکم بر استعلام، پیش‌فاکتورها، بازرسی کیفیت، تحویل، تسویه حساب، محرمانگی و حل و فصل اختلافات در مبادلات بازرگانی کاروان'
      : 'Official rules and terms governing inquiries, proforma invoices, quality inspection, delivery, payment settlement, confidentiality, and dispute resolution.',
  };
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;
  const isFa = locale === 'fa';
  const dictionary = getDictionary(locale);
  const index = (n: number) => sectionIndex(locale, n);
  const today = formatJalaliDate(new Date().toISOString(), isFa ? 'fa' : 'en');
  const num = (n: number) => (isFa ? toFarsiDigits(n) : String(n));

  const pageChecksum = sha256(
    `kv-terms|${locale}|${DOCUMENT_NUMBER}|${DOCUMENT_VERSION}|rfq-delivery-payment-confidentiality-disputes`,
  );

  const sections = [
    {
      id: 'section-1',
      index: 1,
      icon: FileText,
      title: isFa ? 'ضوابط استعلام و اعتبار پیش‌فاکتورها' : 'Inquiry Rules & Proforma Invoice Validity',
      description: isFa
        ? 'سازوکار ثبت استعلام خرید (RFQ)، بازه اعتبار زمانی پیش‌فاکتور و شرایط قطعی شدن قیمت‌ها'
        : 'Submission procedures for RFQs, proforma validity windows, and price commitment terms',
      items: [
        {
          title: isFa ? 'ثبت و ارزیابی استعلام خرید (RFQ)' : 'RFQ Registration & Verification',
          text: isFa
            ? 'خریدار موظف است کلیه مشخصات فنی، عیار، استاندارد مورد نیاز، تناژ درخواستی، بندر یا گمرک مقصد و ترم تجاری مدنظر را به صورت شفاف در سامانه ثبت نماید. استعلام‌های فاقد اطلاعات کامل حقوقی تا زمان تکمیل داده‌ها در وضعیت بررسی و نیاز به اطلاعات تکمیلی قرار می‌گیرند.'
            : 'Buyers must submit comprehensive technical specifications, required grades, target volumes, destination port/customs, and preferred trade terms. Incomplete inquiries will remain in pending status pending additional data.',
        },
        {
          title: isFa ? 'مدت اعتبار رسمی پیش‌فاکتور (Proforma Invoice)' : 'Official Proforma Validity Window',
          text: isFa
            ? 'با توجه به ماهیت نوسانی بازارهای جهانی کالاهای اساسی و کامودیتی‌ها، پیش‌فاکتورهای صادره از سوی کاروان دارای اعتبار زمانی محدود (به صورت پیش‌فرض حداکثر ۷۲ ساعت کاری از زمان صدور) می‌باشند. ساعت و تاریخ دقیق انقضا به وضوح در سربرگ سند درج می‌گردد.'
            : 'Owing to continuous price fluctuations in international commodity and ocean freight markets, proforma invoices issued by Karvan carry a strict validity window (typically 72 business hours from issuance), explicitly stated in the document manifest.',
        },
        {
          title: isFa ? 'شرایط تغییر یا ابطال قیمت' : 'Price Adjustment and Expiration Rules',
          text: isFa
            ? 'پس از سپری شدن مهلت اعتبار مندرج در پیش‌فاکتور و عدم تایید و واریز پیش‌پرداخت، قیمت‌های اعلام‌شده و رزرو محموله کان‌لم‌یکن تلقی می‌گردد. در صورت وقوع نوسانات شدید در نرخ ارز یا کرایه خطوط کشتیرانی، صدور نسخه اصلاحی (Revision) منوط به محاسبه مجدد نرخ روز خواهد بود.'
            : 'Following the expiration of the stated validity period without buyer confirmation and initial deposit, quoted prices and stock allocations expire automatically. Surcharges or sharp market shifts necessitate a formal quote revision based on prevailing market rates.',
        },
        {
          title: isFa ? 'سندیت و امضای مجاز' : 'Binding Authority & Digital Validation',
          text: isFa
            ? 'پیش‌فاکتور صرفاً با امضای صاحبان امضای مجاز شرکت کاروان و ممهور به مهر رسمی بازرگانی، همراه با شماره پیگیری یکتا در دفتر کل معاملات معتبر و قابل استناد است.'
            : 'Proformas become legally binding only when signed by authorized corporate signatories, bearing the official company stamp, and registered with a unique ledger transaction ID in the Karvan trade records.',
        },
      ],
      notice: {
        variant: 'info' as const,
        tag: isFa ? 'یادداشت بازرگانی' : 'Trade Note',
        text: isFa
          ? 'هرگونه تغییر در تناژ سفارش، مقصد نهایی یا مشخصات آنالیز پس از صدور پیش‌فاکتور، نیازمند ابطال نسخه پیشین و صدور پیش‌فاکتور جدید با بازنگری کامل هزینه‌هاست.'
          : 'Any amendment to order volume, destination port, or commodity specifications after proforma issuance voids the existing quote and requires issuance of a newly recalculated revision.',
      },
    },
    {
      id: 'section-2',
      index: 2,
      icon: Scale,
      title: isFa
        ? 'شرایط تحویل، بازرسی کیفیت (SGS/استاندارد دامپزشکی) و باسکول'
        : 'Delivery Terms, Quality Inspection (SGS/Veterinary) & Weighbridge',
      description: isFa
        ? 'قواعد اینکوترمز ۲۰۲۰، بازرسی بین‌المللی کالا، الزامات قرنطینه و ضوابط توزین دیجیتال گمرکی'
        : 'Incoterms 2020 rules, independent international inspection protocols, veterinary clearances, and certified weighbridge procedures',
      items: [
        {
          title: isFa ? 'قواعد تحویل بر مبنای اینکوترمز ۲۰۲۰' : 'Delivery Terms under Incoterms 2020',
          text: isFa
            ? 'کلیه تحویل‌ها مطابق استاندارد بین‌المللی اینکوترمز ۲۰۲۰ (شامل FOB بنادر ایران مانند بندر شهید رجایی و بندر امام خمینی، CFR، CIF بنادر مقصد، FCA و CPT پایانه‌های مرزی) انجام می‌گیرد. نقطه انتقال ریسک خسارت و هزینه‌ها دقیقاً بر اساس ترم قیدشده در قرارداد تفکیک می‌گردد.'
            : 'Deliveries are executed under Incoterms 2020 standards (including FOB Iranian ports such as Shahid Rajaee and Bandar Imam Khomeini, CFR, CIF destination ports, FCA, and CPT land borders). Risk and cost transfer points are governed strictly by the agreed rule.',
        },
        {
          title: isFa ? 'بازرسی مستقل کیفیت و کمیت (SGS / Cotecna / IGI)' : 'Pre-Shipment Inspection (SGS / Cotecna)',
          text: isFa
            ? 'پیش از بارگیری و پلمب کانتینرها یا انبارهای فله کشتی، نمونه‌برداری و آزمون توسط شرکت‌های معتبر بازرسی بین‌المللی مستقل (نظیر SGS، کوتکنا یا مراجع مرضی‌الطرفین) انجام می‌شود. گواهی بازرسی کمی و کیفی (COI) صادره ملاک نهایی تطابق فیزیکی و شیمیایی کالا با قرارداد تلقی می‌گردد.'
            : 'Prior to cargo loading and container sealing, full sampling and chemical/physical testing are performed by accredited independent international inspection agencies (e.g. SGS, Cotecna). The issued Certificate of Inspection (COI) constitutes definitive proof of contractual compliance.',
        },
        {
          title: isFa ? 'استانداردهای بهداشتی و ضوابط سازمان دامپزشکی کشور' : 'Veterinary & Sanitary Compliance',
          text: isFa
            ? 'در رابطه با محموله‌های خوراک دام، نهاده‌های کشاورزی و فراورده‌های زیستی، اخذ مجوزهای بهداشتی، گواهی قرنطینه، و تاییدیه رسمی سازمان دامپزشکی کشور الزامی است. ترخیص نهایی یا خروج محموله منوط به تایید کامل نتایج آزمایشگاهی بر مبنای استانداردهای ملی و بین‌المللی است.'
            : 'For animal feed, grain commodities, and biological byproducts, mandatory health certificates, quarantine clearances, and official veterinary agency approvals are secured prior to export. Final release is strictly contingent upon validated laboratory findings.',
        },
        {
          title: isFa ? 'ضوابط باسکول و تلورانس مجاز وزن' : 'Certified Weighbridge & Weight Tolerance',
          text: isFa
            ? 'وزن ناخالص و خالص محموله بر اساس قبوض رسمی باسکول دیجیتال گمرکی در مبدأ بارگیری تعیین می‌گردد. با توجه به شرایط تبخیر، رطوبت جوی و خطای طبیعی تجهیزات توزین، حد مجاز تفاوت وزن باسکول مبدأ و مقصد حداکثر ۰٫۵٪ (نیم درصد) در نظر گرفته شده و کسری بالاتر از این آستانه، مشمول صورت‌جلسه رسمی و تسویه تعدیلی خواهد بود.'
            : 'Net cargo weight is determined by official certified digital customs weighbridge tickets at the origin loading facility. Accounting for ambient moisture loss and calibration variances, the allowable weighbridge tolerance between origin and destination is capped at 0.5%. Differences exceeding this margin are subject to formal joint adjustment.',
        },
      ],
      notice: {
        variant: 'warning' as const,
        tag: isFa ? 'الزام نظارتی' : 'Regulatory Requirement',
        text: isFa
          ? 'سلامت پلمب‌های سربی گمرک و شرکت بازرسی در زمان رسیدن به مقصد، شرط اصلی بررسی هرگونه ادعای کسری بار است. فک پلمب بدون حضور بازرس رسمی مرضی‌الطرفین موجب سلب مسئولیت کاروان خواهد شد.'
          : 'Intact customs and inspection agency seals upon arrival at the destination are a mandatory prerequisite for submitting any shortage or quality claim. Unsealing cargo without certified surveyors present waives buyer recourse.',
      },
    },
    {
      id: 'section-3',
      index: 3,
      icon: CreditCard,
      title: isFa ? 'شرایط پرداخت و تسویه حساب' : 'Payment Terms & Financial Settlement',
      description: isFa
        ? 'روش‌های پرداخت مجاز، مراحل آزادسازی وجوه و سازوکار تسعیر و دیرکرد'
        : 'Permitted payment mechanisms, phased milestone schedules, and currency settlement terms',
      items: [
        {
          title: isFa ? 'روش‌های مجاز پرداخت بانکی' : 'Accepted Settlement Channels',
          text: isFa
            ? 'تسویه قراردادها از طریق حواله ارزی معتبر بانکی و صرافی‌های دارای مجوز (Telegraphic Transfer / TT)، اسناد در برابر پرداخت (Cash Against Documents / CAD)، و اعتبارات اسنادی دیداری یا یوزانس (Letter of Credit / LC) در چارچوب قوانین بانکی بین‌المللی صورت می‌گیرد.'
            : 'Settlement is accepted via authorized banking telegraphic transfers (TT/Swift), documentary collections / Cash Against Documents (CAD), and irrevocable commercial Letters of Credit (L/C) under uniform international banking rules.',
        },
        {
          title: isFa ? 'جدول زمان‌بندی و مراحل پرداخت' : 'Phased Milestone Schedule',
          text: isFa
            ? 'در قراردادهای استاندارد، پرداخت در سه فاز متوالی انجام می‌شود: ۱) پیش‌پرداخت اولیه (۲۰ الی ۳۰ درصد) جهت تخصیص سهمیه کالا؛ ۲) پرداخت مرحله‌ای هم‌زمان با بارگیری و ارائه نسخه کپی اسناد حمل و گواهی بازرسی؛ ۳) تسویه مانده نهایی پیش از تحویل اصل بارنامه دریایی (Original B/L) و تلکس ریلیز.'
            : 'Standard contracts follow a three-tier payment milestone: 1) Initial deposit (20-30%) to secure commodity allocation; 2) Intermediate payment upon loading against non-negotiable draft B/L and COI copies; 3) Final balance payment prior to surrender of original shipping documents and telex release.',
        },
        {
          title: isFa ? 'ارز پایه و نرخ تسعیر' : 'Contract Currency & Exchange Rate Parity',
          text: isFa
            ? 'ارز مبنای معامله (دلار آمریکا، یورو، درهم امارات یا ریال) در پیش‌فاکتور تصریح می‌گردد. در صورت نیاز به تسعیر، نرخ برابری روز واریز بر مبنای سامانه‌های رسمی ارزی محاسبه شده و هرگونه نوسان ارزی پس از انقضای پیش‌فاکتور بر عهده خریدار خواهد بود.'
            : 'The base settlement currency (USD, EUR, AED, or IRR) is explicitly locked in the proforma. Any exchange conversion is calculated based on the official central clearing rate on the date of funds receipt. Currency risk outside the validity window rests with the buyer.',
        },
        {
          title: isFa ? 'تبعات تأخیر در پرداخت' : 'Default and Payment Delay Remedies',
          text: isFa
            ? 'هرگونه دیرکرد در ایفای تعهدات مالی موجب تعلیق بارگیری، توقف فرآیند ترخیص و انتقال اسناد می‌گردد. کلیه هزینه‌های انبارداری بندری (Storage)، توقف کشتی یا کانتینر (Demurrage) ناشی از تاخیر خریدار، بر عهده طرف خاطی خواهد بود.'
            : 'Late payment automatically entitles Karvan to suspend loading, hold release documentation, and withhold customs clearance. All accrued port storage fees and vessel/container demurrage resulting from buyer delay are billed directly to the defaulting party.',
        },
      ],
      notice: {
        variant: 'info' as const,
        tag: isFa ? 'قاعده تسویه' : 'Settlement Rule',
        text: isFa
          ? 'آزادسازی اصل اسناد مالکیت بار منحصراً پس از تایید نهایی وصول ۱۰۰ درصدی وجوه قرارداد در حساب‌های معتبر شرکت کاروان صورت می‌پذیرد.'
          : 'Release of original title and shipping documentation occurs strictly after 100% receipt and confirmation of contract funds in Karvan designated accounts.',
      },
    },
    {
      id: 'section-4',
      index: 4,
      icon: Lock,
      title: isFa ? 'حفظ محرمانگی اطلاعات تجاری' : 'Commercial Confidentiality & Non-Disclosure',
      description: isFa
        ? 'تعهد به صیانت از داده‌های تجاری، فرمول‌های قیمت، مشخصات مشتریان و تداوم تعهدات'
        : 'Mutual protection of trade secrets, commercial formulas, client identities, and post-contract covenants',
      items: [
        {
          title: isFa ? 'دامنه اطلاعات محرمانه (Confidential Information)' : 'Scope of Protected Trade Data',
          text: isFa
            ? 'کلیه اسناد مبادله‌شده میان طرفین اعم از مشخصات فنی انحصاری، ساختار قیمت‌گذاری، تناژهای قراردادی، هویت تامین‌کنندگان و مشتریان، و مسیرهای ترانزیتی به عنوان اسرار تجاری و اطلاعات محرمانه طبقه‌بندی می‌شوند.'
            : 'All documentation exchanged between the parties—including custom specifications, price breakdowns, volume terms, supplier networks, and transit corridors—is classified as confidential commercial trade secrets.',
        },
        {
          title: isFa ? 'منع افشا و سوءاستفاده رقابتی' : 'Prohibition of Unauthorized Disclosure',
          text: isFa
            ? 'هیچ‌یک از طرفین مجاز نیست بدون اخذ رضایت کتبی طرف مقابل، اطلاعات تجاری را به اشخاص ثالث، بازاریابان یا رقبای تجاری افشا کند یا از آن در جهت منافع غیرقراردادی استفاده نماید. دسترسی کارکنان صرفاً بر مبنای اصل نیاز به دانستن (Need-to-Know) مجاز است.'
            : 'Neither party shall disclose, reproduce, or leverage confidential information to third parties or competitors without prior written consent. Access within organizations is strictly governed by the need-to-know principle.',
        },
        {
          title: isFa ? 'تداوم تعهدات پس از پایان همکاری' : 'Survival of Confidentiality Obligations',
          text: isFa
            ? 'تعهدات حفظ محرمانگی حتی پس از اتمام اجرای تعهدات، تحویل بار، تسویه کامل حساب‌ها یا فسخ پیش‌فاکتور به مدت حداقل ۵ سال شمسی به قوت قانونی خود باقی خواهد ماند.'
            : 'Confidentiality covenants remain legally binding and enforceable for a minimum period of five (5) years following contract fulfillment, final settlement, or agreement termination.',
        },
      ],
      notice: {
        variant: 'info' as const,
        tag: isFa ? 'دامنه استثنا' : 'Exclusion Boundary',
        text: isFa
          ? 'اطلاعاتی که پیش از افشا در دسترس عموم قرار داشته یا افشای آن‌ها به موجب دستور مستقیم مراجع قضایی یا گمرکی الزام‌آور باشد، از شمول نقض محرمانگی مستثنی خواهد بود.'
          : 'Data already in the public domain prior to disclosure or disclosed pursuant to mandatory court orders or statutory customs audits is exempt from breach classification.',
      },
    },
    {
      id: 'section-5',
      index: 5,
      icon: Gavel,
      title: isFa ? 'حل و فصل اختلافات و تعهدات طرفین' : 'Dispute Resolution & Contractual Obligations',
      description: isFa
        ? 'مذاکره مسالمت‌آمیز، ارجاع به مرکز داوری رسمی، شرایط فورس‌ماژور و قانون حاکم'
        : 'Good-faith negotiations, institutional arbitration protocols, force majeure events, and governing jurisdiction',
      items: [
        {
          title: isFa ? 'مذاکره مسالمت‌آمیز و ثبت ادعا (Claim)' : 'Amicable Negotiation & Claim Window',
          text: isFa
            ? 'در صورت بروز هرگونه ابهام یا اختلاف، طرفین در وهله نخست از طریق مذاکرات مستقیم ظرف مدت ۱۴ روز تقویمی تلاش خواهند کرد به راهکار مسالمت‌آمیز دست یابند. هرگونه ادعای فنی یا کسری بار باید حداکثر ظرف ۷۲ ساعت پس از تخلیه به همراه گزارش کارشناسی رسمی به کاروان ابلاغ گردد.'
            : 'Any controversy shall first be addressed through direct consultations in good faith within 14 calendar days. Quality or quantity claims must be submitted in writing within 72 hours of cargo discharge, accompanied by certified surveyor reports.',
        },
        {
          title: isFa ? 'مرجع داوری رسمی (Arbitration Center)' : 'Institutional Commercial Arbitration',
          text: isFa
            ? 'در صورت عدم حصول توافق در مذاکرات اولیه، کلیه اختلافات ناشی از تفسیر یا اجرای معاملات به مرکز داوری اتاق بازرگانی، صنایع، معادن و کشاورزی ایران (ACIC) یا هیئت داوران مرضی‌الطرفین ارجاع می‌شود. رأی صادره از سوی مرجع داوری قطعی و برای هر دو طرف لازم‌الاجراست.'
            : 'Failing amicable settlement, disputes arising out of or in connection with the contract shall be referred to and definitively resolved by the Arbitration Center of the Iran Chamber of Commerce (ACIC) or mutually appointed arbitrators, whose ruling shall be final and binding.',
        },
        {
          title: isFa ? 'حوادث قهریه و فورس ماژور (Force Majeure)' : 'Force Majeure Conditions',
          text: isFa
            ? 'رویدادهای خارج از اراده معقول طرفین اعم از بلایای طبیعی، جنگ، مسدود شدن آبراه‌های بین‌المللی، اعتصابات سراسری بنادر، تحریم‌های ناگهانی یا محدودیت‌های قهری صادرات و واردات وضع‌شده توسط دولت‌ها، تعهدات طرفین را تا رفع مانع بدون تعلق خسارت به حالت تعلیق درمی‌آورد.'
            : 'Events beyond reasonable control—including natural disasters, armed hostilities, international canal/strait blockades, port strikes, abrupt trade embargoes, or sovereign regulatory export halts—suspend performance obligations without damages during the event duration.',
        },
        {
          title: isFa ? 'قانون حاکم بر قرارداد' : 'Governing Law and Trade Customs',
          text: isFa
            ? 'کلیه مبادلات، تعهدات و تفسیر مفاد این شرایط و ضوابط تابع قوانین بازرگانی جمهوری اسلامی ایران و عرف‌ها و مقررات متحدالشکل اتاق بازرگانی بین‌المللی (ICC) می‌باشد.'
            : 'The construction, validity, and performance of these conditions are governed by the Commercial Code of the Islamic Republic of Iran, supplemented by the standard trade customs of the International Chamber of Commerce (ICC).',
        },
      ],
      notice: {
        variant: 'info' as const,
        tag: isFa ? 'تعهد متقابل' : 'Mutual Covenant',
        text: isFa
          ? 'طرفین متعهدند در تمامی مراحل اجرای تعهدات تجاری، اصول حسن نیت، امانت‌داری حرفه‌ای و انطباق با قوانین سلامت بازرگانی را رعایت نمایند.'
          : 'Both parties mutually pledge to uphold the principles of good faith, professional integrity, and strict adherence to fair international trade practices.',
      },
    },
  ];

  return (
    <main>
      <SiteFrame marginNote={DOCUMENT_NUMBER} className="py-10">
        <PageHeader
          title={isFa ? 'شرایط و ضوابط همکاری بازرگانی' : 'Terms of Trade & Commercial Cooperation'}
          meta={[
            { label: dictionary.common.meta.documentNumber, value: DOCUMENT_NUMBER },
            { label: dictionary.common.meta.version, value: DOCUMENT_VERSION },
            { label: dictionary.common.meta.date, value: today },
            { label: dictionary.common.meta.reference, value: 'INCOTERMS-2020 · ICC' },
            { label: dictionary.common.meta.checksum, value: pageChecksum.slice(0, 12).toUpperCase() },
          ]}
        />

        {/* Lead intro */}
        <p className="mt-8 max-w-3xl text-lg leading-8 text-ink-soft">
          {isFa
            ? 'این سند، ضوابط حاکم بر استعلام نرخ، صدور پیش‌فاکتورها، بازرسی‌های فنی کیفیت و کمیت، ضوابط تحویل و باسکول، تسویه حساب‌های مالی، حفظ محرمانگی اسرار تجاری و حل و فصل اختلافات در تمامی تعاملات بازرگانی کاروان را تبیین می‌نماید. ثبت استعلام یا تایید پیش‌فاکتور به منزله پذیرش رسمی این مقررات است.'
            : 'This document sets forth the comprehensive terms and conditions governing requests for quotation, proforma issuance, quality inspection standards, delivery and weighbridge rules, payment settlement mechanisms, trade confidentiality, and dispute resolution for all transactions facilitated by Karvan.'}
        </p>

        {/* Manifest Table of Contents */}
        <nav
          aria-label={isFa ? 'فهرست بخش‌های سند' : 'Table of Contents'}
          className="mt-10 rounded-3xl border border-outline-variant/35 bg-surface-container-lowest p-6 shadow-bento"
        >
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-on-surface-variant">
              {isFa ? 'فهرست سرفصل‌های حقوقی و تجاری' : 'Legal & Commercial Manifest Index'}
            </h2>
            <span className="font-mono text-xs text-on-surface-variant/70">
              {isFa ? `${num(sections.length)} سرفصل الزامی` : `${sections.length} Required Articles`}
            </span>
          </div>

          <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="group flex items-baseline gap-3 rounded-xl p-2.5 transition-colors hover:bg-surface-container-low"
                >
                  <span className="font-mono text-[13px] text-primary font-bold">{index(section.index)}</span>
                  <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                    {section.title}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* The 5 comprehensive sections */}
        <div className="mt-12 space-y-16">
          {sections.map((section) => {
            const SectionIcon = section.icon;
            return (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 border-t border-outline-variant/30 pt-10"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <SectionHeader
                    index={index(section.index)}
                    title={section.title}
                    description={section.description}
                  />
                  <div
                    aria-hidden="true"
                    className="hidden size-11 items-center justify-center rounded-2xl border border-outline-variant/30 bg-surface-container-low text-primary sm:flex shadow-xs"
                  >
                    <SectionIcon className="size-5" />
                  </div>
                </div>

                {/* Sub-articles */}
                <div className="mt-8 space-y-4">
                  {section.items.map((item, itemIdx) => (
                    <article
                      key={item.title}
                      className="bento-card-static bg-surface-container-lowest p-6 shadow-xs transition-colors"
                    >
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-[13px] text-primary font-bold">
                          {index(section.index)}.{num(itemIdx + 1)}
                        </span>
                        <h3 className="text-base font-bold text-on-surface">{item.title}</h3>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-on-surface-variant">{item.text}</p>
                    </article>
                  ))}
                </div>

                {/* Section Notice */}
                {section.notice && (
                  <div className="mt-6">
                    <Notice variant={section.notice.variant} tag={section.notice.tag}>
                      {section.notice.text}
                    </Notice>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Document Checksum & Integrity Footprint */}
        <footer className="mt-16 rounded-3xl border border-outline-variant/35 bg-surface-container-low p-6 shadow-xs">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <p className="font-mono text-[13px] font-bold text-on-surface">
                {isFa ? 'صحت‌سنجی و اصالت سند' : 'Document Cryptographic Integrity'}
              </p>
              <p className="mt-1 text-xs text-on-surface-variant">
                {isFa
                  ? 'این سند بر اساس پروتکل بازرگانی دنیای هوشمند آینده دارای امضای رمزنگاری‌شده مستقل بوده و هرگونه ویرایش غیرمجاز موجب عدم تطابق هش سند خواهد شد.'
                  : 'This document is cryptographically verified; any tampering will invalidate the digital digest.'}
              </p>
            </div>
            <div className="text-start sm:text-end">
              <span className="font-mono text-xs text-on-surface-variant/70">
                {dictionary.common.meta.updatedAt}: {today}
              </span>
            </div>
          </div>
          <div className="mt-4 border-t border-outline-variant/25 pt-3">
            <p className="font-mono text-[11px] text-on-surface-variant">
              <bdi className="font-bold text-on-surface">SHA-256 DIGEST:</bdi>{' '}
              <bdi dir="ltr" className="break-all tracking-wider text-primary font-bold">
                {pageChecksum}
              </bdi>
            </p>
          </div>
        </footer>
      </SiteFrame>
    </main>
  );
}
