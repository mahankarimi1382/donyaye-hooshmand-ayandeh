import { formatDateTime, getDictionary, toFarsiDigits } from '@karvan/i18n';
import { EmptyState, LedgerTable, PageHeader } from '@karvan/ui';
import type { LedgerColumnDef } from '@karvan/ui';
import { AUDIT_EVENT_TYPES } from '@karvan/core';
import type { AuditEventType } from '@karvan/core';

import { actorFromSession, getEffectiveSession } from '@/lib/session';
import { getStore } from '@/lib/store';
import type { AuditEvent } from '@/lib/types';

import { AuditFilters } from './audit-filters';
import { CopyButton } from '../_components/copy-button';

interface AuditPageProps {
  params: Promise<{locale: string}>;
  searchParams: Promise<{type?: string; resource?: string; q?: string}>;
}

const RESOURCE_TYPES = ['rfq', 'quote', 'trade_case', 'document', 'inquiry', 'user'] as const;

export default async function AuditPage({params, searchParams}: AuditPageProps) {
  const {locale} = await params;
  const {type: typeParam, resource: resourceParam, q: queryParam} = await searchParams;
  const dictionary = getDictionary(locale);
  const labels = dictionary.crm;

  const session = await getEffectiveSession('crm');
  const actor = actorFromSession(session);
  const store = getStore();

  const eventType: AuditEventType | undefined = (AUDIT_EVENT_TYPES as readonly string[]).includes(typeParam ?? '')
    ? (typeParam as AuditEventType)
    : undefined;
  const resourceType: string | undefined = (RESOURCE_TYPES as readonly string[]).includes(resourceParam ?? '')
    ? (resourceParam as string)
    : undefined;
  const search = (queryParam ?? '').trim();

  let events: AuditEvent[] = store.getAuditEvents(actor, {
    ...(eventType ? {type: eventType} : {}),
    ...(resourceType ? {resourceType} : {}),
  });
  if (search.length > 0) {
    const needle = search.toLowerCase();
    events = events.filter((event) =>
      [
        event.resource.reference ?? '',
        event.resource.id,
        event.resource.type,
        event.actor.id,
        event.action ?? '',
        event.fromStatus ?? '',
        event.toStatus ?? '',
        event.checksum,
      ]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    );
  }

  const nameOf = (userId: string): string => store.getUser(userId)?.name ?? userId;

  const columns: ReadonlyArray<LedgerColumnDef<AuditEvent>> = [
    {
      key: 'occurredAt',
      header: labels.audit.timestamp,
      render: (event) => (
        <bdi className="font-mono text-[13px] text-ink-soft">
          {formatDateTime(event.occurredAt, locale === 'en' ? 'en' : 'fa')}
        </bdi>
      ),
    },
    {
      key: 'type',
      header: labels.audit.eventType,
      render: (event) => (
        <span className="text-ink">{labels.audit.eventTypes[event.type] ?? event.type}</span>
      ),
    },
    {
      key: 'actor',
      header: labels.audit.actor,
      render: (event) => (
        <span className="flex flex-col">
          <span className="text-ink">{nameOf(event.actor.id)}</span>
          <span className="text-[11px] text-ink-faint">{labels.audit.roles[event.actor.role] ?? event.actor.role}</span>
        </span>
      ),
    },
    {
      key: 'resource',
      header: labels.audit.resourceRef,
      mono: true,
      render: (event) => (
        <bdi>{event.resource.reference ?? `${event.resource.type}/${event.resource.id}`}</bdi>
      ),
    },
    {
      key: 'action',
      header: labels.audit.actionCode,
      mono: true,
      render: (event) => <bdi>{event.action ?? '—'}</bdi>,
    },
    {
      key: 'checksum',
      header: labels.audit.checksum,
      render: (event) => (
        <span className="flex items-center gap-1.5">
          <bdi className="font-mono text-[11px] text-ink-faint">{event.checksum.slice(0, 10)}…</bdi>
          <CopyButton
            value={event.checksum}
            label={labels.audit.copyChecksum}
            copiedLabel={dictionary.common.actions.copied}
          />
        </span>
      ),
    },
    {
      key: 'details',
      header: labels.audit.details,
      align: 'end',
      render: (event) => (
        <details className="text-start">
          <summary className="cursor-pointer text-[13px] text-harbor underline-offset-4 hover:underline [&::-webkit-details-marker]:hidden">
            {labels.audit.expand}
          </summary>
          <pre
            dir="ltr"
            className="mt-2 max-w-md overflow-auto rounded-[2px] border border-rule bg-well p-3 text-start font-mono text-[11px] leading-5 text-ink-soft"
          >
            {JSON.stringify(
              {
                id: event.id,
                type: event.type,
                action: event.action,
                fromStatus: event.fromStatus,
                toStatus: event.toStatus,
                metadata: event.metadata ?? labels.audit.metadataEmpty,
              },
              null,
              2,
            )}
          </pre>
        </details>
      ),
    },
  ];

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title={labels.tabs.audit}
        meta={[{label: labels.audit.filters, value: toFarsiDigits(events.length)}]}
      />

      <AuditFilters
        eventType={eventType ?? 'all'}
        resourceType={resourceType ?? 'all'}
        query={search}
        eventTypes={AUDIT_EVENT_TYPES.map((type) => ({value: type, label: labels.audit.eventTypes[type] ?? type}))}
        resourceTypes={RESOURCE_TYPES.map((type) => ({value: type, label: labels.audit.resourceTypes[type] ?? type}))}
        labels={{
          eventType: labels.audit.eventType,
          resource: labels.audit.resource,
          searchLabel: labels.audit.searchLabel,
          searchPlaceholder: labels.audit.searchPlaceholder,
          reset: dictionary.common.actions.reset,
        }}
      />

      {events.length === 0 ? (
        <EmptyState
          title={labels.audit.emptyTitle}
          code={labels.audit.emptyCode}
          description={labels.audit.emptyDescription}
        />
      ) : (
        <div className="overflow-x-auto rounded-[2px] border border-rule shadow-register">
          <LedgerTable
            columns={columns}
            rows={events}
            rowKey={(event) => event.id}
            density="compact"
            caption={labels.tabs.audit}
          />
        </div>
      )}
    </section>
  );
}
