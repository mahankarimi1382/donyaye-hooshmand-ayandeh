'use client';

import { useState } from 'react';
import { ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { ProductRecord } from '@/lib/types';
import { QuickQuoteModal } from './quick-quote-modal';
import { unitShort } from './site-chrome';

interface FeaturedCommoditiesGridProps {
  products: ProductRecord[];
  locale: string;
}

export function FeaturedCommoditiesGrid({ products, locale }: FeaturedCommoditiesGridProps) {
  const isFa = locale === 'fa';
  const [modalProduct, setModalProduct] = useState<ProductRecord | null>(null);

  // Take top 4 featured feed products
  const feedItems = products.slice(0, 4);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {feedItems.map((product) => (
          <div
            key={product.id}
            className="bento-card bg-surface-container-lowest p-6 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed-variant text-[11px] font-semibold border border-secondary-fixed">
                  <span className="size-1.5 rounded-full bg-secondary"></span>
                  <span>{product.originPort[isFa ? 'fa' : 'en']}</span>
                </span>
                <span className="text-[11px] font-mono text-on-surface-variant/80 bg-surface-container-low px-2.5 py-0.5 rounded-full border border-outline-variant/20" dir="ltr">
                  <bdi>HS: {product.hsCode}</bdi>
                </span>
              </div>

              <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                <Link href={`/products/${product.id}`} className="hover:underline">
                  {product.name[isFa ? 'fa' : 'en']}
                </Link>
              </h3>
              <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                {product.packaging[isFa ? 'fa' : 'en']}
              </p>

              <div className="my-5 bg-surface-container-low/60 rounded-2xl p-4 space-y-2.5 text-xs border border-outline-variant/20">
                {product.specs.slice(0, 2).map((spec, i) => (
                  <div key={i} className="flex justify-between items-center text-on-surface-variant">
                    <span className="text-[11px] text-on-surface-variant/70">شاخص {i + 1}:</span>
                    <span className="font-bold text-on-surface font-mono text-[11px] truncate max-w-[150px]">
                      {spec[isFa ? 'fa' : 'en']}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center text-on-surface-variant border-t border-outline-variant/20 pt-2">
                  <span>حداقل سفارش:</span>
                  <span className="font-bold text-primary font-mono">
                    {product.moqQuantity} {unitShort(product.moqUnit)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setModalProduct(product)}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-surface-container-low hover:bg-primary hover:text-on-primary text-on-surface font-semibold text-xs transition-all duration-200 shadow-xs active:scale-[0.99]"
              >
                <span>{isFa ? 'استعلام قیمت روز' : 'Quick Quote'}</span>
                <ArrowLeft className="size-3.5 rtl:rotate-0 ltr:rotate-180" />
              </button>

              <Link
                href={`/products/${product.id}`}
                className="text-center text-[11px] text-on-surface-variant/70 hover:text-primary hover:underline font-medium transition-colors"
              >
                {isFa ? 'مشاهده برگه کامل مشخصات فنی' : 'View Full Technical Specs'}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <QuickQuoteModal
        product={modalProduct}
        isOpen={!!modalProduct}
        onClose={() => setModalProduct(null)}
        locale={locale}
      />
    </div>
  );
}
