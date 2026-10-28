import { notFound } from 'next/navigation';

import { formatDateTime, formatJalaliDate, getDictionary, toFarsiDigits } from '@karvan/i18n';
import {
  Button,
  EmptyState,
  LedgerTable,
  Notice,
  PageHeader,
  Perforation,
  RouteTimeline,
  SectionHeader,
  StampBadge,
} from '@karvan/ui';
import type { LedgerColumnDef } from '@karvan/ui';
import { CASE_STATUS_META, MILESTONE_META } from '@karvan/ui';
import { SHIPPING_MILESTONES, milestoneIndex } from '@karvan/core';
import type { TradeDocumentRecord } from '@/lib/types';

import { Link as LocaleLink } from '@/i18n/navigation';
import { actorFromSession, getEffectiveSession } from '@/lib/session';
import { getStore } from '@/lib/store';
import type { TradeCaseRecord } from '@/lib/types';

import { CopyButton } from '../../_components/copy-button';
import { ChecklistPanel } from './checklist-panel';
import { MilestonePanel } from './milestone-panel';

interface CaseCockpitPageProps {
  params: Promise<{locale: string; id: string}>;
}

export default async function CaseCockpitPage({params}: CaseCockpitPageProps) {
  const {locale, id} = await params;
  const dictionary = getDictionary(locale);
  const labels = dictionary.crm;

  const session = await getEffectiveSession('crm');
  const actor = actorFromSession(session);
  const store = getStore();

  let record: TradeCaseRecord;
  try {
    record = store.getTradeCase(actor, id);
  } catch {
    notFound();
  }

  const buyer = store.getOrganization(record.buyerOrganizationId);
  const quote = store.getQuote(actor, record.quoteId);
  const documents = store.listDocuments(actor).filter((document) => document.relatedEntityId === record.id);

  const completedAtOf = (milestone: string): string | undefined =>
    record.milestones.find((entry) => entry.milestone === milestone)?.completedAt;

  const waypoints = SHIPPING_MILESTONES.map((milestone) => ({
    id: milestone,
    label: dictionary.statuses.milestone[milestone],
    timestamp: completedAtOf(milestone)
      ? formatJalaliDate(completedAtOf(milestone) as string, locale === 'en' ? 'en' : 'fa')
      : undefined,
  }));
  const currentIndex = milestoneIndex(record.currentMilestone);
  const forwardOptions = SHIPPING_MILESTONES.slice(currentIndex + 1).map((milestone) => ({
    value: milestone,
    label: dictionary.statuses.milestone[milestone],
  }));

  const transportLabel = record.transportMode === 'air' ? labels.caseDetail.transportAir : labels.caseDetail.transportSea;

  const documentColumns: ReadonlyArray<LedgerColumnDef<TradeDocumentRecord>> = [
    {key: 'code', header: dictionary.common.meta.documentNumber, mono: true, render: (doc) => <bdi>{doc.code}</bdi>},
    {
      key: 'type',
      header: labels.audit.resource,
      render: (doc) => dictionary.portal.documents.categories[doc.type] ?? doc.type,
    },
    {
      key: 'file',
      header: labels.caseDetail.documents,
      render: (doc) => (
        <span className="flex flex-col">
          <span className="text-ink-soft">
            <bdi dir="ltr">{doc.fileName}</bdi>
          </span>
          <span className="text-[11px] text-ink-faint">
            {labels.caseDetail.documentSize}:{' '}
            <bdi dir="ltr" className="font-mono">
              {Math.ceil(doc.sizeBytes / 1024)} KB
            </bdi>
          </span>
        </span>
      ),
    },
    {
      key: 'uploaded',
      header: dictionary.common.meta.createdAt,
      render: (doc) => (
        <bdi className="font-mono text-[13px] text-ink-soft">
          {formatJalaliDate(doc.uploadedAt, locale === 'en' ? 'en' : 'fa')}
        </bdi>
      ),
    },
    {
      key: 'checksum',
      header: labels.audit.checksum,
      render: (doc) => (
        <span className="flex items-center gap-1.5">
          <bdi className="font-mono text-[11px] text-ink-faint">{doc.verifiedChecksum.slice(0, 12)}…</bdi>
          <CopyButton
            value={doc.verifiedChecksum}
            label={labels.audit.copyChecksum}
            copiedLabel={dictionary.common.actions.copied}
          />
        </span>
      ),
    },
  ];

  return (
    <section className="flex flex-col gap-8">
      <PageHeader
        title={record.reference}
        meta={[
          {label: labels.caseDetail.metaBuyer, value: buyer.name[locale === 'en' ? 'en' : 'fa']},
          {label: labels.caseDetail.metaCommodity, value: record.commodity[locale === 'en' ? 'en' : 'fa']},
          {label: labels.caseDetail.metaStartedAt, value: formatJalaliDate(record.createdAt, locale === 'en' ? 'en' : 'fa')},
          {label: labels.caseDetail.metaVersion, value: `v${record.version}`},
        ]}
        actions={
          <StampBadge status={record.status} label={dictionary.statuses.case[record.status]} meta={CASE_STATUS_META[record.status]} />
        }
      />

      <div className="rounded-[2px] border border-rule bg-sheet p-5 shadow-register">
        <p className="font-mono text-[13px] text-ink-soft">{labels.caseDetail.milestones}</p>
        <div className="mt-4 overflow-x-auto pb-2">
          <RouteTimeline
            waypoints={waypoints}
            currentIndex={currentIndex}
            statusLabels={{
              completed: labels.caseDetail.timelineCompleted,
              current: labels.caseDetail.timelineCurrent,
              future: labels.caseDetail.timelineFuture,
            }}
          />
        </div>
        <p className="mt-3 font-mono text-[11px] text-ink-faint">
          {transportLabel}
          {record.vesselName ? (
            <>
              {' · '}
              {labels.caseDetail.vessel}:{' '}
              <bdi dir="ltr">{record.vesselName}</bdi>
            </>
          ) : null}
          {record.billOfLading ? (
            <>
              {' · '}
              {labels.caseDetail.billOfLading}:{' '}
              <bdi dir="ltr">{record.billOfLading}</bdi>
            </>
          ) : null}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-[2px] border border-rule bg-sheet p-5 shadow-register">
          <SectionHeader index={toFarsiDigits('01')} title={labels.caseDetail.advanceMilestone} />
          <div className="mt-4">
            <MilestonePanel
              caseId={record.id}
              version={record.version}
              options={forwardOptions}
              labels={{
                milestoneTarget: labels.caseDetail.milestoneTarget,
                milestoneTargetHint: labels.caseDetail.milestoneTargetHint,
                recordMilestone: labels.caseDetail.recordMilestone,
                milestonesComplete: labels.caseDetail.milestonesComplete,
                location: labels.caseDetail.location,
                vessel: labels.caseDetail.vessel,
                billOfLading: labels.caseDetail.billOfLading,
                notes: labels.caseDetail.notes,
                versionConflict: labels.caseDetail.versionConflict,
                refresh: labels.caseDetail.refresh,
                forbidden: labels.caseDetail.forbidden,
                sessionExpired: labels.caseDetail.sessionExpired,
                invalidTransition: labels.caseDetail.invalidTransition,
                genericError: labels.caseDetail.genericError,
              }}
            />
          </div>
        </div>

        <div className="rounded-[2px] border border-rule bg-sheet p-5 shadow-register">
          <SectionHeader index={toFarsiDigits('02')} title={labels.caseDetail.checklistTitle} />
          <div className="mt-4">
            <ChecklistPanel
              caseId={record.id}
              entries={(Object.keys(labels.caseDetail.checklist) as Array<keyof typeof labels.caseDetail.checklist>).map(
                (item) => ({
                  item,
                  label: labels.caseDetail.checklist[item],
                  done: record.checklist[item]?.done ?? false,
                }),
              )}
              labels={{
                title: labels.caseDetail.checklistTitle,
                done: labels.caseDetail.checklistDone,
                pending: labels.caseDetail.checklistPending,
                versionConflict: labels.caseDetail.versionConflict,
                refresh: labels.caseDetail.refresh,
                forbidden: labels.caseDetail.forbidden,
                sessionExpired: labels.caseDetail.sessionExpired,
                invalidTransition: labels.caseDetail.invalidTransition,
                genericError: labels.caseDetail.genericError,
              }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-[2px] border border-rule bg-sheet p-5 shadow-register">
        <SectionHeader index={toFarsiDigits('03')} title={labels.caseDetail.linkedQuote} />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <LocaleLink href={`/portal/quotes/${quote.id}`} className="font-mono text-[13px] text-harbor hover:underline">
            <bdi>{quote.quoteNumber}</bdi>
          </LocaleLink>
          <span className="text-sm text-ink-soft">{dictionary.statuses.quote[quote.status].label}</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-ink-faint">{labels.caseDetail.snapshotChecksum}</span>
            <bdi dir="ltr" className="font-mono text-[11px] text-ink-faint">
              {record.quoteChecksum.slice(0, 12)}…
            </bdi>
            <CopyButton
              value={record.quoteChecksum}
              label={labels.audit.copyChecksum}
              copiedLabel={dictionary.common.actions.copied}
            />
          </div>
        </div>
      </div>

      <Perforation />

      <div>
        <SectionHeader index={toFarsiDigits('04')} title={labels.caseDetail.documents} />
        <div className="mt-4">
          {documents.length === 0 ? (
            <EmptyState
              title={labels.caseDetail.documentsEmpty}
              code={labels.caseDetail.documentsEmptyCode}
            />
          ) : (
            <div className="overflow-x-auto rounded-[2px] border border-rule shadow-register">
              <LedgerTable
                columns={documentColumns}
                rows={documents}
                rowKey={(doc) => doc.id}
                density="compact"
                caption={labels.caseDetail.documents}
              />
            </div>
          )}
          <p className="mt-3 text-[13px] text-ink-faint">{labels.caseDetail.downloadNote}</p>
        </div>
      </div>

      <div className="rounded-[2px] border border-rule bg-sheet p-5 shadow-register">
        <SectionHeader index={toFarsiDigits('05')} title={labels.caseDetail.completeOrder} />
        <div className="mt-4 flex flex-col gap-3">
          <div>
            <Button
              variant="ink"
              disabled={record.status === 'completed'}
              title={
                record.currentMilestone === 'delivered'
                  ? labels.caseDetail.completeDisabledNote
                  : labels.caseDetail.completePendingMilestones
              }
            >
              {labels.caseDetail.completeOrder}
            </Button>
          </div>
          <Notice variant="info" tag={dictionary.common.meta.status}>
            {record.currentMilestone === 'delivered'
              ? labels.caseDetail.completeDisabledNote
              : labels.caseDetail.completePendingMilestones}
          </Notice>
        </div>
      </div>

      <p className="font-mono text-[11px] text-ink-faint">
        {dictionary.common.meta.updatedAt}:{' '}
        <bdi>{formatDateTime(record.updatedAt, locale === 'en' ? 'en' : 'fa')}</bdi>
        {' · '}
        <bdi dir="ltr">{record.quoteChecksum.slice(0, 12)}…</bdi>
      </p>
    </section>
  );
}
