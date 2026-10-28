import { getDictionary, formatJalaliDate, toFarsiDigits } from '@karvan/i18n';
import { EmptyState, LedgerTable, PageHeader } from '@karvan/ui';
import type { LedgerColumnDef } from '@karvan/ui';
import { CASE_STATUS_META, statusMeta } from '@karvan/ui';
import type { TradeCaseStatus } from '@karvan/core';
import { TRADE_CASE_STATUS_VALUES } from '@karvan/core';

import { Link as LocaleLink } from '@/i18n/navigation';
import { actorFromSession, getEffectiveSession } from '@/lib/session';
import { getStore } from '@/lib/store';
import type { TradeCaseRecord } from '@/lib/types';

import { CaseFilterTabs } from '../_components/case-filter-tabs';

interface CasesPageProps {
  params: Promise<{locale: string}>;
  searchParams: Promise<{status?: string}>;
}

const CASE_STATUSES: readonly TradeCaseStatus[] = TRADE_CASE_STATUS_VALUES;

export default async function CasesPage({params, searchParams}: CasesPageProps) {
  const {locale} = await params;
  const {status: statusParam} = await searchParams;
  const dictionary = getDictionary(locale);
  const labels = dictionary.crm;

  const session = await getEffectiveSession('crm');
  const actor = actorFromSession(session);
  const store = getStore();

  const filterStatus: TradeCaseStatus | undefined = CASE_STATUSES.includes(statusParam as TradeCaseStatus)
    ? (statusParam as TradeCaseStatus)
    : undefined;

  const visible = store.listTradeCases(actor, {});
  const rows = filterStatus ? visible.filter((record) => record.status === filterStatus) : visible;

  const buyerOf = (record: TradeCaseRecord): string =>
    store.getOrganization(record.buyerOrganizationId).name[locale === 'en' ? 'en' : 'fa'];

  const columns: ReadonlyArray<LedgerColumnDef<TradeCaseRecord>> = [
    {
      key: 'reference',
      header: labels.tableHeaders.reference,
      mono: true,
      render: (record) => (
        <LocaleLink href={`/crm/cases/${record.id}`} className="text-harbor underline-offset-4 hover:underline">
          <bdi>{record.reference}</bdi>
        </LocaleLink>
      ),
    },
    {
      key: 'buyer',
      header: labels.tableHeaders.buyer,
      render: (record) => <span className="text-ink">{buyerOf(record)}</span>,
    },
    {
      key: 'commodity',
      header: labels.tableHeaders.commodity,
      render: (record) => (
        <span className="text-ink-soft">
          <bdi>{record.commodity[locale === 'en' ? 'en' : 'fa']}</bdi>
        </span>
      ),
    },
    {
      key: 'transport',
      header: labels.cases.transport,
      render: (record) => (
        <span className="text-ink-soft">{record.transportMode === 'air' ? labels.caseDetail.transportAir : labels.caseDetail.transportSea}</span>
      ),
    },
    {
      key: 'milestone',
      header: labels.cases.milestone,
      render: (record) => (
        <span className="text-ink">{dictionary.statuses.milestone[record.currentMilestone]}</span>
      ),
    },
    {
      key: 'status',
      header: labels.tableHeaders.status,
      render: (record) => {
        const tone = statusMeta(CASE_STATUS_META, record.status);
        return (
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className={`size-1.5 rounded-full ${statusDotClass(tone.tone)}`} />
            {dictionary.statuses.case[record.status]}
          </span>
        );
      },
    },
    {
      key: 'updated',
      header: dictionary.common.meta.updatedAt,
      render: (record) => (
        <bdi className="font-mono text-[13px] text-ink-soft">
          {formatJalaliDate(record.updatedAt, locale === 'en' ? 'en' : 'fa')}
        </bdi>
      ),
    },
    {
      key: 'actions',
      header: labels.tableHeaders.actions,
      align: 'end',
      render: (record) => (
        <LocaleLink
          href={`/crm/cases/${record.id}`}
          className="text-[13px] text-harbor underline-offset-4 hover:underline"
        >
          {labels.cases.viewLink}
        </LocaleLink>
      ),
    },
  ];

  const tabs = [
    {id: 'all', label: `${labels.cases.filterAll} · ${toFarsiDigits(visible.length)}`},
    ...CASE_STATUSES.map((status) => ({
      id: status,
      label: `${dictionary.statuses.case[status]} · ${toFarsiDigits(visible.filter((record) => record.status === status).length)}`,
    })),
  ];

  return (
    <section className="flex flex-col gap-8">
      <PageHeader
        title={labels.tabs.cases}
        meta={[{label: labels.tabs.cases, value: toFarsiDigits(visible.length)}]}
      />

      <CaseFilterTabs tabs={tabs} activeStatus={filterStatus ?? 'all'} />

      {rows.length === 0 ? (
        <EmptyState
          title={labels.cases.emptyTitle}
          code={labels.cases.emptyCode}
          description={labels.cases.emptyDescription}
        />
      ) : (
        <div className="overflow-x-auto rounded-[2px] border border-rule shadow-register">
          <LedgerTable
            columns={columns}
            rows={rows}
            rowKey={(record) => record.id}
            density="compact"
            caption={labels.tabs.cases}
            rowTone={(record) => statusMeta(CASE_STATUS_META, record.status).tone}
          />
        </div>
      )}
    </section>
  );
}

/* Small status dot for the case list; the label always travels with it (§9). */
function statusDotClass(tone: string): string {
  switch (tone) {
    case 'clear':
      return 'bg-clear';
    case 'seal':
      return 'bg-seal';
    case 'ochre':
      return 'bg-ochre';
    case 'harbor':
      return 'bg-harbor';
    case 'observed':
      return 'bg-observed';
    default:
      return 'bg-ink-faint';
  }
}
