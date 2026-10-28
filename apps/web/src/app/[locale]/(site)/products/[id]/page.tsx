import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary, formatJalaliDate, toFarsiDigits } from '@karvan/i18n';
import { LedgerTable, PageHeader, SectionHeader } from '@karvan/ui';
import type { LedgerColumnDef } from '@karvan/ui';

import { Link } from '@/i18n/navigation';
import { getStore, type ProductRecord } from '@/lib/store';

import { linkButtonClasses, SiteFrame, unitShort } from '../../_components/site-chrome';
import { ProductDetailActions } from './product-detail-actions';

interface ProductDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

interface SpecRow {
  index: string;
  spec: string;
}

export function generateStaticParams() {
  return getStore().listProducts().map((product) => ({ id: product.id }));
}

function findProduct(id: string): ProductRecord | null {
  return getStore().listProducts().find((product) => product.id === id) ?? null;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const dictionary = getDictionary(locale);
  const product = findProduct(id);
  if (!product) return { title: dictionary.products.detail.notFoundTitle };
  return {
    title: product.name[locale === 'fa' ? 'fa' : 'en'],
    description: product.specs.map((spec) => spec[locale === 'fa' ? 'fa' : 'en']).join(' · '),
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { locale, id } = await params;
  const dictionary = getDictionary(locale);
  const lang = locale === 'fa' ? 'fa' : 'en';
  const product = findProduct(id);
  if (!product) notFound();

  const today = formatJalaliDate(new Date().toISOString(), lang);
  const num = (n: number) => (locale === 'fa' ? toFarsiDigits(n) : String(n));
  const specRows: SpecRow[] = product.specs.map((spec, i) => ({
    index: num(i + 1),
    spec: spec[lang],
  }));
  const specColumns: ReadonlyArray<LedgerColumnDef<SpecRow>> = [
    { key: 'index', header: '#', mono: true, width: '4rem' },
    { key: 'spec', header: dictionary.products.detail.specsTitle },
  ];

  return (
    <main>
      <SiteFrame marginNote={`KV-PRD-${product.hsCode}`} className="py-10">
        <PageHeader
          title={product.name[lang]}
          meta={[
            { label: dictionary.products.fields.hsCode, value: product.hsCode },
            {
              label: dictionary.products.tableHeaders.moq,
              value: `${product.moqQuantity} ${unitShort(product.moqUnit)}`,
            },
            {
              label: dictionary.products.tableHeaders.leadTime,
              value: `${product.leadTimeDays} ${dictionary.products.days}`,
            },
            { label: dictionary.common.meta.date, value: today },
          ]}
        />

        <p className="mt-4 font-mono text-[13px] text-ink-faint">
          {dictionary.products.categoryLabels[product.category]} · <bdi>{product.id.toUpperCase()}</bdi>
        </p>

        {/* MOQ / lead time / unit / port strip */}
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-m3-outline-variant/40 bg-m3-surface-container px-5 py-4 font-mono text-[13px] text-m3-on-surface shadow-xs">
          <span>
            <span className="text-m3-outline">{dictionary.products.fields.moq}: </span>
            <bdi className="font-bold text-m3-primary">
              {product.moqQuantity} {unitShort(product.moqUnit)}
            </bdi>
          </span>
          <span aria-hidden="true" className="text-m3-outline-variant">
            •
          </span>
          <span>
            <span className="text-m3-outline">{dictionary.products.fields.leadTime}: </span>
            <bdi className="font-semibold">
              {product.leadTimeDays} {dictionary.products.days}
            </bdi>
          </span>
          <span aria-hidden="true" className="text-m3-outline-variant">
            •
          </span>
          <span>
            <span className="text-m3-outline">{dictionary.products.fields.unit}: </span>
            <bdi>{unitShort(product.unit)}</bdi>
          </span>
          <span aria-hidden="true" className="text-m3-outline-variant">
            •
          </span>
          <span>
            <span className="text-m3-outline">{dictionary.products.fields.port}: </span>
            <span className="font-semibold text-emerald-800">{product.originPort[lang]}</span>
          </span>
        </div>

        {/* specs ledger table */}
        <section className="mt-12">
          <SectionHeader index={locale === 'fa' ? '۰۱' : '01'} title={dictionary.products.detail.specsTitle} />
          <div className="mt-6 overflow-x-auto rounded-3xl border border-m3-outline-variant/40 bg-m3-surface-lowest shadow-xs">
            <LedgerTable
              columns={specColumns}
              rows={specRows}
              rowKey={(row) => row.index}
              caption={dictionary.products.detail.specsTitle}
              density="comfortable"
            />
          </div>
        </section>

        {/* packaging and price indication */}
        <section className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-m3-outline-variant/40 bg-m3-surface-lowest p-6 shadow-xs">
            <p className="font-mono text-xs text-m3-outline font-semibold">{dictionary.products.fields.packaging}</p>
            <p className="mt-2 text-sm leading-7 text-m3-on-surface font-medium">{product.packaging[lang]}</p>
          </div>
          <div className="rounded-3xl border border-m3-outline-variant/40 bg-m3-surface-lowest p-6 shadow-xs">
            <p className="font-mono text-xs text-m3-outline font-semibold">
              {dictionary.products.fields.priceIndication}
            </p>
            <p className="mt-2 text-sm leading-7 text-m3-on-surface font-medium">{product.priceIndication[lang]}</p>
            <p className="mt-2 font-mono text-xs text-m3-outline">{dictionary.products.sampleNote}</p>
          </div>
        </section>

        {/* CTA to /rfq?product= */}
        <section className="mt-12">
          <div className="rounded-3xl bg-m3-primary p-8 sm:p-10 text-white shadow-m3-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold">{dictionary.products.detail.cta}</h2>
            <p className="mt-2 max-w-2xl text-sm sm:text-base leading-7 text-emerald-100">{dictionary.products.detail.ctaNote}</p>
            <div className="mt-6">
              <ProductDetailActions product={product} locale={locale} />
            </div>
          </div>
        </section>
      </SiteFrame>
    </main>
  );
}
