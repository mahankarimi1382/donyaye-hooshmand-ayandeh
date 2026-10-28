import { getDictionary, toFarsiDigits } from '@karvan/i18n';
import { IncotermChip, KpiTile, LedgerTable, PageHeader, EmptyState } from '@karvan/ui';
import type { LedgerColumnDef } from '@karvan/ui';
import { isRfqStatus } from '@karvan/core';
import type { RfqStatus } from '@karvan/core';

import { Link as LocaleLink } from '@/i18n/navigation';
import { actorFromSession, getEffectiveSession } from '@/lib/session';
import { getStore } from '@/lib/store';
import type { RfqRecord } from '@/lib/types';

import { InboxFilters } from './_components/inbox-filters';
import {
  ACTIVE_RFQ_STATUSES,
  SLA_TONE_CLASS,
  rfqStatusTone,
  slaCountdownLabel,
  slaGoverns,
  slaStateOf,
} from './_components/rfq-console';

interface CrmInboxPageProps {
  params: Promise<{locale: string}>;
  searchParams: Promise<{status?: string; q?: string}>;
}

export default async function CrmInboxPage({params, searchParams}: CrmInboxPageProps) {
  const {locale} = await params;
  const {status: statusParam, q: queryParam} = await searchParams;
  const dictionary = getDictionary(locale);
  const labels = dictionary.crm;

  const session = await getEffectiveSession('crm');
  const actor = actorFromSession(session);
  const store = getStore();

  const userOf = (userId: string | null): string =>
    (userId ? store.getUser(userId)?.name : undefined) ?? labels.inbox.unassigned;

  const visible = store.listRfqs(actor, {pageSize: 100}).items;

  const filterStatus: RfqStatus | undefined = isRfqStatus(statusParam) ? statusParam : undefined;
  const search = (queryParam ?? '').trim();
  // The list itself filters through the store (status + full-text search).
  const rows = store
    .listRfqs(actor, {
      pageSize: 100,
      ...(filterStatus ? {status: filterStatus} : {}),
      ...(search.length > 0 ? {search} : {}),
    })
    .items;

  const pendingStatuses: ReadonlySet<RfqStatus> = new Set(['submitted', 'under_review', 'needs_information']);
  const pricingStatuses: ReadonlySet<RfqStatus> = new Set(['qualified', 'quote_preparation']);
  const kpi = {
    total: visible.length,
    pending: visible.filter((rfq) => pendingStatuses.has(rfq.status)).length,
    qualified: visible.filter((rfq) => pricingStatuses.has(rfq.status)).length,
    activeQuotes: visible.filter((rfq) => rfq.status === 'quoted').length,
  };

  const statusCount = (status: RfqStatus): number => visible.filter((rfq) => rfq.status === status).length;

  const tabs = [
    {id: 'all', label: `${labels.inbox.filterAll} · ${toFarsiDigits(visible.length)}`},
    ...ACTIVE_RFQ_STATUSES.map((status) => ({
      id: status,
      label: `${dictionary.statuses.rfq[status].label} · ${toFarsiDigits(statusCount(status))}`,
    })),
  ];

  const now = Date.now();

  const columns: ReadonlyArray<LedgerColumnDef<RfqRecord>> = [
    {
      key: 'reference',
      header: labels.tableHeaders.reference,
      mono: true,
      render: (row) => (
        <LocaleLink
          href={`/crm/rfqs/${row.id}`}
          className="text-harbor underline-offset-4 hover:underline"
        >
          <bdi>{row.reference}</bdi>
        </LocaleLink>
      ),
    },
    {
      key: 'buyer',
      header: labels.tableHeaders.buyer,
      render: (row) => (
        <span className="flex flex-col">
          <span className="text-ink">{row.company.name}</span>
          <bdi className="font-mono text-[11px] text-ink-faint">{row.company.country}</bdi>
        </span>
      ),
    },
    {
      key: 'commodity',
      header: labels.tableHeaders.commodity,
      render: (row) => (
        <span className="block max-w-56 truncate text-ink-soft" title={row.lines[0]?.description ?? ''}>
          <bdi>{row.lines[0]?.description ?? '—'}</bdi>
        </span>
      ),
    },
    {
      key: 'incoterm',
      header: labels.tableHeaders.incoterm,
      render: (row) => (
        <span className="flex flex-col items-start gap-1">
          <IncotermChip term={row.incoterm} namedPlace={row.incotermNamedPlace} />
          <span className="text-[11px] text-ink-faint">
            <bdi>{row.destinationCity}</bdi> · <bdi className="font-mono">{row.destinationCountry}</bdi>
          </span>
        </span>
      ),
    },
    {
      key: 'status',
      header: labels.tableHeaders.status,
      render: (row) => <span className={rfqStatusTone(row.status).textClass}>{dictionary.statuses.rfq[row.status].label}</span>,
    },
    {
      key: 'sla',
      header: labels.tableHeaders.sla,
      render: (row) => {
        if (!slaGoverns(row.status)) {
          return <span className="text-[13px] text-ink-faint">{labels.slaLabels.none}</span>;
        }
        const {state, remainingMs} = slaStateOf(row.slaDeadline, now);
        const stateLabel = state === 'breach' ? labels.slaLabels.breached : labels.slaLabels[state];
        return (
          <span className="flex flex-col leading-4">
            <bdi className={`font-mono text-[13px] ${SLA_TONE_CLASS[state]}`}>{slaCountdownLabel(remainingMs)}</bdi>
            <span className={`text-[11px] ${SLA_TONE_CLASS[state]}`}>{stateLabel}</span>
          </span>
        );
      },
    },
    {
      key: 'assigned',
      header: labels.tableHeaders.assigned,
      render: (row) => <span className="text-ink-soft">{userOf(row.assignedToUserId)}</span>,
    },
    {
      key: 'actions',
      header: labels.tableHeaders.actions,
      align: 'end',
      render: (row) => (
        <LocaleLink
          href={`/crm/rfqs/${row.id}`}
          className="text-[13px] text-harbor underline-offset-4 hover:underline"
        >
          {labels.inbox.viewLink}
        </LocaleLink>
      ),
    },
  ];

  return (
    <section className="flex flex-col gap-8">
      <PageHeader
        title={labels.title}
        meta={[
          {label: labels.tableHeaders.status, value: labels.tabs.inbox},
          {label: labels.kpis.totalRfqs, value: toFarsiDigits(visible.length)},
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile label={labels.kpis.totalRfqs} value={toFarsiDigits(kpi.total)} />
        <KpiTile label={labels.kpis.pendingReview} value={toFarsiDigits(kpi.pending)} />
        <KpiTile label={labels.kpis.qualified} value={toFarsiDigits(kpi.qualified)} />
        <KpiTile label={labels.kpis.activeQuotes} value={toFarsiDigits(kpi.activeQuotes)} />
      </div>

      <div className="flex flex-col gap-4">
        <InboxFilters
          tabs={tabs}
          activeStatus={filterStatus ?? 'all'}
          query={search}
          labels={{searchLabel: labels.inbox.searchLabel, searchPlaceholder: labels.inbox.searchPlaceholder}}
        />

        {rows.length === 0 ? (
          <EmptyState
            title={labels.inbox.emptyTitle}
            code={labels.inbox.emptyCode}
            description={labels.inbox.emptyDescription}
          />
        ) : (
          <div className="overflow-x-auto rounded-[2px] border border-rule shadow-register">
            <LedgerTable
              columns={columns}
              rows={rows}
              rowKey={(row) => row.id}
              density="compact"
              caption={labels.subtitle}
              rowTone={(row) => rfqStatusTone(row.status).tone}
            />
          </div>
        )}

        <p className="font-mono text-[11px] text-ink-faint">
          {toFarsiDigits(rows.length)} {labels.inbox.resultUnit}
        </p>
      </div>
    </section>
  );
}
