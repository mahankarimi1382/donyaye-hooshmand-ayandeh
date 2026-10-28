'use client';

import { useState } from 'react';
import { Check, X, ShieldAlert, ArrowLeft, Info, HelpCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';

interface IncotermsMatrixProps {
  locale: string;
}

interface TermDetail {
  code: string;
  nameFa: string;
  nameEn: string;
  riskTransferFa: string;
  riskTransferEn: string;
  sellerObligationsFa: string[];
  buyerObligationsFa: string[];
  feedAdviceFa: string;
  feedAdviceEn: string;
  matrix: {
    loading: boolean; // Seller responsibility
    mainFreight: boolean;
    insurance: boolean;
    importCustoms: boolean;
    buyerSilo: boolean;
  };
}

const TERMS: TermDetail[] = [
  {
    code: 'FOB',
    nameFa: 'تحویل روی کشتی در بندر مبدأ (Free On Board)',
    nameEn: 'Free On Board',
    riskTransferFa: 'هنگام عبور کالا از لبه کشتی در بندر مبدأ بارگیری (مثلاً بندر سانتوس برزیل یا آکتائو قزاقستان)',
    riskTransferEn: 'When goods pass the ship rail at the port of origin',
    sellerObligationsFa: ['تحویل کالا روی کشتی در بندر مبدأ', 'انجام تشریفات گمرکی صادراتی', 'هزینه بارگیری در مبدأ'],
    buyerObligationsFa: ['عقد قرارداد و پرداخت کرایه حمل دریایی', 'خرید بیمه‌نامه باربری دریایی', 'ترخیص گمرکی در بندر مقصد'],
    feedAdviceFa:
      'مناسب برای شرکت‌های بازرگانی نهاده‌ها که کشتی‌های اختصاصی چارتر دارند یا مایل به کنترل مستقیم نرخ کرایه حمل دریایی هستند.',
    feedAdviceEn:
      'Ideal for large feed importers with charter agreements who wish to independently manage maritime freight rates.',
    matrix: { loading: true, mainFreight: false, insurance: false, importCustoms: false, buyerSilo: false },
  },
  {
    code: 'CFR',
    nameFa: 'هزینه و کرایه حمل تا بندر مقصد (Cost and Freight)',
    nameEn: 'Cost and Freight',
    riskTransferFa: 'ریسک در بندر مبدأ منتقل می‌شود اما هزینه کرایه حمل تا اسکله بندر امام یا امیرآباد با شرکت است',
    riskTransferEn: 'Risk transfers at origin; seller pays main ocean freight to destination port',
    sellerObligationsFa: ['تأمین کالا و بارگیری در مبدأ', 'پرداخت کرایه حمل دریایی تا بندر مقصد', 'ارائه بارنامه پاک (Clean B/L)'],
    buyerObligationsFa: ['خرید بیمه باربری', 'ترخیص در گمرک مقصد و پرداخت حقوق ورودی', 'هزینه‌های تخلیه در مقصد'],
    feedAdviceFa:
      'پرکاربردترین ترم در خرید فله ذرت و کنجاله سویا؛ خریدار نیازی به درگیری با عملیات کشتی‌رانی بین‌المللی ندارد.',
    feedAdviceEn:
      'The most widely applied term in bulk corn and soymeal trades, freeing the buyer from complex vessel charters.',
    matrix: { loading: true, mainFreight: true, insurance: false, importCustoms: false, buyerSilo: false },
  },
  {
    code: 'CIF',
    nameFa: 'هزینه، بیمه و کرایه حمل (Cost, Insurance and Freight)',
    nameEn: 'Cost, Insurance and Freight',
    riskTransferFa: 'ریسک روی عرشه مبدأ منتقل می‌شود؛ شرکت هزینه حمل و پوشش بیمه باربری استاندارد را متقبل می‌شود',
    riskTransferEn: 'Seller arranges and covers carriage plus marine cargo insurance to destination port',
    sellerObligationsFa: ['هزینه حمل تا بندر مقصد', 'خرید بیمه‌نامه رسمی باربری به نفع خریدار', 'تشریفات صادراتی مبدأ'],
    buyerObligationsFa: ['ترخیص در گمرک بندر امام یا امیرآباد', 'تخلیه و بارگیری به کامیون یا سیلو'],
    feedAdviceFa:
      'گزینه‌ای امن برای مدیریت ریسک مفقودی یا خسارت دریایی در طول اقیانوس‌پیماها و خطوط دریای خزر.',
    feedAdviceEn:
      'Recommended for mitigating transit perils across deep-sea and Caspian bulk corridors.',
    matrix: { loading: true, mainFreight: true, insurance: true, importCustoms: false, buyerSilo: false },
  },
  {
    code: 'CPT',
    nameFa: 'تحویل با پرداخت کرایه حمل تا مقصد خریدار (Carriage Paid To)',
    nameEn: 'Carriage Paid To',
    riskTransferFa: 'تحویل کالا به اولین متصدی حمل داخلی، هزینه حمل تا سیلوی کارخانه خریدار به عهده شرکت است',
    riskTransferEn: 'Carriage paid by seller directly to the buyer designated feed silo or plant',
    sellerObligationsFa: ['حمل دریایی و ریلی/جاده‌ای تا محل کارخانه', 'ترخیص و صدور بارنامه سراسری'],
    buyerObligationsFa: ['تخلیه بار در سیلوی کارخانه', 'بیمه‌نامه مسیر داخلی'],
    feedAdviceFa:
      'ایده‌آل برای کارخانجات خوراک دام که مایل به تحویل بار مستقیم در محل کارخانه بدون درگیری با اسکله هستند.',
    feedAdviceEn:
      'Optimal for regional feed mill corporations requesting direct silo delivery without port handling overhead.',
    matrix: { loading: true, mainFreight: true, insurance: true, importCustoms: true, buyerSilo: false },
  },
];

export function IncotermsMatrix({ locale }: IncotermsMatrixProps) {
  const isFa = locale === 'fa';
  const [selectedTermCode, setSelectedTermCode] = useState<string>('CFR');

  const term = TERMS.find((t) => t.code === selectedTermCode) ?? TERMS[1];

  return (
    <div className="w-full rounded-3xl border border-m3-outline-variant/40 bg-m3-surface-lowest p-6 sm:p-8 shadow-m3-2 text-start">
      {/* Term Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-m3-outline-variant/30">
        <span className="text-xs font-bold text-m3-outline shrink-0 me-2">
          {isFa ? 'انتخاب ترم اینکوترمز:' : 'Select Term:'}
        </span>
        {TERMS.map((t) => (
          <button
            key={t.code}
            type="button"
            onClick={() => setSelectedTermCode(t.code)}
            className={`m3-press-state rounded-full px-5 py-2 text-xs font-black transition-all font-mono shrink-0 ${
              selectedTermCode === t.code
                ? 'bg-m3-primary text-white shadow-m3-1'
                : 'bg-m3-surface-container text-m3-on-surface-variant hover:bg-m3-surface-container-high'
            }`}
          >
            {t.code}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-base font-black text-m3-primary">{term.code}</span>
            <span className="text-xs text-m3-outline">•</span>
            <h4 className="text-lg font-bold text-m3-on-surface">{isFa ? term.nameFa : term.nameEn}</h4>
          </div>
          <p className="text-xs text-m3-on-surface-variant leading-relaxed">
            <span className="font-bold text-m3-on-surface">{isFa ? 'نقطه انتقال ریسک: ' : 'Risk Transfer Point: '}</span>
            {isFa ? term.riskTransferFa : term.riskTransferEn}
          </p>
        </div>

        {/* Comparison Matrix Table */}
        <div className="overflow-x-auto rounded-2xl border border-m3-outline-variant/30 bg-m3-surface-container/40">
          <table className="w-full text-xs text-start border-collapse">
            <thead>
              <tr className="border-b border-m3-outline-variant/30 bg-m3-surface-container text-m3-on-surface font-bold">
                <th className="p-3.5 text-start">مرحله زنجیره تأمین</th>
                <th className="p-3.5 text-center">مسئولیت شرکت</th>
                <th className="p-3.5 text-center">مسئولیت خریدار</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-m3-outline-variant/20">
              <tr>
                <td className="p-3.5 font-medium text-m3-on-surface">۱. تأمین و بارگیری روی کشتی در مبدأ</td>
                <td className="p-3.5 text-center">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                    <Check className="size-4" /> به عهده شرکت
                  </span>
                </td>
                <td className="p-3.5 text-center text-m3-outline">-</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-m3-on-surface">۲. کرایه حمل اصلی دریایی / ریلی</td>
                <td className="p-3.5 text-center">
                  {term.matrix.mainFreight ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                      <Check className="size-4" /> به عهده شرکت
                    </span>
                  ) : (
                    <span className="text-m3-outline">-</span>
                  )}
                </td>
                <td className="p-3.5 text-center">
                  {!term.matrix.mainFreight ? (
                    <span className="inline-flex items-center gap-1 text-amber-800 font-bold">
                      به عهده خریدار
                    </span>
                  ) : (
                    <span className="text-m3-outline">-</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-m3-on-surface">۳. بیمه باربری بین‌المللی</td>
                <td className="p-3.5 text-center">
                  {term.matrix.insurance ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                      <Check className="size-4" /> به عهده شرکت
                    </span>
                  ) : (
                    <span className="text-m3-outline">-</span>
                  )}
                </td>
                <td className="p-3.5 text-center">
                  {!term.matrix.insurance ? (
                    <span className="inline-flex items-center gap-1 text-amber-800 font-bold">
                      به عهده خریدار
                    </span>
                  ) : (
                    <span className="text-m3-outline">-</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-m3-on-surface">۴. ترخیص گمرکی و حقوق ورودی در بنادر ایران</td>
                <td className="p-3.5 text-center">
                  {term.matrix.importCustoms ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                      <Check className="size-4" /> به عهده شرکت
                    </span>
                  ) : (
                    <span className="text-m3-outline">-</span>
                  )}
                </td>
                <td className="p-3.5 text-center">
                  {!term.matrix.importCustoms ? (
                    <span className="inline-flex items-center gap-1 text-amber-800 font-bold">
                      به عهده خریدار
                    </span>
                  ) : (
                    <span className="text-m3-outline">-</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Practical Feed Advice Box */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/60 text-xs text-amber-900 flex items-start gap-3">
          <Info className="size-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">توصیه بازرگانی شرکت به خریداران خوراک:</span>
            <p className="leading-relaxed">{isFa ? term.feedAdviceFa : term.feedAdviceEn}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
