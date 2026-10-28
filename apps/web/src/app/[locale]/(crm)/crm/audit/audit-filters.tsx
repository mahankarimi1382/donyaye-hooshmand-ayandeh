'use client';

import { useRouter } from '@/i18n/navigation';

import { Button, FormField, Input, Select } from '@karvan/ui';

/*
 * Event-ledger filter bar: event type (19 core types), resource type and a
 * free-text search, all reflected in the URL query and resolved server-side.
 */
export function AuditFilters({
  eventTypes,
  resourceTypes,
  eventType,
  resourceType,
  query,
  labels,
}: {
  eventTypes: ReadonlyArray<{value: string; label: string}>;
  resourceTypes: ReadonlyArray<{value: string; label: string}>;
  eventType: string;
  resourceType: string;
  query: string;
  labels: {
    eventType: string;
    resource: string;
    searchLabel: string;
    searchPlaceholder: string;
    reset: string;
  };
}) {
  const router = useRouter();

  const navigate = (type: string, resource: string, q: string) => {
    const params = new URLSearchParams();
    if (type !== 'all') params.set('type', type);
    if (resource !== 'all') params.set('resource', resource);
    if (q.trim().length > 0) params.set('q', q.trim());
    const qs = params.toString();
    router.replace(qs.length > 0 ? `/crm/audit?${qs}` : '/crm/audit', {scroll: false});
  };

  return (
    <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-4">
      <FormField label={labels.eventType}>
        <Select
          value={eventType}
          onChange={(event) => navigate(event.target.value, resourceType, query)}
        >
          <option value="all">{labels.eventType}</option>
          {eventTypes.map((entry) => (
            <option key={entry.value} value={entry.value}>
              {entry.label}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label={labels.resource}>
        <Select
          value={resourceType}
          onChange={(event) => navigate(eventType, event.target.value, query)}
        >
          <option value="all">{labels.resource}</option>
          {resourceTypes.map((entry) => (
            <option key={entry.value} value={entry.value}>
              {entry.label}
            </option>
          ))}
        </Select>
      </FormField>
      <form
        className="contents"
        onSubmit={(event) => {
          event.preventDefault();
          const value = new FormData(event.currentTarget).get('q');
          navigate(eventType, resourceType, typeof value === 'string' ? value : '');
        }}
      >
        <FormField label={labels.searchLabel}>
          <Input name="q" type="search" defaultValue={query} placeholder={labels.searchPlaceholder} />
        </FormField>
        <div className="mt-1.5 flex gap-2">
          <Button variant="outline" size="sm" type="submit">
            {labels.searchLabel}
          </Button>
          <Button variant="ghost" size="sm" type="button" onClick={() => navigate('all', 'all', '')}>
            {labels.reset}
          </Button>
        </div>
      </form>
    </div>
  );
}
