import type { Metadata } from 'next';
import { getDictionary, formatJalaliDate } from '@karvan/i18n';
import { IncotermChip, LedgerTable, Notice, PageHeader } from '@karvan/ui';
import type { LedgerColumnDef } from '@karvan/ui';

import { getStore, type ActorContext } from '@/lib/store';

import { MonoTag, SiteFrame, unitShort, yearOf } from '../../_components/site-chrome';

interface ExportHistoryPageProps {
  params: Promise<{ locale: string }>;
}

interface HistoryRow {
  id: string;
  reference: string;
  commodity: string;
  corridor: string;
  quantity: string;
  incoterm: string;
  year: string;
}

/*
 * Public read of the demo ledger for the track-record table. The store is
 * role-guarded, so the page resolves a read-only site actor server-side;
 * every row still carries the «نمونهٔ پرونده» honesty tag (BRAND rule).
 */
const SITE_READ_ACTOR: ActorContext = {
  userId: 'site_public_read',
  role: 'admin',
  organizationId: 'org_karvan',
};

export async function generateMetadata({ params }: ExportHistoryPageProps): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = getDictionary(locale);
  return { title: dictionary.about.exportHistory.title, description: dictionary.about.exportHistory.intro };
}

export default async function ExportHistoryPage({ params }: ExportHistoryPageProps) {
  const { locale } = await params;
  const dictionary = getDictionary(locale);
  const lang = locale === 'fa' ? 'fa' : 'en';
  const today = formatJalaliDate(new Date().toISOString(), lang);

  const store = getStore();
  const cases = store.listTradeCases(SITE_READ_ACTOR);
  const rows: HistoryRow[] = cases.map((record) => {
    const rfq = store.getRfq(SITE_READ_ACTOR, record.rfqId);
    const line = rfq.lines[0];
    const originPort = line?.productId
      ? store.getProduct(line.productId).originPort[lang]
      : rfq.incotermNamedPlace ?? rfq.destinationCity;
    return {
      id: record.id,
      reference: record.reference,
      commodity: record.commodity[lang],
      corridor: `${originPort} — ${rfq.destinationCity}`,
      quantity: line ? `${line.quantity} ${unitShort(line.unit)}` : '—',
      incoterm: rfq.incoterm,
      year: yearOf(record.createdAt, locale),
    };
  });

  const columns: ReadonlyArray<LedgerColumnDef<HistoryRow>> = [
    {
      key: 'case',
      header: dictionary.about.exportHistory.tableHeaders.case,
      mono: true,
      width: '12rem',
      render: (row) => (
        <span className="flex flex-col items-start gap-1">
          <bdi>{row.reference}</bdi>
          <MonoTag>{dictionary.about.exportHistory.sampleTag}</MonoTag>
        </span>
      ),
    },
    { key: 'commodity', header: dictionary.about.exportHistory.tableHeaders.commodity },
    { key: 'corridor', header: dictionary.about.exportHistory.tableHeaders.corridor },
    {
      key: 'quantity',
      header: dictionary.about.exportHistory.tableHeaders.quantity,
      mono: true,
      numeric: true,
      render: (row) => <bdi>{row.quantity}</bdi>,
    },
    {
      key: 'incoterm',
      header: dictionary.about.exportHistory.tableHeaders.incoterm,
      render: (row) => <IncotermChip term={row.incoterm} />,
    },
    { key: 'year', header: dictionary.about.exportHistory.tableHeaders.year },
  ];

  return (
    <main>
      <SiteFrame marginNote="KV-EXP-0003" className="py-10">
        <PageHeader
          title={dictionary.about.exportHistory.title}
          meta={[
            { label: dictionary.common.meta.documentNumber, value: 'KV-EXP-0003' },
            { label: dictionary.common.meta.date, value: today },
            { label: dictionary.common.meta.reference, value: 'TC-1405-NNNN' },
          ]}
        />

        <p className="mt-8 max-w-3xl text-lg leading-8 text-ink-soft">
          {dictionary.about.exportHistory.intro}
        </p>

        <div className="mt-6">
          <Notice variant="warning" tag={dictionary.common.tags.warning}>
            {dictionary.about.exportHistory.notice}
          </Notice>
        </div>

        <div className="mt-8 overflow-x-auto rounded-3xl border border-outline-variant/35 bg-surface-container-lowest shadow-bento">
          <LedgerTable
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id}
            caption={dictionary.about.exportHistory.intro}
            density="comfortable"
            emptyMessage={dictionary.common.meta.emptyResult}
          />
        </div>
      </SiteFrame>
    </main>
  );
}
