'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Search, CheckCircle2, Clock, AlertCircle, ArrowLeft, RefreshCw, FileText, Truck, ShieldCheck } from 'lucide-react';
import { formatJalaliDate, type Dictionary } from '@karvan/i18n';
import { Button, FormField, Input, Notice } from '@karvan/ui';

import { Link } from '@/i18n/navigation';

interface TrackViewProps {
  initialReference?: string;
  initialEmail?: string;
  dictionary: Dictionary;
  locale: string;
}

interface TrackData {
  kind: 'rfq' | 'quote' | 'case';
  reference: string;
  status: string;
  lastUpdate: string;
  buyerName: string;
  commodity: { fa: string; en: string };
  incoterm: string;
}

export function TrackView({ initialReference = '', initialEmail = '', dictionary, locale }: TrackViewProps) {
  const isFa = locale === 'fa';
  const [reference, setReference] = useState(initialReference);
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackData | null>(null);

  const fetchTracking = async (refVal: string, emailVal: string) => {
    if (!refVal.trim()) {
      setError(isFa ? 'لطفاً شماره پرونده را وارد نمایید.' : 'Please enter reference number.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const params = new URLSearchParams({ reference: refVal.trim() });
      if (emailVal.trim()) params.set('email', emailVal.trim());

      const res = await fetch(`/api/v1/track?${params.toString()}`);
      const body = await res.json().catch(() => null);

      if (res.ok && body?.data) {
        setResult(body.data as TrackData);
      } else {
        setError(
          isFa
            ? 'پرونده‌ای با این مشخصات یافت نشد. لطفاً از صحت شماره استعلام (مانند RFQ-1405-00001) و تطابق ایمیل اطمینان حاصل فرمایید.'
            : 'No record found with this reference and email combination. Please verify your reference number.',
        );
      }
    } catch {
      setError(
        isFa
          ? 'خطا در ارتباط با سامانه رهگیری. لطفاً اتصال اینترنت خود را بررسی کرده و مجدداً تلاش فرمایید.'
          : 'Network error occurred while fetching tracking data.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialReference.trim()) {
      fetchTracking(initialReference, initialEmail);
    }
  }, [initialReference, initialEmail]);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchTracking(reference, email);
  };

  const statusLabel = (status: string) => {
    const map: Record<string, { fa: string; en: string; tone: 'clear' | 'ochre' | 'seal' | 'harbor' }> = {
      submitted: { fa: 'ثبت اولیه — در نوبت بررسی', en: 'Submitted — In Queue', tone: 'harbor' },
      under_review: { fa: 'در حال ارزیابی آنالیز کیفی', en: 'Under Quality Review', tone: 'ochre' },
      quote_preparation: { fa: 'محاسبه قیمت و آماده‌سازی پیش‌فاکتور', en: 'Pricing & Proforma Preparation', tone: 'ochre' },
      quoted: { fa: 'پیش‌فاکتور رسمی صادر شد', en: 'Proforma Issued', tone: 'clear' },
      accepted: { fa: 'تأیید نهایی و عقد قرارداد تأمین', en: 'Accepted & Contracted', tone: 'clear' },
      rejected: { fa: 'عدم انطباق یا رد استعلام', en: 'Declined / Disqualified', tone: 'seal' },
      expired: { fa: 'مهلت پیش‌فاکتور منقضی شد', en: 'Expired', tone: 'seal' },
    };
    return map[status] ?? { fa: status, en: status, tone: 'harbor' };
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Tracking Search Input Card */}
      <form onSubmit={handleSearch} className="bento-card-static bg-surface-container-lowest p-6 shadow-bento md:p-8">
        <h2 className="text-xl font-bold text-on-surface">
          {isFa ? 'استعلام وضعیت پرونده' : 'Track Case Details'}
        </h2>
        <p className="mt-1 text-xs text-on-surface-variant">
          {isFa
            ? 'شماره پرونده درج‌شده در رسید استعلام (با پیشوند RFQ یا QUOTE) را وارد کنید.'
            : 'Enter the reference code provided upon submission.'}
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <FormField label={isFa ? 'شماره پرونده یا کدرهگیری' : 'Reference Number'} required>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="RFQ-1405-00001"
              dir="ltr"
              className="font-mono text-center sm:text-start"
            />
          </FormField>

          <FormField label={isFa ? 'ایمیل ثبت‌شده خریدار (اختیاری جهت راستی‌آزمایی)' : 'Registered Email'}>
            <Input
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="procurement@company.com"
            />
          </FormField>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="font-mono text-primary font-bold">نمونه تستی:</span>
            <button
              type="button"
              onClick={() => {
                setReference('RFQ-1405-00001');
                fetchTracking('RFQ-1405-00001', '');
              }}
              className="font-mono text-primary hover:underline font-semibold"
            >
              RFQ-1405-00001
            </button>
            <span>یا</span>
            <button
              type="button"
              onClick={() => {
                setReference('RFQ-1405-00002');
                fetchTracking('RFQ-1405-00002', '');
              }}
              className="font-mono text-primary hover:underline font-semibold"
            >
              RFQ-1405-00002
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-xs font-semibold text-on-primary shadow-terracotta hover:bg-primary-container hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60"
          >
            <Search className="size-4" />
            <span>{loading ? (isFa ? 'در حال جست‌وجو...' : 'Searching...') : isFa ? 'رهگیری پرونده' : 'Track'}</span>
          </button>
        </div>
      </form>

      {/* Error Notice */}
      {error && (
        <Notice variant="danger" role="alert">
          {error}
        </Notice>
      )}

      {/* Result Display */}
      {result && (
        <div className="flex flex-col gap-6 rounded-3xl border border-primary/30 bg-surface-container-lowest p-6 shadow-hero md:p-8">
          {/* Top Bar: Reference & Status */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/30 pb-5">
            <div>
              <span className="text-xs font-mono text-on-surface-variant">
                {isFa ? 'شماره سند رهگیری‌شده:' : 'Tracked Reference:'}
              </span>
              <h3 className="mt-1 font-mono text-2xl font-bold tracking-wider text-primary">
                <bdi>{result.reference}</bdi>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed/60 border border-secondary-fixed px-4 py-1.5 text-xs font-semibold text-on-secondary-fixed-variant">
                <Clock className="size-3.5 text-secondary" />
                <span>{statusLabel(result.status)[isFa ? 'fa' : 'en']}</span>
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
              <span className="text-xs text-on-surface-variant block">{isFa ? 'نهاده / موضوع:' : 'Commodity:'}</span>
              <span className="mt-1.5 text-sm font-semibold text-on-surface block truncate">
                {result.commodity[isFa ? 'fa' : 'en']}
              </span>
            </div>

            <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
              <span className="text-xs text-on-surface-variant block">{isFa ? 'طرف خریدار:' : 'Buyer Enterprise:'}</span>
              <span className="mt-1.5 text-sm font-semibold text-on-surface block truncate">
                {result.buyerName}
              </span>
            </div>

            <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
              <span className="text-xs text-on-surface-variant block">{isFa ? 'ترم تجاری تحویل:' : 'Incoterm:'}</span>
              <span className="mt-1.5 text-sm font-mono font-semibold text-on-surface block">
                {result.incoterm || 'FOB'}
              </span>
            </div>

            <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-4">
              <span className="text-xs text-on-surface-variant block">{isFa ? 'آخرین به‌روزرسانی:' : 'Last Updated:'}</span>
              <span className="mt-1.5 text-sm font-mono text-on-surface block">
                {formatJalaliDate(result.lastUpdate, isFa ? 'fa' : 'en')}
              </span>
            </div>
          </div>

          {/* Progress Milestones Visual */}
          <div className="mt-4 border-t border-outline-variant/25 pt-6">
            <h4 className="text-sm font-bold text-on-surface">
              {isFa ? 'مراحل گردش کار و پایش زنجیره تأمین:' : 'Workflow Milestones:'}
            </h4>

            <div className="mt-6 grid gap-4 sm:grid-cols-4">
              <div className="flex flex-col gap-2 rounded-2xl border border-secondary-fixed bg-secondary-fixed/20 p-4">
                <div className="flex items-center gap-2 text-secondary">
                  <CheckCircle2 className="size-4" />
                  <span className="text-xs font-bold">{isFa ? '۱. ثبت استعلام' : '1. Submission'}</span>
                </div>
                <p className="text-[11px] leading-5 text-on-surface-variant">
                  {isFa ? 'درخواست به سامانه واصل و شماره پرونده ثبت شد.' : 'RFQ registered in system.'}
                </p>
              </div>

              <div className="flex flex-col gap-2 rounded-2xl border border-primary-fixed bg-primary-fixed/20 p-4">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="size-4" />
                  <span className="text-xs font-bold">{isFa ? '۲. کنترل کیفی و قیمت' : '2. Quality & Pricing'}</span>
                </div>
                <p className="text-[11px] leading-5 text-on-surface-variant">
                  {isFa ? 'ارزیابی آنالیز آزمایشگاهی و محاسبه شرایط حمل در بنادر.' : 'Assay evaluation and landed cost calculation.'}
                </p>
              </div>

              <div className="flex flex-col gap-2 rounded-2xl border border-outline-variant/30 bg-surface-container-low/60 p-4">
                <div className="flex items-center gap-2 text-on-surface-variant/80">
                  <FileText className="size-4 text-primary" />
                  <span className="text-xs font-bold">{isFa ? '۳. صدور پیش‌فاکتور' : '3. Proforma Issuance'}</span>
                </div>
                <p className="text-[11px] leading-5 text-on-surface-variant">
                  {isFa ? 'ارسال پیش‌فاکتور رسمی با مهلت اعتبار ۷۲ ساعته.' : 'Issuance of official quotation.'}
                </p>
              </div>

              <div className="flex flex-col gap-2 rounded-2xl border border-outline-variant/30 bg-surface-container-low/60 p-4">
                <div className="flex items-center gap-2 text-on-surface-variant/80">
                  <Truck className="size-4 text-secondary" />
                  <span className="text-xs font-bold">{isFa ? '۴. ترخیص و بارگیری' : '4. Dispatch & Logistics'}</span>
                </div>
                <p className="text-[11px] leading-5 text-on-surface-variant">
                  {isFa ? 'بارگیری از بنادر و تحویل در سیلو و انبار خریدار.' : 'Dispatch and delivery at destination silo.'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant/25 pt-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors"
            >
              <span>{isFa ? 'نیاز به هماهنگی با کارشناس بازرگانی دارید؟ تماس با ما' : 'Need assistance? Contact us'}</span>
              <ArrowLeft className="size-3.5 rtl:rotate-0 ltr:rotate-180" />
            </Link>

            <Link
              href="/rfq"
              className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-xs font-semibold text-on-primary hover:bg-primary-container shadow-xs transition-colors"
            >
              {isFa ? 'ثبت استعلام جدید' : 'Submit New RFQ'}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
