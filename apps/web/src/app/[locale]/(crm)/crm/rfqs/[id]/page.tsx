import { notFound } from 'next/navigation';

import { formatDateTime, formatJalaliDate, formatMoney, getDictionary, toFarsiDigits } from '@karvan/i18n';
import {
  EmptyState,
  IncotermChip,
  LedgerTable,
  Notice,
  PageHeader,
  Perforation,
  SectionHeader,
} from '@karvan/ui';
import type { LedgerColumnDef } from '@karvan/ui';
import { allowedRfqTransitionsFrom } from '@karvan/core';
import type { RfqStatus } from '@karvan/core';

import { Link as LocaleLink } from '@/i18n/navigation';
import { actorFromSession, getEffectiveSession } from '@/lib/session';
import { getStore } from '@/lib/store';
import type { RfqRecord } from '@/lib/types';
import type { RfqLineItem } from '@karvan/contracts';

import { CopyButton } from '../../_components/copy-button';
import { rfqTransitionOptions, slaGoverns, slaStateOf, slaCountdownLabel } from '../../_components/rfq-console';
import { RfqStatusStrip } from '../../_components/rfq-status-strip';
import { TransitionPanel } from './transition-panel';

interface RfqDetailPageProps {
  params: Promise<{locale: string; id: string}>;
}

const PRICABLE_STATUSES: ReadonlySet<RfqStatus> = new Set(['qualified', 'quote_preparation', 'quoted']);

