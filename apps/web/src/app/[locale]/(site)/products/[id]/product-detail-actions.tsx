'use client';

import { useState } from 'react';
import { ArrowLeft, Printer, Send, FileCheck } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { ProductRecord } from '@/lib/types';
import { QuickQuoteModal } from '../../_components/quick-quote-modal';

interface ProductDetailActionsProps {
  product: ProductRecord;
  locale: string;
}

export function ProductDetailActions({ product, locale }: ProductDetailActionsProps) {
  const isFa = locale === 'fa';
  const [modalOpen, setModalOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-primary-fixed hover:bg-primary-fixed-dim text-on-primary-fixed-variant px-7 py-3 text-sm font-bold shadow-xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          <span>{isFa ? 'استعلام قیمت فوری' : 'Instant RFQ'}</span>
          <Send className="size-4 rtl:rotate-180 text-primary" />
        </button>

        <Link
          href={`/contact?product=${product.id}`}
          className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 text-xs sm:text-sm font-semibold transition-all duration-200"
        >
          <span>{isFa ? 'درخواست مشاوره و استعلام' : 'Consultation & Inquiry'}</span>
          <ArrowLeft className="size-3.5 rtl:rotate-0 ltr:rotate-180" />
        </Link>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-3 text-xs font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-colors"
          title={isFa ? 'چاپ مشخصات فنی کالا' : 'Print Technical Sheet'}
        >
          <Printer className="size-4" />
          <span>{isFa ? 'چاپ برگه آنالیز' : 'Print Specs'}</span>
        </button>

        <Link
          href="/products"
          className="inline-flex h-11 items-center px-4 text-xs font-semibold text-white/80 hover:text-white underline decoration-white/30 underline-offset-8 ms-auto"
        >
          {isFa ? 'بازگشت به کاتالوگ نهاده‌ها' : 'Back to Catalog'}
        </Link>
      </div>

      <QuickQuoteModal
        product={product}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        locale={locale}
      />
    </div>
  );
}
