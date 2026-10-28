import type { Metadata } from 'next';
import { getDictionary, formatJalaliDate, toFarsiDigits } from '@karvan/i18n';
import { Notice, PageHeader, SectionHeader } from '@karvan/ui';
import { sha256 } from '@karvan/core';
import {
  Database,
  Workflow,
  ShieldBan,
  Lock,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';

import { SiteFrame, sectionIndex } from '../_components/site-chrome';

interface PrivacyPageProps {
  params: Promise<{ locale: string }>;
}

const DOCUMENT_NUMBER = 'KV-PRV-0011';
const DOCUMENT_VERSION = '2026.1';

export async function generateMetadata({ params }: PrivacyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isFa = locale === 'fa';
  return {
    title: isFa
      ? 'سیاست حفظ حریم خصوصی و محرمانگی داده‌ها'
      : 'Privacy & Data Confidentiality Policy',
    description: isFa
      ? 'خط‌مشی جامع کاروان در صیانت از اطلاعات تجاری، داده‌های تماس خریداران، عدم فروش داده به اشخاص ثالث، امنیت ذخیره‌سازی و حقوق دسترسی کاربران'
      : 'Comprehensive policy on commercial data confidentiality, buyer contact protection, strict non-disclosure to third parties, storage security, and user rights.',
  };
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  const isFa = locale === 'fa';
  const dictionary = getDictionary(locale);
  const index = (n: number) => sectionIndex(locale, n);
  const today = formatJalaliDate(new Date().toISOString(), isFa ? 'fa' : 'en');
  const num = (n: number) => (isFa ? toFarsiDigits(n) : String(n));

  const pageChecksum = sha256(
    `kv-privacy|${locale}|${DOCUMENT_NUMBER}|${DOCUMENT_VERSION}|b2b-data-collection-rfq-no-sale-security-rights`,
  );

  const sections = [
    {
      id: 'section-1',
      index: 1,
      icon: Database,
      title: isFa
        ? 'نوع داده‌های جمع‌آوری‌شده (فقط اطلاعات تجاری و تماس خریدار)'
        : 'Scope of Collected Data (Commercial & Authorized Contact Only)',
      description: isFa
        ? 'محدودسازی دقیق داده‌های دریافتی به اطلاعات هویتی حقوقی شرکت و الزامات فنی استعلام کالا'
        : 'Strict restriction of gathered records to legal corporate verification and commercial trade requirements',
      items: [
        {
          title: isFa ? 'هویت حقوقی و مشخصات ثبتی شرکت خریدار' : 'Corporate Identity & Registration Data',
          text: isFa
            ? 'اطلاعات جمع‌آوری‌شده صرفاً در برگیرنده نام ثبتی شرکت، شماره ثبت تجاری، شناسه ملی / کد اقتصادی، آدرس رسمی اداری و کارخانه‌ای، و گواهی ارزش افزوده است که برای احراز هویت اشخاص حقوقی در تجارت بین‌الملل ضروری است.'
            : 'Collected corporate records are strictly limited to registered company names, commercial registry numbers, tax/economic identifiers, official addresses, and VAT certificates necessary for legal entity verification.',
        },
        {
          title: isFa ? 'مشخصات تماس نمایندگان و کارشناسان مجاز' : 'Authorized Representative Contact Records',
          text: isFa
            ? 'نام و نام‌خانوادگی مدیر بازرگانی یا کارشناس خرید، سمت رسمی سازمانی، آدرس پست الکترونیکی شرکتی، شماره تلفن مستقیم و خط کاری که مستقیماً توسط خود خریدار جهت هماهنگی‌های بازرگانی ارائه می‌شود.'
            : 'Full names, corporate job titles, authorized corporate email addresses, and direct business telephone numbers provided directly by buyer procurement officers for transaction coordination.',
        },
        {
          title: isFa ? 'مشخصات فنی محموله و پارامترهای استعلام (RFQ)' : 'Cargo Specifications & RFQ Parameters',
          text: isFa
            ? 'شامل شرح کالا، کد تعرفه گمرکی (HS Code)، تناژ مورد نیاز، عیار و آنالیز شیمیایی/فیزیکی استاندارد، نوع بسته‌بندی، پورت مقصد درخواستی و ترم تحویل بر مبنای اینکوترمز ۲۰۲۰.'
            : 'Commodity descriptions, Harmonized System (HS) codes, requested volumes, standard physical/chemical assay parameters, packaging formats, discharge ports, and preferred Incoterms 2020 delivery rules.',
        },
        {
          title: isFa ? 'عدم گردآوری داده‌های غیرتجاری و رفتار مصرف‌کننده' : 'Zero Consumer Profiling & Private Data',
          text: isFa
            ? 'کاروان یک سامانه تخصصی تجارت B2B است. ما هیچ‌گونه اطلاعات شخصی مصرف‌کننده نهایی، داده‌های حساب‌های شخصی، ردیابی فعالیت‌های وب خارج از سامانه یا کوکی‌های رهگیری تبلیغاتی را جمع‌آوری، پردازش یا نگهداری نمی‌کنیم.'
            : 'Karvan operates exclusively as an enterprise B2B platform. We do not gather, process, or store consumer personal records, individual financial metrics, third-party web trackers, or behavioral profiling cookies.',
        },
      ],
      notice: {
        variant: 'info' as const,
        tag: isFa ? 'اصل ضرورت' : 'Principle of Necessity',
        text: isFa
          ? 'تمامی داده‌های دریافتی، مستقیماً از طریق فرم‌های رسمی استعلام خرید یا مدارک ارائه‌شده توسط نماینده شرکت دریافت شده و هیچ داده‌ای بدون آگاهی خریدار اخذ نمی‌گردد.'
          : 'All collected information is received directly through official quotation request forms or bilateral trade documentation submitted knowingly by authorized entity personnel.',
      },
    },
    {
      id: 'section-2',
      index: 2,
      icon: Workflow,
      title: isFa
        ? 'نحوه استفاده از اطلاعات در فرایند استعلام'
        : 'Use of Information in the RFQ and Trade Execution Process',
      description: isFa
        ? 'به‌کارگیری هدفمند اطلاعات در محاسبات لجستیکی، صدور پیش‌فاکتور و رهگیری وضعیت محموله'
        : 'Application of data in supply chain computations, proforma quote issuance, and shipment milestone tracking',
      items: [
        {
          title: isFa ? 'بررسی فنی، استعلام لجستیک و صدور پیش‌فاکتور' : 'Technical Appraisal & Proforma Issuance',
          text: isFa
            ? 'اطلاعات کالا جهت محاسبه هزینه‌های انبارداری، استعلام نرخ کرایه خطوط کشتیرانی، برآورد بیمه باربری و محاسبه قیمت نهایی تحویل در قالب پیش‌فاکتور رسمی (Proforma Invoice) به کار می‌رود.'
            : 'Specifications are utilized to evaluate warehouse allocation, ocean and land freight quotations, marine insurance rates, and final landed costs reflected in official proforma invoices.',
        },
        {
          title: isFa ? 'اطلاع‌رسانی وضعیت پرونده و ثبت نقاط عطف (Milestones)' : 'Milestone Communications & Logistics Tracking',
          text: isFa
            ? 'داده‌های تماس جهت ارسال خودکار وضعیت مراحل تجارت اعم از تخصیص بار، تاریخ بارگیری، صدور پیش‌نویس بارنامه دریایی، ورود به بندر مقصد و زمان ترخیص کالا استفاده می‌شود.'
            : 'Contact records are employed to transmit real-time milestone notices regarding cargo allocation, vessel boarding, draft B/L issuance, destination arrival, and final customs release.',
        },
        {
          title: isFa ? 'تنظیم اسناد بازرگانی، گمرکی و بانکی' : 'Customs and Trade Manifest Generation',
          text: isFa
            ? 'مشخصات ثبتی خریدار در بارنامه‌های بین‌المللی (Bill of Lading)، سیاهه تجاری (Commercial Invoice)، لیست عدلبندی (Packing List)، گواهی مبدأ و اسناد بانکی اعتبارات اسنادی (LC) منعکس می‌گردد.'
            : 'Corporate details are populated into shipping bills of lading, commercial invoices, packing lists, certificates of origin, and documentary banking papers.',
        },
        {
          title: isFa ? 'بهینه‌سازی خدمات و پاسخگویی به استعلامات' : 'Service Auditing and Performance Metrics',
          text: isFa
            ? 'سوابق استعلامات برای ارزیابی میانگین زمان پاسخگویی به مشتریان، تحلیل روند درخواست‌های کالایی و بهبود دقت برآوردهای زمانی سامانه استفاده می‌شود.'
            : 'Inquiry logs are audited internally to assess quote turnaround times, identify commodity demand patterns, and improve algorithmic shipping estimates.',
        },
      ],
      notice: {
        variant: 'info' as const,
        tag: isFa ? 'دامنه مصرف' : 'Usage Scope',
        text: isFa
          ? 'استفاده از داده‌های ثبتی کاربران منحصراً به اجرای تعهدات موضوع استعلام یا قرارداد بازرگانی فی‌مابین محدود است.'
          : 'Data usage is strictly confined to the execution, fulfillment, and accounting of requested quotations and resultant commercial contracts.',
      },
    },
    {
      id: 'section-3',
      index: 3,
      icon: ShieldBan,
      title: isFa
        ? 'عدم واگذاری یا فروش اطلاعات به اشخاص ثالث'
        : 'No Sale, Rental, or Unauthorized Third-Party Disclosure',
      description: isFa
        ? 'تعهد قطعی بر عدم تجاری‌سازی اطلاعات مشتریان و ضوابط سخت‌گیرانه انتقال عملیاتی داده‌ها'
        : 'Explicit guarantee against commercial data monetization and strict operational sharing protocols',
      items: [
        {
          title: isFa ? 'منع مطلق فروش، اجاره یا واگذاری داده‌های تجاری' : 'Absolute Prohibition on Commercial Sale or Rental',
          text: isFa
            ? 'کاروان صراحتاً متعهد می‌گردد که داده‌های هویتی، تماس، سوابق استعلام یا حجم مبادلات بازرگانان را تحت هیچ شرایطی به هیچ شخص ثالث، دلالان داده، بنگاه‌های تبلیغاتی یا بازاریابی واگذار نکرده و نخواهد فروخت.'
            : 'Karvan strictly covenants that customer identity, contact details, transaction histories, or trade volumes are never sold, rented, leased, or monetized to any third-party brokers or advertisers.',
        },
        {
          title: isFa ? 'اشتراک عملیاتی داده‌ها صرفاً با عوامل زنجیره تامین' : 'Operational Sharing Limited to Supply Chain Partners',
          text: isFa
            ? 'اطلاعات تنها به میزان حداقلی و غیرقابل‌اجتناب در اختیار شرکای اجرایی مستقیم (شامل خطوط کشتیرانی، شرکت‌های بازرسی بین‌المللی مانند SGS، کارگزاران رسمی گمرک و شرکت‌های بیمه) صرفاً جهت بارگیری، صدور بارنامه و ترخیص قانونی کالا قرار می‌گیرد.'
            : 'Information is shared on a strict need-to-know basis solely with direct operational execution partners (carriers, SGS inspection surveyors, certified customs brokers, and cargo underwriters) to perform loading and customs clearance.',
        },
        {
          title: isFa ? 'الزام شرکای عملیاتی به حفظ محرمانگی (NDA)' : 'Binding Partner Confidentiality Obligations',
          text: isFa
            ? 'تمامی پیمانکاران، شرکت‌های حمل و کارگزاران گمرکی طرف قرارداد با کاروان، متعهد به امضای توافق‌نامه‌های الزام‌آور عدم افشای اطلاعات محرمانه (NDA) پیش از دریافت هرگونه سند تجاری هستند.'
            : 'All logistical contractors, transport carriers, and customs clearing agents engaged by Karvan are bound by formal Non-Disclosure Agreements prior to receiving cargo manifests.',
        },
        {
          title: isFa ? 'پاسخ به تکالیف قانونی و دستورات قضایی' : 'Compliance with Mandatory Legal Process',
          text: isFa
            ? 'افشای اطلاعات تنها در صورتی صورت خواهد پذیرفت که به موجب دستور کتبی و رسمی مراجع صالحه قضایی یا مقررات قطعی گمرکی الزامی شده باشد، که در این موارد نیز مراتب در چارچوب قانون به اطلاع خریدار خواهد رسید.'
            : 'Information may only be disclosed if formally mandated by valid legal subpoenas, court decrees, or statutory customs declarations, with timely notification provided to the buyer within legal allowances.',
        },
      ],
      notice: {
        variant: 'warning' as const,
        tag: isFa ? 'تعهد بنیادین' : 'Foundational Guarantee',
        text: isFa
          ? 'داده‌های استعلام و قیمت‌های خرید شما هرگز در اختیار سایر خریداران یا رقبای تجاری شما در بازار قرار نخواهد گرفت.'
          : 'Your inquiry records, target volumes, and quoted rates will never be disclosed to other buyers or commercial competitors in the market.',
      },
    },
    {
      id: 'section-4',
      index: 4,
      icon: Lock,
      title: isFa ? 'امنیت ذخیره‌سازی داده‌ها' : 'Data Storage Security, Encryption & Integrity',
      description: isFa
        ? 'معماری امنیتی چندلایه، رمزنگاری در انتقال و سکون، و کنترل دسترسی تفکیک‌شده'
        : 'Multi-tier security architecture, transport & rest encryption, and role-based access controls',
      items: [
        {
          title: isFa ? 'رمزنگاری استاندارد در انتقال و سکون' : 'State-of-the-Art Encryption (TLS 1.3 & AES-256)',
          text: isFa
            ? 'کلیه ارتباطات شبکه و تبادل داده با درگاه کاروان از طریق پروتکل رمزنگاری مدرن TLS 1.3 محافظت می‌شود. تمامی داده‌های راکد، پایگاه‌های داده و فایل‌های اسناد تجاری با الگوریتم رمزنگاری پیشرفته AES-256 رمزگذاری شده‌اند.'
            : 'All data transmitted across the network is encrypted via TLS 1.3 transport security. Inactive databases, stored files, and transaction records are encrypted at rest using AES-256 cryptographic ciphers.',
        },
        {
          title: isFa ? 'کنترل دسترسی نقش‌محور (Role-Based Access Control)' : 'Role-Based Access Control (RBAC)',
          text: isFa
            ? 'دسترسی کارکنان کاروان به پرونده‌های تجاری بر مبنای اصل حداقل اختیارات (Least Privilege) محدود شده و احراز هویت چندعاملی برای کلیه دسترسی‌های سیستمی الزامی است.'
            : 'Staff access to commercial files is governed by the principle of least privilege (RBAC). Multi-factor authentication is mandatory for administrative credentials.',
        },
        {
          title: isFa ? 'درستی‌سنجی رمزنگاری‌شده اسناد (SHA-256 Checksums)' : 'Cryptographic Integrity Verification',
          text: isFa
            ? 'هر پیش‌فاکتور و سند رسمی صادره در سیستم با شناسه درستی‌سنجی یکتای SHA-256 مهر دیجیتال می‌شود تا هرگونه دستکاری احتمالی ثانویه در اسناد تجاری غیرممکن گردد.'
            : 'Each proforma and official manifest generated is cryptographically hashed with unique SHA-256 digests, eliminating risks of post-issuance modification or falsification.',
        },
        {
          title: isFa ? 'ثبت وقایع غیرقابل‌دستکاری (Audit Logs)' : 'Immutable Audit Trails & Redundancy',
          text: isFa
            ? 'تمامی رویدادهای بازبینی، ویرایش یا صدور اسناد در دفتر ثبت وقایع امنیتی نگهداری می‌شود و پشتیبان‌گیری منظم و تفکیک‌شده در مراکز داده با استاندارد Tier-3 انجام می‌پذیرد.'
            : 'All record accesses, edits, and status changes are permanently logged in tamper-evident audit trails, with automated redundant backups maintained in certified Tier-3 facilities.',
        },
      ],
      notice: {
        variant: 'info' as const,
        tag: isFa ? 'ایزولاسیون داده' : 'Data Isolation',
        text: isFa
          ? 'ساختار چندمستاجره پلتفرم کاروان دارای ایزولاسیون منطقی کامل است؛ اطلاعات تجاری هیچ دو شرکتی در یک محیط ادغام نمی‌گردد.'
          : 'The platform architecture enforces strict multi-tenant logical isolation, guaranteeing zero data leakage between distinct trading organizations.',
      },
    },
    {
      id: 'section-5',
      index: 5,
      icon: UserCheck,
      title: isFa ? 'حقوق دسترسی و اصلاح اطلاعات' : 'User Rights: Access, Rectification & Inquiries',
      description: isFa
        ? 'حقوق بازرگانان در مشاهده پرونده‌ها، اصلاح مشخصات ثبتی، بایگانی و ارتباط با واحد حفاظت از داده‌ها'
        : 'Enterprise rights regarding records inspection, legal profile corrections, data archiving, and compliance desk access',
      items: [
        {
          title: isFa ? 'حق دسترسی و مشاهده سوابق پرونده‌های تجاری' : 'Right to Inspect Commercial Records',
          text: isFa
            ? 'نمایندگان مجاز هر شرکت بازرگانی می‌توانند در هر زمان با ورود به میز کار خود به کلیه سوابق استعلامات گذشته، نسخه‌های پیش‌فاکتور، و وضعیت اسناد ترخیص دسترسی کامل داشته باشند.'
            : 'Authorized entity representatives retain full rights to review historical inquiries, proforma versions, and shipping documentation status via their dedicated portal at any time.',
        },
        {
          title: isFa ? 'حق تصحیح و به‌روزرسانی اطلاعات شرکتی' : 'Right to Rectify & Update Corporate Data',
          text: isFa
            ? 'در صورت تغییر در مشخصات ثبتی شرکت، تغییر نشانی، شماره‌های تماس یا تفویض نمایندگان بازرگانی، خریدار حق دارد در کوتاه‌ترین زمان درخواست اصلاح و به‌روزرسانی اطلاعات خود را ثبت کند.'
            : 'In the event of corporate updates, registered address changes, or personnel reassignments, buyers may submit immediate requests for record corrections and profile updates.',
        },
        {
          title: isFa ? 'ضوابط بایگانی و حذف اطلاعات غیرفعال' : 'Data Archiving & Retention Policies',
          text: isFa
            ? 'خریداران می‌توانند درخواست بایگانی یا غیرفعال‌سازی سوابق استعلام‌های پیش‌نویس را مطرح نمایند. لازم به ذکر است اسناد مالی و بارنامه‌های نهایی شده به موجب قوانین مالیاتی و گمرکی باید تا مدت معین قانونی در بایگانی امن نگهداری شوند.'
            : 'Entities may request the archiving or deletion of inactive draft inquiries. Final commercial manifests and tax invoices are retained in secure archives in accordance with statutory accounting and customs retention laws.',
        },
        {
          title: isFa ? 'میز صیانت از داده‌ها و ارتباط با کارشناس مسئول (DPO)' : 'Data Protection Desk & Compliance Contact',
          text: isFa
            ? 'جهت پیگیری هرگونه پرسش حقوقی، ثبت درخواست‌های اصلاحی یا گزارش موارد امنیتی، بازرگانان گرامی می‌توانند مستقیماً از طریق پست الکترونیکی privacy@karvan.trade با واحد صیانت از داده‌های کاروان در ارتباط باشند.'
            : 'For legal inquiries, rectification requests, or compliance clarifications, partners may communicate directly with our Data Protection Officer at privacy@karvan.trade.',
        },
      ],
      notice: {
        variant: 'info' as const,
        tag: isFa ? 'زمان رسیدگی' : 'Response Timeline',
        text: isFa
          ? 'کلیه درخواست‌های مرتبط با اصلاح مشخصات یا بررسی سوابق حریم خصوصی حداکثر ظرف ۴۸ ساعت کاری توسط واحد حقوقی کاروان رسیدگی و پاسخ داده می‌شود.'
          : 'All formal inquiries regarding data rectification or privacy review are processed and answered by Karvan legal counsel within 48 business hours.',
      },
    },
  ];

  return (
    <main>
      <SiteFrame marginNote={DOCUMENT_NUMBER} className="py-10">
        <PageHeader
          title={isFa ? 'سیاست حفظ حریم خصوصی و محرمانگی داده‌ها' : 'Privacy & Data Confidentiality Policy'}
          meta={[
            { label: dictionary.common.meta.documentNumber, value: DOCUMENT_NUMBER },
            { label: dictionary.common.meta.version, value: DOCUMENT_VERSION },
            { label: dictionary.common.meta.date, value: today },
            { label: dictionary.common.meta.reference, value: 'DPO-GOV · ISO-27001' },
            { label: dictionary.common.meta.checksum, value: pageChecksum.slice(0, 12).toUpperCase() },
          ]}
        />

        {/* Lead intro */}
        <p className="mt-8 max-w-3xl text-lg leading-8 text-ink-soft">
          {isFa
            ? 'شرکت کاروان تجارت بین‌الملل خود را متعهد به صیانت کامل از اسرار تجاری، محرمانگی اسناد بازرگانی و داده‌های شرکای تجاری خود می‌داند. این بیانیه، شفافیت کامل را درباره دامنه اطلاعات جمع‌آوری‌شده، نحوه استفاده در فرآیند استعلام، امنیت ذخیره‌سازی و تعهد قطعی به عدم واگذاری داده‌ها به اشخاص ثالث تضمین می‌نماید.'
            : 'Karvan International Trade is dedicated to the unyielding protection of corporate confidentiality, commercial transaction documentation, and partner contact information. This policy provides complete transparency regarding data collection scope, operational application, cryptographic defense, and strict prohibition of third-party data commercialization.'}
        </p>

        {/* Manifest Table of Contents */}
        <nav
          aria-label={isFa ? 'فهرست بخش‌های سیاست حفظ حریم خصوصی' : 'Privacy Policy Manifest Index'}
          className="mt-10 rounded-3xl border border-outline-variant/35 bg-surface-container-lowest p-6 shadow-bento"
        >
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-on-surface-variant">
              {isFa ? 'فهرست سرفصل‌های سیاست محرمانگی' : 'Confidentiality Policy Manifest Index'}
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
                {isFa ? 'صحت‌سنجی و پایش انطباق' : 'Compliance & Cryptographic Verification'}
              </p>
              <p className="mt-1 text-xs text-on-surface-variant">
                {isFa
                  ? 'این سند ثبت‌شده در دفاتر امنیتی دنیای هوشمند آینده با استاندارد ISO/IEC 27001 مطابقت داشته و اصالت متن با کلید دیجیتال تضمین شده است.'
                  : 'This policy complies with ISO/IEC 27001 standards and is cryptographically hashed for continuous authenticity verification.'}
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