export default async function RfqDetailPage({params}: RfqDetailPageProps) {
  const {locale, id} = await params;
  const dictionary = getDictionary(locale);
  const labels = dictionary.crm;

  const session = await getEffectiveSession('crm');
  const actor = actorFromSession(session);
  const store = getStore();

  let rfq: RfqRecord;
  try {
    rfq = store.getRfq(actor, id);
  } catch {
    notFound();
  }

  const buyer = store.getOrganization(rfq.buyerOrganizationId);
  const assignee = rfq.assignedToUserId ? store.getUser(rfq.assignedToUserId) : null;
  const quotes = store.listQuotes(actor, {rfqId: rfq.id});
  const auditEvents = store
    .getAuditEvents(actor)
    .filter((event) => event.resource.id === rfq.id)
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));

  const options = rfqTransitionOptions(rfq.status).filter((option) => allowedRfqTransitionsFrom(rfq.status).includes(option.to));
  const slaActive = slaGoverns(rfq.status);
  const sla = slaStateOf(rfq.slaDeadline, Date.now());

  const lineColumns: ReadonlyArray<LedgerColumnDef<RfqLineItem>> = [
    {
      key: 'description',
      header: labels.rfqDetail.commodity,
      render: (line) => (
        <span className="flex flex-col">
          <span className="text-ink">
            <bdi>{line.description}</bdi>
          </span>
          {line.specifications && <span className="text-[11px] text-ink-faint">{line.specifications}</span>}
        </span>
      ),
    },
    {
      key: 'quantity',
      header: labels.rfqDetail.quantity,
      numeric: true,
      mono: true,
      render: (line) => <bdi>{line.quantity}</bdi>,
    },
    {
      key: 'unit',
      header: labels.rfqDetail.unit,
      render: (line) => dictionary.units[line.unit],
    },
    {
      key: 'targetPrice',
      header: labels.rfqDetail.targetPrice,
      numeric: true,
      mono: true,
      render: (line) => (line.targetPrice ? <bdi>{line.targetPrice}</bdi> : '—'),
    },
  ];

  const statusLabels = {
    stripLabel: labels.rfqDetail.statusStrip,
    statuses: Object.fromEntries(
      Object.entries(dictionary.statuses.rfq).map(([key, value]) => [key, value.label]),
    ),
  };

  return (
    <section className="flex flex-col gap-8">
      <PageHeader
        title={rfq.reference}
        meta={[
          {label: labels.rfqDetail.metaRegisteredAt, value: formatJalaliDate(rfq.createdAt, locale === 'en' ? 'en' : 'fa')},
          {
            label: labels.rfqDetail.metaDueAt,
            value: slaActive ? slaCountdownLabel(sla.remainingMs) : labels.rfqDetail.noDeadline,
          },
          {label: labels.rfqDetail.metaAssignee, value: assignee?.name ?? labels.inbox.unassigned},
          {label: labels.rfqDetail.metaVersion, value: `v${rfq.version}`},
        ]}
        actions={
          <LocaleLink
            href={`/crm/rfqs/${rfq.id}/quote`}
            aria-disabled={!PRICABLE_STATUSES.has(rfq.status)}
            className={
              PRICABLE_STATUSES.has(rfq.status)
                ? 'inline-flex h-8 items-center rounded-[2px] border border-harbor bg-harbor px-3 text-sm font-medium text-sheet shadow-register transition-colors hover:bg-harbor-deep'
                : 'pointer-events-none inline-flex h-8 items-center rounded-[2px] border border-rule px-3 text-sm text-ink-faint'
            }
          >
            {labels.rfqDetail.newQuoteLink}
          </LocaleLink>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.6fr]">
        <div className="flex flex-col gap-6">
          <div className="rounded-[2px] border border-rule bg-sheet p-4 shadow-register">
            <h2 className="font-mono text-[13px] text-ink-soft">{labels.rfqDetail.buyer}</h2>
            <p className="mt-2 text-lg font-medium text-ink">{buyer.name[locale === 'en' ? 'en' : 'fa']}</p>
            <p className="mt-1 text-sm text-ink-soft">
              <bdi className="font-mono">{buyer.country}</bdi> · <bdi>{buyer.city[locale === 'en' ? 'en' : 'fa']}</bdi>
            </p>
            <dl className="mt-4 flex flex-col gap-1 border-t border-rule pt-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-faint">{labels.rfqDetail.contact}</dt>
                <dd className="text-ink">
                  {rfq.contact.name}
                  <span className="ms-2 text-[11px] text-ink-faint">{rfq.contact.role}</span>
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="sr-only">{labels.rfqDetail.contact}</dt>
                <dd className="text-ink-soft">
                  <bdi dir="ltr">{rfq.contact.email}</bdi>
                </dd>
              </div>
              {rfq.contact.phone && (
                <div className="flex justify-between gap-3">
                  <dt className="sr-only">{labels.rfqDetail.contact}</dt>
                  <dd className="text-ink-soft">
                    <bdi dir="ltr">{rfq.contact.phone}</bdi>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-[2px] border border-rule bg-sheet p-4 shadow-register">
            <h2 className="font-mono text-[13px] text-ink-soft">{labels.rfqDetail.logistics}</h2>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <span className="flex items-center gap-2">
                <IncotermChip term={rfq.incoterm} namedPlace={rfq.incotermNamedPlace} />
              </span>
              <p className="text-ink-soft">
                {labels.rfqDetail.destination}:{' '}
                <bdi>{rfq.destinationCity}</bdi> · <bdi className="font-mono">{rfq.destinationCountry}</bdi>
              </p>
              <p className="text-ink-soft">
                {dictionary.rfq.fieldLabels.targetDeliveryDate}:{' '}
                {formatJalaliDate(rfq.targetDeliveryDate, locale === 'en' ? 'en' : 'fa')}
              </p>
            </div>
            {rfq.notes && (
              <p className="mt-3 border-t border-rule pt-3 text-sm leading-[1.8] text-ink-soft">
                {labels.rfqDetail.notesLabel}: {rfq.notes}
              </p>
            )}
            {rfq.question && (
              <div className="mt-3">
                <Notice variant="warning" tag={labels.rfqDetail.openQuestion}>
                  {rfq.question}
                </Notice>
              </div>
            )}
            {rfq.rejectionReason && (
              <div className="mt-3">
                <Notice variant="danger" tag={labels.rfqDetail.rejectionReason}>
                  {rfq.rejectionReason}
                </Notice>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <SectionHeader index={toFarsiDigits('01')} title={labels.rfqDetail.linesTable} />
            <div className="mt-4 overflow-x-auto rounded-[2px] border border-rule shadow-register">
              <LedgerTable
                columns={lineColumns}
                rows={rfq.lines}
                rowKey={(line) => `${line.description}-${line.quantity}`}
                density="compact"
                caption={labels.rfqDetail.linesTable}
              />
            </div>
          </div>

          <div>
            <SectionHeader index={toFarsiDigits('02')} title={labels.rfqDetail.statusControl} />
            <div className="mt-4">
              <TransitionPanel
                rfqId={rfq.id}
                version={rfq.version}
                status={rfq.status}
                statusLabel={dictionary.statuses.rfq[rfq.status].label}
                options={options}
                actionLabels={labels.rfqDetail.actions}
                quoteHref={`/crm/rfqs/${rfq.id}/quote`}
                labels={{
                  reasonLabel: labels.rfqDetail.reasonLabel,
                  reasonRequired: labels.rfqDetail.reasonRequired,
                  questionLabel: labels.rfqDetail.questionLabel,
                  questionRequired: labels.rfqDetail.questionRequired,
                  commentLabel: labels.rfqDetail.commentLabel,
                  applyAction: labels.rfqDetail.applyAction,
                  actionApplied: labels.rfqDetail.actionApplied,
                  buyerSideHint: labels.rfqDetail.buyerSideHint,
                  quotePageLabel: labels.rfqDetail.newQuoteLink,
                  cancelLabel: dictionary.common.actions.cancel,
                  versionConflict: labels.quoteEngine.errors.versionConflict,
                  refresh: labels.quoteEngine.errors.refresh,
                  forbidden: labels.quoteEngine.errors.forbidden,
                  sessionExpired: labels.quoteEngine.errors.sessionExpired,
                  invalidTransition: labels.quoteEngine.errors.invalidTransition,
                  genericError: labels.quoteEngine.errors.genericError,
                  status: labels.tableHeaders.status,
                }}
              />
            </div>
            <div className="mt-5 border-t border-rule pt-4">
              <RfqStatusStrip current={rfq.status} labels={statusLabels} />
            </div>
          </div>

          {quotes.length > 0 && (
            <div>
              <SectionHeader index={toFarsiDigits('03')} title={labels.rfqDetail.quotesForRfq} />
              <ul className="mt-4 flex flex-col divide-y divide-rule rounded-[2px] border border-rule bg-sheet shadow-register">
                {quotes.map((quote) => (
                  <li key={quote.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                    <LocaleLink href={`/portal/quotes/${quote.id}`} className="font-mono text-[13px] text-harbor hover:underline">
                      <bdi>{quote.quoteNumber}</bdi>
                    </LocaleLink>
                    <span className="text-sm text-ink-soft">{dictionary.statuses.quote[quote.status].label}</span>
                    <bdi className="font-mono text-[13px] text-ink">{formatMoney(quote.total, quote.currency, locale === 'en' ? 'en' : 'fa')}</bdi>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <Perforation />

      <div>
        <SectionHeader index={toFarsiDigits('04')} title={labels.rfqDetail.auditTrail} />
        {auditEvents.length === 0 ? (
          <div className="mt-4">
            <EmptyState title={labels.rfqDetail.auditEmpty} code={labels.rfqDetail.auditEmptyCode} />
          </div>
        ) : (
          <ul className="mt-4 flex flex-col rounded-[2px] border border-rule bg-sheet shadow-register">
            {auditEvents.map((event) => (
              <li key={event.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-rule px-4 py-2.5 last:border-b-0">
                <span className="text-sm font-medium text-ink">{labels.audit.eventTypes[event.type] ?? event.type}</span>
                <span className="text-sm text-ink-soft">
                  {store.getUser(event.actor.id)?.name ?? event.actor.id}
                  <span className="ms-2 font-mono text-[11px] text-ink-faint">{labels.audit.roles[event.actor.role]}</span>
                </span>
                <bdi className="font-mono text-[13px] text-ink-soft">
                  {formatDateTime(event.occurredAt, locale === 'en' ? 'en' : 'fa')}
                </bdi>
                <span className="flex items-center gap-1.5">
                  <bdi className="font-mono text-[11px] text-ink-faint">{event.checksum.slice(0, 12)}…</bdi>
                  <CopyButton
                    value={event.checksum}
                    label={labels.audit.copyChecksum}
                    copiedLabel={dictionary.common.actions.copied}
                  />
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
