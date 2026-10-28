'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle, CheckCircle2 } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  standard?: string;
}

interface FeedFaqProps {
  locale: string;
}

export function FeedFaq({ locale }: FeedFaqProps) {
  const isFa = locale === 'fa';
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: isFa
        ? 'شاخص فعالیت اوره‌آز در کنجاله سویا چه اهمیتی دارد و حد مجاز آن چقدر است؟'
        : 'Why is urease activity critical in soybean meal and what is the standard range?',
      standard: isFa ? 'بازه استاندارد: ۰٫۰۵ تا ۰٫۲۰ mg N/g/min' : 'Standard range: 0.05 - 0.20 mg N/g/min',
      answer: isFa
        ? 'فعالیت اوره‌آز (Urease Activity) شاخص اصلی میزان حرارت‌دیدگی و فرآوری کنجاله سویاست. حرارت‌دهی مناسب فاکتورهای ضدتغذیه‌ای (مانند بازدارنده‌های تریپسین) را غیرفعال می‌کند. شاخص بالاتر از ۰٫۲۰ نشان‌دهنده خامی سویا و کاهش گوارش‌پذیری است و مقادیر کمتر از ۰٫۰۵ بیانگر سوختگی پروتئین و افت دسترسی به اسیدهای آمینه ضروری (به‌ویژه لیزین) می‌باشد.'
        : 'Urease activity indicates thermal processing adequacy in soybean meal to inactivate trypsin inhibitors. Values above 0.20 indicate under-cooking, while values below 0.05 indicate over-heating and lysine availability loss.',
    },
    {
      question: isFa
        ? 'چه آزمون‌های آزمایشگاهی برای ترخیص و پذیرش ذرت و جو دامی الزامی است؟'
        : 'Which laboratory assays are required for corn and barley port clearance?',
      standard: isFa ? 'استاندارد ملی ۳۲۱ و ۲۳۴۴ دامپزشکی' : 'National & IVO Standards',
      answer: isFa
        ? 'آزمون‌های الزامی شامل سنجش درصد رطوبت (حداکثر ۱۳٫۵ تا ۱۴٪ جهت جلوگیری از کپک‌زدگی)، آزمون آفلاتوکسین کل و B1 (حداکثر ۲۰ ppb با HPLC/الایزا)، دانه‌های شکسته و آسیب‌دیده، ناخالصی‌های خارجی و وزن هکتولیتر (حداقل ۶۲ کیلوگرم در جو دامی) است. تمامی محموله‌ها پیش از خروج از گمرک برگه تاییدیه قرنطینه استانی دریافت می‌کنند.'
        : 'Mandatory tests comprise moisture (< 14%), total Aflatoxin & B1 (< 20 ppb via HPLC), broken grains, foreign matter, and test weight (min 62 kg/hL for barley) under official veterinary clearance.',
    },
    {
      question: isFa
        ? 'مهم‌ترین فاکتورهای ایمنی در دی‌کلسیم فسفات (DCP) دامی کدامند؟'
        : 'What are the critical safety criteria for Feed Grade Dicalcium Phosphate (DCP)?',
      standard: isFa ? 'فسفر ۱۸٪، کلسیم ۲۳٪، فلوئور حداکثر ۰٫۱۸٪' : 'P min 18%, Ca min 23%, F max 0.18%',
      answer: isFa
        ? 'در DCP علاوه بر تأمین حداقل ۱۸٪ فسفر قابل دسترس و ۲۳٪ کلسیم، کنترل نسبت فلوئور به فسفر حیاتی است. بیش‌بود فلوئور (بالاتر از ۰٫۱۸٪) سبب بروز فلوئوروزیس، آسیب به استخوان‌بندی و افت تولید تخم‌مرغ و شیر در گله‌ها می‌شود. شرکت تنها محصولات دارای برگه آنالیز با فلزات سنگین صفر یا در حد استاندارد را تأمین می‌نماید.'
        : 'In addition to min 18% phosphorus and 23% calcium, strict control of fluorine (< 0.18%) and heavy metals is vital to prevent fluorosis and bone disorders in herds and flocks.',
    },
    {
      question: isFa
        ? 'نحوه محاسبه حداقل سفارش (MOQ) و شیوه‌های تحویل چگونه است؟'
        : 'How are Minimum Order Quantities (MOQ) and delivery terms determined?',
      standard: isFa ? 'اینکوترمز ۲۰۲۰ و حمل چندوجهی' : 'Incoterms 2020 Multi-modal',
      answer: isFa
        ? 'حداقل سفارش بر اساس نوع بسته‌بندی و شیوه حمل تعیین می‌شود: برای غلات فله تخلیه پای اسکله یا واگن باری حداقل سفارش یک پارت حمل (حدود ۲۵ تا ۵۰ تن برای حمل جاده‌ای و چند صد تن برای ریلی) است. برای مکمل‌ها و ویتامین‌ها بسته‌های ۲۵ کیلوگرمی پالت‌شده قابل عرضه است.'
        : 'MOQ corresponds to logistics modes: from bulk truck/rail hopper parcels (25-50 MT) for grains to palletized 25 kg bags for additives and amino acids.',
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="overflow-hidden rounded-lg border border-rule bg-sheet transition-all"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="flex w-full items-center justify-between gap-4 p-5 text-start font-medium text-ink hover:bg-well focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="flex items-center gap-3">
                <HelpCircle className="size-5 shrink-0 text-harbor" />
                <span className="text-sm md:text-base leading-7">{faq.question}</span>
              </span>
              <ChevronDown
                className={`size-5 shrink-0 text-ink-faint transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-harbor' : ''
                }`}
              />
            </button>

            {isOpen && (
              <div className="border-t border-rule bg-paper p-5 text-sm leading-7 text-ink-soft">
                {faq.standard && (
                  <div className="mb-3 flex items-center gap-2 text-xs font-mono text-stamp">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>{faq.standard}</span>
                  </div>
                )}
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
