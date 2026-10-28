'use client';

import { useMemo, useState } from 'react';
import { Search, X, ArrowLeft, SlidersHorizontal, LayoutGrid, Table as TableIcon, CheckCircle2, Warehouse, FileText } from 'lucide-react';
import type { Dictionary } from '@karvan/i18n';
import { Button, EmptyState, LedgerTable, Notice } from '@karvan/ui';
import type { LedgerColumnDef } from '@karvan/ui';

import { Link } from '@/i18n/navigation';
import type { ProductRecord } from '@/lib/types';
import { unitShort } from '../_components/site-chrome';
import { QuickQuoteModal } from '../_components/quick-quote-modal';

interface CatalogBrowserProps {
  products: ProductRecord[];
  dictionary: Dictionary;
  locale: string;
}

export function CatalogBrowser({ products, dictionary, locale }: CatalogBrowserProps) {
  const isFa = locale === 'fa';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [modalProduct, setModalProduct] = useState<ProductRecord | null>(null);

  const categoryFilters = [
    { id: 'all', label: isFa ? 'همه محصولات و نهاده‌ها' : 'All Products' },
    { id: 'feed_grains', label: isFa ? 'غلات و دانه‌های دامی' : 'Feed Grains' },
    { id: 'feed_meals', label: isFa ? 'کنجاله‌ها و منابع پروتئینی' : 'Protein & Meals' },
    { id: 'feed_additives', label: isFa ? 'مکمل‌ها و اسیدهای آمینه' : 'Additives & Minerals' },
  ];

  const omniSuggestions = [
    { label: 'ذرت زرد برزیل', query: 'ذرت' },
    { label: 'کنجاله پروتئین ۴۴٪', query: 'کنجاله سویا' },
    { label: 'جو دامی خزر هکتولیتر ۶۳+', query: 'جو دامی' },
    { label: 'دی‌کلسیم فسفات (DCP)', query: 'فسفات' },
  ];

  const FEED_PRODUCT_IDS = new Set([
    'prd_corn_feed',
    'prd_soybean_meal',
    'prd_barley_feed',
    'prd_dcp_feed',
    'prd_cottonseed_meal',
    'prd_wheat_feed',
  ]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const name = product.name[isFa ? 'fa' : 'en'] || '';
        const hs = product.hsCode || '';
        const specs = product.specs.map((s) => s[isFa ? 'fa' : 'en']).join(' ');
        const matchesSearch =
          searchQuery.trim() === '' ||
          name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hs.includes(searchQuery) ||
          specs.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (selectedCategory === 'all') {
          // In the specialized feed enterprise catalog, prioritize certified feed commodities
          if (!searchQuery.trim()) {
            return FEED_PRODUCT_IDS.has(product.id);
          }
          return true;
        }
        if (selectedCategory === 'feed_grains') {
          return product.id.includes('corn') || product.id.includes('barley') || product.id.includes('wheat');
        }
        if (selectedCategory === 'feed_meals') {
          return product.id.includes('meal') || product.id.includes('soybean') || product.id.includes('cottonseed');
        }
        if (selectedCategory === 'feed_additives') {
          return product.id.includes('dcp') || product.id.includes('lysine') || product.id.includes('methionine') || product.category === 'fertilizer';
        }
        return true;
      })
      .sort((a, b) => {
        const aFeed = FEED_PRODUCT_IDS.has(a.id);
        const bFeed = FEED_PRODUCT_IDS.has(b.id);
        if (aFeed && !bFeed) return -1;
        if (!aFeed && bFeed) return 1;
        return 0;
      });
  }, [products, searchQuery, selectedCategory, isFa]);

  interface TableRow {
    id: string;
    hsCode: string;
    name: string;
    moq: string;
    originPort: string;
    price: string;
  }

  const tableRows: TableRow[] = filteredProducts.map((p) => ({
    id: p.id,
    hsCode: p.hsCode,
    name: p.name[isFa ? 'fa' : 'en'],
    moq: `${p.moqQuantity} ${unitShort(p.moqUnit)}`,
    originPort: p.originPort[isFa ? 'fa' : 'en'],
    price: p.priceIndication[isFa ? 'fa' : 'en'],
  }));

  const columns: ReadonlyArray<LedgerColumnDef<TableRow>> = [
    {
      key: 'hsCode',
      header: dictionary.products.tableHeaders.hsCode,
      mono: true,
      width: '7rem',
      render: (row) => <bdi>{row.hsCode}</bdi>,
    },
    {
      key: 'name',
      header: dictionary.products.tableHeaders.product,
      render: (row) => (
        <Link href={`/products/${row.id}`} className="font-semibold text-on-surface hover:text-primary transition-colors">
          {row.name}
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
      key: 'originPort',
      header: isFa ? 'بندر / انبار مبدأ' : 'Origin Port / Hub',
      render: (row) => row.originPort,
    },
    {
      key: 'price',
      header: dictionary.products.tableHeaders.price,
      render: (row) => (
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-on-surface-variant font-mono">{row.price}</span>
          <button
            type="button"
            onClick={() => {
              const p = products.find((item) => item.id === row.id) ?? null;
              setModalProduct(p);
            }}
            className="inline-flex h-8 items-center rounded-full bg-primary px-3 text-xs font-semibold text-on-primary hover:bg-primary-container shadow-xs transition-colors"
          >
            {isFa ? 'استعلام فوری' : 'Quick Quote'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mt-8 flex flex-col gap-8">
      {/* ================= OMNIBOX SEARCH SECTION ================= */}
      <div className="relative max-w-3xl mx-auto w-full text-center">
        {/* Omnibox Bar */}
        <div className="relative flex items-center h-14 w-full bg-surface-container-lowest rounded-full border border-outline-variant/35 hover:border-outline focus-within:border-primary focus-within:shadow-bento px-4 sm:px-5 transition-all duration-200 shadow-xs">
          <Search className="size-5 text-outline shrink-0 ms-1 me-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isFa ? 'جست‌وجوی نهاده با نام، کد HS یا مشخصه فنی (مثلاً: ذرت برزیل، کنجاله، جو...)' : 'Search feed ingredients by name, HS code, or specs...'}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm sm:text-base text-on-surface placeholder:text-on-surface-variant/50 p-0 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-on-surface-variant/60 hover:text-on-surface p-1 me-2"
              title="پاک‌کردن"
            >
              <X className="size-4" />
            </button>
          )}
          <button
            type="button"
            className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-on-primary hover:bg-primary-container text-xs font-semibold rounded-full shadow-xs transition-colors"
          >
            <span>جستجو</span>
          </button>
        </div>

        {/* Quick Pill Suggestions (Bento Style Chips) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5 text-xs">
          <span className="text-on-surface-variant/70 text-[11px]">پیشنهادهای پرتکرار:</span>
          {omniSuggestions.map((sug, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSearchQuery(sug.query)}
              className="px-3.5 py-1 rounded-full bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <span className={`size-1.5 rounded-full ${i % 2 === 0 ? 'bg-primary' : 'bg-secondary'}`}></span>
              <span>{sug.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Controls Bar: Category Filter Pills & View Mode */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-on-surface-variant me-1 font-medium">
            <SlidersHorizontal className="size-3.5 text-primary" />
            <span>{isFa ? 'دسته‌بندی:' : 'Category:'}</span>
          </span>
          {categoryFilters.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/25'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 rounded-full border border-outline-variant/30 bg-surface-container-low p-1">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            aria-label="نمایش کارتی"
            className={`flex size-8 items-center justify-center rounded-full transition-colors ${
              viewMode === 'grid' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant/60 hover:text-on-surface'
            }`}
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            aria-label="نمایش جدولی"
            className={`flex size-8 items-center justify-center rounded-full transition-colors ${
              viewMode === 'table' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant/60 hover:text-on-surface'
            }`}
          >
            <TableIcon className="size-4" />
          </button>
        </div>
      </div>

      {/* Results Count & Clear Notice */}
      <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant/70 -mt-2">
        <span>
          {isFa
            ? `تعداد نهاده‌های یافت‌شده: ${filteredProducts.length} مورد`
            : `Showing ${filteredProducts.length} feed ingredients`}
        </span>
        {(searchQuery || selectedCategory !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="text-primary font-semibold hover:underline"
          >
            {isFa ? 'پاک کردن همه فیلترها' : 'Clear all filters'}
          </button>
        )}
      </div>

      {/* Main Content: Bento Cards Grid or Table */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          title={isFa ? 'محصولی با این مشخصات یافت نشد' : 'No feed ingredients match your criteria'}
          description={isFa ? 'لطفاً عبارت جست‌وجو را تغییر دهید یا فیلتر دسته‌بندی را بازنشانی کنید.' : 'Try adjusting your search terms or clearing the selected category filter.'}
          action={
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              {isFa ? 'بازنشانی فیلترها' : 'Reset Filters'}
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <article
              key={product.id}
              className="bento-card bg-surface-container-lowest flex flex-col justify-between p-6"
            >
              <div>
                {/* Header: Port Tag & HS Code */}
                <div className="flex items-start justify-between mb-3">
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-secondary-fixed/50 text-on-secondary-fixed-variant border border-secondary-fixed inline-flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-secondary"></span>
                    <span>{product.originPort[isFa ? 'fa' : 'en']}</span>
                  </span>
                  <span className="text-[11px] font-mono text-on-surface-variant/80 bg-surface-container-low px-2.5 py-0.5 rounded-full border border-outline-variant/20" dir="ltr">
                    <bdi>HS: {product.hsCode}</bdi>
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-on-surface mb-1">
                  <Link href={`/products/${product.id}`} className="hover:text-primary transition-colors">
                    {product.name[isFa ? 'fa' : 'en']}
                  </Link>
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                  {product.packaging[isFa ? 'fa' : 'en']}
                </p>

                {/* Lab Assays List */}
                <div className="grid grid-cols-2 gap-2 py-3 border border-outline-variant/20 bg-surface-container-low/60 rounded-2xl px-3.5 my-4 text-start">
                  {product.specs.slice(0, 2).map((spec, i) => (
                    <div key={i} className="text-xs">
                      <span className="text-[10px] text-on-surface-variant/70 block">شاخص {i + 1}</span>
                      <span className="font-semibold text-on-surface text-[11px] truncate block font-mono">
                        {spec[isFa ? 'fa' : 'en']}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Port & MOQ Details */}
                <div className="space-y-1.5 text-xs text-on-surface-variant">
                  <div className="flex justify-between">
                    <span>حداقل سفارش (MOQ):</span>
                    <span className="font-mono font-bold text-primary">
                      {product.moqQuantity} {unitShort(product.moqUnit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>زمان تحویل تخمینی:</span>
                    <span className="font-mono font-medium text-on-surface">
                      {product.leadTimeDays} {dictionary.products.days}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-5 border-t border-outline-variant/25 mt-4 flex items-center justify-between gap-3">
                <Link
                  href={`/products/${product.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
                >
                  <FileText className="size-3.5 text-primary" />
                  <span>{isFa ? 'برگه آنالیز' : 'Tech Sheet'}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setModalProduct(product)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-all shadow-xs"
                >
                  <span>{isFa ? 'استعلام قیمت روز' : 'Inquire'}</span>
                  <ArrowLeft className="size-3.5 rtl:rotate-0 ltr:rotate-180" />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-outline-variant/35 bg-surface-container-lowest shadow-xs">
          <LedgerTable
            columns={columns}
            rows={tableRows}
            rowKey={(r) => r.id}
            caption="کاتالوگ تخصصی نهاده‌های دامی"
            density="comfortable"
          />
        </div>
      )}

      {/* Note on Analysis & Pricing */}
      <div className="mt-4">
        <Notice variant="info" tag={isFa ? 'یادداشت کیفی' : 'Quality Note'}>
          {isFa
            ? 'تمامی نهاده‌های عرضه شده دارای تاییدیه قرنطینه و سلامت دامپزشکی بوده و قیمت نهایی بر اساس شرایط تحویل (FOB بنادر، روی کشتی، یا تحویل درب کارخانه) در پیش‌فاکتور رسمی اعلام می‌شود.'
            : 'All feed inputs carry official veterinary inspection certificates. Final pricing depends on delivery terms (FOB, CIF, or ex-silo) and will be stated on official quotations.'}
        </Notice>
      </div>

      {/* Quick Quotation Modal */}
      <QuickQuoteModal
        product={modalProduct}
        isOpen={!!modalProduct}
        onClose={() => setModalProduct(null)}
        locale={locale}
      />
    </div>
  );
}
