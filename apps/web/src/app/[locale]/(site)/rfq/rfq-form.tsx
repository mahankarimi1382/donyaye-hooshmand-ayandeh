'use client';

import { useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, Copy, FileText, Send } from 'lucide-react';
import type { Dictionary } from '@karvan/i18n';
import { Button, FormField, Input, Notice, Select, Textarea } from '@karvan/ui';

import { Link } from '@/i18n/navigation';
import type { ProductRecord } from '@/lib/types';

interface RfqFormProps {
  products: ProductRecord[];
  initialProductId?: string;
  initialPort?: string;
  initialVolume?: string;
  dictionary: Dictionary;
  locale: string;
}

const INCOTERMS = ['FOB', 'CFR', 'CIF', 'CPT', 'FCA', 'EXW'] as const;
type Incoterm = (typeof INCOTERMS)[number];

const PHONE_PATTERN = /^\+[1-9]\d{6,14}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toAsciiDigits(str: string): string {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[۰-۹]/g, (d) => String(farsiDigits.indexOf(d)));
}

export function RfqForm({
  products,
  initialProductId = '',
  initialPort = '',
  initialVolume = '',
  dictionary,
  locale,
}: RfqFormProps) {
  const isFa = locale === 'fa';
  const consentId = useId();
  const hpId = useId();

  const asciiVolume = toAsciiDigits(initialVolume);
  const parsedQty = asciiVolume ? asciiVolume.replace(/[^0-9]/g, '') || '100' : '100';
  const parsedPort = initialPort.trim() ? initialPort.trim() : isFa ? 'بندر امام خمینی' : 'Bandar Imam';

  const [productId, setProductId] = useState(initialProductId);
  const [customDescription, setCustomDescription] = useState('');
  const [quantity, setQuantity] = useState(parsedQty);
  const [unit, setUnit] = useState<'metric_ton' | 'kg'>('metric_ton');
  const [specifications, setSpecifications] = useState('');
  const [destinationCity, setDestinationCity] = useState(parsedPort);
  const [incoterm, setIncoterm] = useState<Incoterm>('FOB');
  const [incotermNamedPlace, setIncotermNamedPlace] = useState(parsedPort);
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+98');
  const [role, setRole] = useState(isFa ? 'مدیر بازرگانی / خرید' : 'Procurement Director');
  const [notes, setNotes] = useState('');
  const [websiteUrlHp, setWebsiteUrlHp] = useState('');
  const [consentToTerms, setConsentToTerms] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const idempotencyKeyRef = useRef<string | null>(null);

  const selectedProduct = products.find((p) => p.id === productId);

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!productId && customDescription.trim().length < 3) {
      errs.product = isFa ? 'لطفاً یک نهاده را انتخاب کنید یا شرح کالا را بنویسید.' : 'Select a product or provide description.';
    }
    const qNum = Number(quantity);
    if (!quantity || Number.isNaN(qNum) || qNum <= 0) {
      errs.quantity = isFa ? 'تناژ یا مقدار باید عددی بزرگ‌تر از صفر باشد.' : 'Quantity must be positive.';
    }
    if (destinationCity.trim().length < 2) {
      errs.destinationCity = isFa ? 'شهر یا بندر مقصد تحویل الزامی است.' : 'Destination port/city is required.';
    }
    if (companyName.trim().length < 2) {
      errs.companyName = isFa ? 'نام کامل شرکت یا واحد پرورشی خریدار الزامی است.' : 'Company name is required.';
    }
    if (contactName.trim().length < 2) {
      errs.contactName = isFa ? 'نام و نام خانوادگی مسئول خرید الزامی است.' : 'Contact name is required.';
    }
    if (!email.trim() || !EMAIL_PATTERN.test(email.trim())) {
      errs.email = isFa ? 'ایمیل معتبر سازمانی جهت ارسال پیش‌فاکتور الزامی است.' : 'Valid email is required.';
    }
    if (phone.trim().length > 3 && !PHONE_PATTERN.test(phone.trim())) {
      errs.phone = isFa ? 'شماره تماس باید با کد کشور (مانند ۹۸۹۱۲۱۲۳۴۵۶۷+) باشد.' : 'Phone must be in E.164 format (+98...).';
    }
    if (!consentToTerms) {
      errs.consent = isFa ? 'پذیرش شرایط و ضوابط بازرگانی الزامی است.' : 'You must accept the terms of trade.';
    }
    if (websiteUrlHp.trim().length > 0) {
      errs.form = isFa ? 'خطای اعتبارسنجی امنیتی.' : 'Security validation failed.';
    }
    return errs;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const key = (idempotencyKeyRef.current ??= crypto.randomUUID());
      const targetDate = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

      const lineDescription = selectedProduct
        ? selectedProduct.name[isFa ? 'fa' : 'en']
        : customDescription.trim();

      const payload = {
        company: {
          name: companyName.trim(),
          country: 'IR',
          ...(address.trim() ? { address: address.trim() } : {}),
        },
        contact: {
          name: contactName.trim(),
          email: email.trim(),
          ...(phone.trim().length > 3 ? { phone: phone.trim() } : {}),
          role: role.trim() || 'Procurement',
        },
        destinationCountry: 'IR',
        destinationCity: destinationCity.trim(),
        incoterm,
        incotermNamedPlace: incotermNamedPlace.trim() || destinationCity.trim(),
        targetDeliveryDate: targetDate,
        lines: [
          {
            description: lineDescription,
            quantity: String(quantity).trim(),
            unit,
            ...(specifications.trim() ? { specifications: specifications.trim() } : {}),
            ...(productId ? { productId } : {}),
          },
        ],
        notes: notes.trim() || undefined,
        websiteUrlHp: websiteUrlHp.trim(),
        consentToTerms: true,
      };

      const res = await fetch('/api/v1/rfqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': key,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.data?.reference) {
        setReference(data.data.reference);
      } else {
        const errorMsg =
          data?.error?.message ||
          (isFa ? 'خطایی در ثبت استعلام رخ داد. لطفاً فیلدها را بازبینی کنید.' : 'Failed to register RFQ.');
        setErrors({ form: errorMsg });
      }
    } catch {
      setErrors({
        form: isFa ? 'خطای شبکه در برقراری ارتباط با سرور. لطفاً مجدداً تلاش نمایید.' : 'Network error. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const copyRef = () => {
    if (!reference) return;
    navigator.clipboard.writeText(reference).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (reference) {
    return (
      <div className="rounded-3xl border border-primary/30 bg-surface-container-lowest p-8 shadow-hero md:p-12">
        <div className="flex items-center gap-3 text-secondary">
          <CheckCircle2 className="size-8 text-secondary" />
          <h2 className="text-2xl font-black text-on-surface">
            {isFa ? 'استعلام شما با موفقیت ثبت شد' : 'RFQ Submitted Successfully'}
          </h2>
        </div>

        <p className="mt-4 text-sm leading-7 text-on-surface-variant max-w-2xl">
          {isFa
            ? 'پرونده استعلام شما با شماره یکتای زیر در سامانه بازرگانی دنیای هوشمند آینده ثبت گردید. کارشناسان تأمین و جیره‌نویسی ظرف ۲ ساعت کاری پس از ارزیابی آنالیز و ظرفیت‌های انبارداری، پیش‌فاکتور رسمی را به ایمیل شما ارسال خواهند کرد.'
            : 'Your RFQ has been registered. Our trade desk will issue an official quotation with quality certificates to your email within 2 business hours.'}
        </p>

        {/* Reference Highlight Box */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-5">
          <div>
            <span className="block text-xs font-mono text-on-surface-variant/70">
              {isFa ? 'شماره پرونده استعلام (جهت پیگیری و رهگیری):' : 'Official RFQ Reference:'}
            </span>
            <span className="mt-1 block font-mono text-2xl font-bold tracking-wider text-primary">
              <bdi>{reference}</bdi>
            </span>
          </div>
          <button
            type="button"
            onClick={copyRef}
            className="flex items-center gap-2 rounded-full border border-outline-variant/40 bg-surface-container-lowest px-4 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors shadow-xs"
          >
            <Copy className="size-4" />
            <span>{copied ? (isFa ? 'کپی شد!' : 'Copied!') : isFa ? 'کپی شماره' : 'Copy Ref'}</span>
          </button>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href={`/track?reference=${reference}&email=${encodeURIComponent(email)}`}
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-7 text-sm font-semibold text-on-primary shadow-terracotta hover:bg-primary-container transition-all"
          >
            {isFa ? 'رهگیری لحظه‌ای وضعیت این استعلام' : 'Track This Inquiry'}
          </Link>
          <Link
            href="/products"
            className="inline-flex h-11 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-low px-6 text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
          >
            {isFa ? 'بازگشت به کاتالوگ نهاده‌ها' : 'Back to Catalog'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      {/* SLA Assurance Banner */}
      <div className="flex items-center gap-2 rounded-full bg-secondary-fixed/50 px-4 py-2 text-xs text-on-secondary-fixed-variant border border-secondary-fixed font-semibold w-max max-w-full">
        <span className="size-2 rounded-full bg-secondary animate-pulse shrink-0"></span>
        <span>صدور پیش‌فاکتور رسمی ممهور در کمتر از ۲ ساعت کاری • رعایت کامل الزامات مودیان و بازارگاه</span>
      </div>

      {errors.form && (
        <Notice variant="danger" role="alert">
          {errors.form}
        </Notice>
      )}

      {/* Honeypot for Bot Prevention */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor={hpId}>Website</label>
        <input
          id={hpId}
          type="text"
          value={websiteUrlHp}
          onChange={(e) => setWebsiteUrlHp(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* 1. Commodity & Volume Section */}
      <section className="bento-card-static bg-surface-container-lowest p-6 shadow-bento md:p-8">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3">
          <span className="size-7 rounded-xl bg-primary-fixed/80 text-on-primary-fixed-variant flex items-center justify-center font-bold text-xs">۰۱</span>
          <h2 className="text-lg font-bold text-on-surface">
            {isFa ? 'مشخصات نهاده و تناژ درخواستی' : 'Feed Product & Volume Specifications'}
          </h2>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Product Select */}
          <FormField
            label={isFa ? 'انتخاب نهاده از کاتالوگ' : 'Select Product'}
            hint={isFa ? 'یا مورد سفارشی' : 'Or custom'}
            error={errors.product}
          >
            <Select
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                if (errors.product) setErrors((prev) => ({ ...prev, product: '' }));
              }}
            >
              <option value="">{isFa ? '— انتخاب نهاده از فهرست محصولات —' : '— Select a product —'}</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name[isFa ? 'fa' : 'en']} (HS: {p.hsCode})
                </option>
              ))}
            </Select>
          </FormField>

          {/* Custom Description if not in catalog */}
          {!productId && (
            <FormField
              label={isFa ? 'شرح نهاده سفارشی' : 'Custom Feed Description'}
              required
              error={errors.product}
            >
              <Input
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder={isFa ? 'مثال: کنجاله آفتابگردان، گلوتن ذرت و...' : 'e.g., Corn Gluten Meal, Sunflower Meal'}
              />
            </FormField>
          )}

          {/* Quantity */}
          <div className="grid grid-cols-[2fr_1fr] gap-3">
            <FormField label={isFa ? 'تناژ / مقدار درخواستی' : 'Required Quantity'} required error={errors.quantity}>
              <Input
                type="number"
                min="1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </FormField>
            <FormField label={isFa ? 'واحد' : 'Unit'}>
              <Select value={unit} onChange={(e) => setUnit(e.target.value as 'metric_ton' | 'kg')}>
                <option value="metric_ton">{isFa ? 'تن متری' : 'MT'}</option>
                <option value="kg">{isFa ? 'کیلوگرم' : 'KG'}</option>
              </Select>
            </FormField>
          </div>

          {/* Incoterm */}
          <FormField label={isFa ? 'ترم تحویل تجاری (Incoterms 2020)' : 'Trade Term (Incoterms 2020)'}>
            <Select value={incoterm} onChange={(e) => setIncoterm(e.target.value as Incoterm)}>
              {INCOTERMS.map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </Select>
          </FormField>

          {/* Destination Port / City */}
          <FormField
            label={isFa ? 'شهر، بندر یا سیلوی مقصد تحویل' : 'Destination Port or Hub'}
            required
            error={errors.destinationCity}
          >
            <Input
              value={destinationCity}
              onChange={(e) => setDestinationCity(e.target.value)}
              placeholder={isFa ? 'بندر امام خمینی، بندر امیرآباد، تهران و...' : 'Bandar Imam, Amirabad, etc.'}
            />
          </FormField>
        </div>

        {/* Technical Specs Notes */}
        <div className="mt-6">
          <FormField
            label={isFa ? 'الزامات کیفی و شرایط آنالیز آزمایشگاهی (اختیاری)' : 'Quality Assays & Assay Limits (Optional)'}
            hint={isFa ? 'حداکثر رطوبت، پروتئین مدنظر، نوع بسته‌بندی' : 'Moisture, protein, packing preferences'}
          >
            <Textarea
              rows={3}
              value={specifications}
              onChange={(e) => setSpecifications(e.target.value)}
              placeholder={isFa ? 'مثال: حداکثر رطوبت ۱۲٪، آفلاتوکسین زیر ۱۰ ppb، بسته‌بندی جامبوبگ ۱۰۰۰ کیلویی' : 'e.g., Moisture < 12%, Aflatoxin < 10 ppb, 1000 kg jumbo bags'}
            />
          </FormField>
        </div>
      </section>

      {/* 2. Buyer Profile & Verification Section */}
      <section className="bento-card-static bg-surface-container-lowest p-6 shadow-bento md:p-8">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3">
          <span className="size-7 rounded-xl bg-secondary-fixed/80 text-on-secondary-fixed-variant flex items-center justify-center font-bold text-xs">۰۲</span>
          <h2 className="text-lg font-bold text-on-surface">
            {isFa ? 'اطلاعات شرکت و خریدار' : 'Buyer & Enterprise Credentials'}
          </h2>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <FormField label={isFa ? 'نام رسمی شرکت / واحد دامداری و طیور' : 'Company / Farm Registered Name'} required error={errors.companyName}>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder={isFa ? 'شرکت خوراک دام و طیور...' : 'Livestock Feed Co...'}
            />
          </FormField>

          <FormField label={isFa ? 'آدرس یا استان محل کارخانه / سیلو' : 'Plant / Silo Location'}>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={isFa ? 'استان، شهر، شهرک صنعتی یا نشانی سیلو' : 'City, Industrial Park, or Silo Address'}
            />
          </FormField>

          <FormField label={isFa ? 'نام و نام خانوادگی نماینده خرید' : 'Procurement Officer Name'} required error={errors.contactName}>
            <Input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
          </FormField>

          <FormField label={isFa ? 'سمت سازمانی' : 'Role in Company'}>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </FormField>

          <FormField label={isFa ? 'ایمیل سازمانی (جهت ارسال پیش‌فاکتور)' : 'Corporate Email for Quotations'} required error={errors.email}>
            <Input
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="procurement@company.com"
            />
          </FormField>

          <FormField label={isFa ? 'شماره تماس همراه (همراه با کد کشور)' : 'Phone Number (+E.164)'} hint="+98912..." error={errors.phone}>
            <Input
              type="tel"
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </FormField>
        </div>

        <div className="mt-6">
          <FormField label={isFa ? 'توضیحات تکمیلی یا پیام به تیم بازرگانی' : 'Additional Notes'}>
            <Textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isFa ? 'هرگونه هماهنگی در خصوص زمان‌بندی بارگیری یا شرایط پرداخت...' : 'Any notes on loading schedules or payment preferences...'}
            />
          </FormField>
        </div>

        {/* Terms Consent */}
        <div className="mt-6 flex flex-col gap-1.5 border-t border-outline-variant/30 pt-4">
          <label htmlFor={consentId} className="flex items-start gap-2.5 text-sm text-on-surface cursor-pointer">
            <input
              id={consentId}
              type="checkbox"
              checked={consentToTerms}
              onChange={(e) => setConsentToTerms(e.target.checked)}
              className="mt-1 size-4 accent-primary"
            />
            <span>
              {isFa ? (
                <>
                  کلیه اطلاعات واردشده را تأیید نموده و با{' '}
                  <Link href="/terms" target="_blank" className="text-primary hover:underline font-medium">
                    شرایط و ضوابط همکاری بازرگانی
                  </Link>{' '}
                  و{' '}
                  <Link href="/privacy" target="_blank" className="text-primary hover:underline font-medium">
                    سیاست محرمانگی اطلاعات
                  </Link>{' '}
                  شرکت دنیای هوشمند آینده موافقت دارم.
                </>
              ) : (
                'I confirm the details above and agree to the Terms of Trade and Privacy Policy.'
              )}
            </span>
          </label>
          {errors.consent && (
            <p role="alert" className="font-mono text-xs text-error">
              {errors.consent}
            </p>
          )}
        </div>
      </section>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          <ArrowLeft className="size-4 rtl:rotate-0 ltr:rotate-180" />
          <span>{isFa ? 'بازگشت به فهرست محصولات' : 'Back to Products'}</span>
        </Link>

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary px-9 py-4 text-sm font-bold text-on-primary shadow-terracotta hover:bg-primary-container hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60"
        >
          <span>
            {submitting
              ? isFa
                ? 'در حال ثبت پرونده استعلام...'
                : 'Submitting RFQ...'
              : isFa
                ? 'ارسال درخواست و صدور پیش‌فاکتور رسمی'
                : 'Submit RFQ'}
          </span>
          <Send className="size-4 rtl:rotate-180" />
        </button>
      </div>
    </form>
  );
}
