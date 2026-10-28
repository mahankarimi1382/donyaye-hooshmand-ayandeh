'use client';

import { useRouter } from '@/i18n/navigation';

import { Tabs } from '@karvan/ui';
import { Input } from '@karvan/ui';

/*
 * Inbox filter bar: status tabs + search box, both reflected in the URL
 * (?status=&q=). The server page reads searchParams and filters via the store;
 * this component only rewrites the address.
 */

export interface InboxFilterTab {
  id: string;
  label: string;
}

export interface InboxFiltersLabels {
  searchLabel: string;
  searchPlaceholder: string;
}

export function InboxFilters({
  tabs,
  activeStatus,
  query,
  labels,
}: {
  tabs: readonly InboxFilterTab[];
  activeStatus: string;
  query: string;
  labels: InboxFiltersLabels;
}) {
  const router = useRouter();

  const navigate = (status: string, q: string) => {
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (q.trim().length > 0) params.set('q', q.trim());
    const qs = params.toString();
    router.replace(qs.length > 0 ? `/crm?${qs}` : '/crm', {scroll: false});
  };

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        value={activeStatus}
        items={tabs.map((tab) => ({id: tab.id, label: tab.label, content: null}))}
        onValueChange={(id) => navigate(id, query)}
      />
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const value = new FormData(event.currentTarget).get('q');
          navigate(activeStatus, typeof value === 'string' ? value : '');
        }}
      >
        <div className="w-64">
          <Input
            name="q"
            type="search"
            defaultValue={query}
            aria-label={labels.searchLabel}
            placeholder={labels.searchPlaceholder}
          />
        </div>
        <button
          type="submit"
          className="h-9 rounded-[2px] border border-rule-strong bg-transparent px-4 text-sm text-ink transition-colors hover:border-harbor hover:text-harbor"
        >
          {labels.searchLabel}
        </button>
      </form>
    </div>
  );
}
