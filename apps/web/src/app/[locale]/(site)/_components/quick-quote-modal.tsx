'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle2, Copy, Send, Building2, User, Phone, Mail, Scale, Warehouse } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { ProductRecord } from '@/lib/types';

interface QuickQuoteModalProps {
  product: ProductRecord | null;
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

export function QuickQuoteModal({ product, isOpen, onClose, locale }: QuickQuoteModalProps) {
  const isFa = locale === 'fa';

  const [quantity, setQuantity] = useState('100');
  const [port, setPort] = useState('بندر امام خمینی (ره)');
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!product) return;
    setQuantity(product.moqQuantity || '100');
    setPort(product.originPort[isFa ? 'fa' : 'en'] || 'بندر امام خمینی (ره)');
    setReference(null);
    setError(null);
  }, [product, isFa]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!companyName.trim() || !contactName.trim() || !contactInfo.trim()) {
      setError(isFa ? 'لطفاً تمامی فیلدهای الزامی را تکمیل نمایید.' : 'Please fill all required fields.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const email = contactInfo.includes('@') ? contactInfo.trim() : `${contactInfo.replace(/[^0-9]/g, '')}@lead.ayandeh-feed.com`;
      const phone = !contactInfo.includes('@') ? contactInfo.trim() : undefined;

      const payload = {
        company: {
          name: companyName.trim(),
          country: 'IR',
        },
        contact: {
          name: contactName.trim(),
          email,
          ...(phone ? { phone: phone.startsWith('+') ? phone : `+98${phone.replace(/^0/, '')}` } : {}),
          role: 'Procurement',
        },
        destinationCountry: 'IR',
        destinationCity: port,
        incoterm: 'FOB',
        incotermNamedPlace: port,
        targetDeliveryDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        lines: [
          {
            description: product.name[isFa ? 'fa' : 'en'],
            quantity: String(quantity),
            unit: 'metric_ton',
            productId: product.id,
          },
        ],
        websiteUrlHp: '',
        consentToTerms: true,
      };

      const res = await fetch('/api/v1/rfqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.data?.reference) {
        setReference(data.data.reference);
      } else {
        setError(data?.error?.message || (isFa ? 'خطایی در ثبت استعلام رخ داد.' : 'Failed to submit RFQ.'));
      }
    } catch {
      setError(isFa ? 'خطای شبکه در برقراری ارتباط با سرور.' : 'Network error.');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg bg-surface-container-lowest rounded-3xl border border-outline-variant/35 shadow-hero p-6 sm:p-8 z-10 transition-all text-start"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary"></span>
            <h3 className="text-lg font-bold text-on-surface">
              {isFa ? 'استعلام قیمت و صدور پرفورما' : 'Request Proforma Quotation'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-low transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {reference ? (
          /* Success View */
          <div className="py-6 space-y-5">
            <div className="flex items-center gap-2 text-secondary">
              <CheckCircle2 className="size-6 text-secondary shrink-0" />
              <span className="font-bold text-base text-on-surface">
                {isFa ? 'درخواست پرفورما با موفقیت ثبت شد' : 'RFQ Registered Successfully'}
              </span>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              {isFa
                ? 'پیش‌فاکتور رسمی ممهور برای شما در سامانه ثبت گردید و کارشناس بازرگانی کمتر از ۲ ساعت آینده با شما تماس خواهد گرفت.'
                : 'Your official quotation request has been logged. Our sales desk will follow up within 2 hours.'}
            </p>

            <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-low p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-on-surface-variant/70 block">شماره پرونده:</span>
                <span className="font-mono text-lg font-bold text-primary block" dir="ltr">
                  <bdi>{reference}</bdi>
                </span>
              </div>
              <button
                type="button"
                onClick={copyRef}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant/40 bg-surface-container-lowest text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors"
              >
                <Copy className="size-3.5" />
                <span>{copied ? (isFa ? 'کپی شد' : 'Copied') : isFa ? 'کپی' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <Link
                href={`/track?reference=${reference}`}
                className="inline-flex items-center justify-center flex-1 h-11 rounded-full bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container shadow-terracotta transition-all"
              >
                {isFa ? 'رهگیری این پرونده' : 'Track Case'}
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center h-11 px-5 rounded-full border border-outline-variant/40 bg-surface-container-low text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors"
              >
                {isFa ? 'بستن' : 'Close'}
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {error && (
              <div className="p-3 rounded-2xl bg-error-container/40 border border-error/30 text-xs text-error font-medium">
                {error}
              </div>
            )}

            {/* Product Summary Tag */}
            <div className="p-3 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-on-surface block">{product.name[isFa ? 'fa' : 'en']}</span>
                <span className="text-[11px] font-mono text-on-surface-variant/70 block" dir="ltr">
                  <bdi>HS: {product.hsCode}</bdi>
                </span>
              </div>
              <span className="font-mono text-xs text-primary font-bold">
                حداقل: {product.moqQuantity} تن
              </span>
            </div>

            {/* Volume & Port */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container-low/60 rounded-2xl px-3.5 py-2 border border-outline-variant/30 focus-within:border-primary transition-colors">
                <label className="block text-[10px] font-semibold text-on-surface-variant flex items-center gap-1">
                  <Scale className="size-3 text-primary" />
                  <span>تناژ درخواستی (تن)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-transparent border-0 p-0 text-xs sm:text-sm font-bold text-on-surface focus:outline-none focus:ring-0 mt-0.5"
                />
              </div>

              <div className="bg-surface-container-low/60 rounded-2xl px-3.5 py-2 border border-outline-variant/30 focus-within:border-primary transition-colors">
                <label className="block text-[10px] font-semibold text-on-surface-variant flex items-center gap-1">
                  <Warehouse className="size-3 text-secondary" />
                  <span>پایانه و بارانداز</span>
                </label>
                <select
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  className="w-full bg-transparent border-0 p-0 text-xs font-semibold text-on-surface focus:outline-none focus:ring-0 mt-0.5 cursor-pointer"
                >
                  <option value="بندر امام خمینی (ره)">بندر امام خمینی (ره)</option>
                  <option value="بندر امیرآباد">بندر امیرآباد</option>
                  <option value="تحویل انبار مقصد">تحویل انبار مقصد</option>
                </select>
              </div>
            </div>

            {/* Company & Buyer Details */}
            <div className="bg-surface-container-low/60 rounded-2xl px-3.5 py-2 border border-outline-variant/30 focus-within:border-primary transition-colors">
              <label className="block text-[10px] font-semibold text-on-surface-variant flex items-center gap-1">
                <Building2 className="size-3 text-secondary" />
                <span>نام شرکت یا واحد پرورشی</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="مثال: شرکت خوراک دام و طیور البرز"
                className="w-full bg-transparent border-0 p-0 text-xs font-semibold text-on-surface focus:outline-none focus:ring-0 mt-0.5 placeholder:text-on-surface-variant/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container-low/60 rounded-2xl px-3.5 py-2 border border-outline-variant/30 focus-within:border-primary transition-colors">
                <label className="block text-[10px] font-semibold text-on-surface-variant flex items-center gap-1">
                  <User className="size-3 text-primary" />
                  <span>نام نماینده خرید</span>
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="نام و نام خانوادگی"
                  className="w-full bg-transparent border-0 p-0 text-xs font-semibold text-on-surface focus:outline-none focus:ring-0 mt-0.5 placeholder:text-on-surface-variant/40"
                />
              </div>

              <div className="bg-surface-container-low/60 rounded-2xl px-3.5 py-2 border border-outline-variant/30 focus-within:border-primary transition-colors">
                <label className="block text-[10px] font-semibold text-on-surface-variant flex items-center gap-1">
                  <Phone className="size-3 text-secondary" />
                  <span>شماره تماس یا ایمیل</span>
                </label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="۰۹۱۲... یا ایمیل"
                  className="w-full bg-transparent border-0 p-0 text-xs font-semibold text-on-surface focus:outline-none focus:ring-0 mt-0.5 placeholder:text-on-surface-variant/40 text-start"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Fast SLA badge */}
            <div className="p-2.5 rounded-xl bg-secondary-fixed/50 border border-secondary-fixed text-[11px] text-on-secondary-fixed-variant flex items-center gap-1.5 font-medium">
              <span className="size-1.5 rounded-full bg-secondary animate-pulse"></span>
              <span>صدور آنی پیش‌فاکتور رسمی ممهور در کمتر از ۲ ساعت</span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="h-11 px-5 rounded-full border border-outline-variant/40 text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors"
              >
                انصراف
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 flex-1 h-11 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold shadow-terracotta transition-all disabled:opacity-60"
              >
                <span>{submitting ? 'در حال ثبت...' : 'ثبت و صدور پیش‌فاکتور'}</span>
                <Send className="size-3.5 rtl:rotate-180" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
