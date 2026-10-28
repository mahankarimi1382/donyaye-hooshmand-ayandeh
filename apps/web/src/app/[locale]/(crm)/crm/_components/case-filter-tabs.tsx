'use client';

import { useRouter } from '@/i18n/navigation';

import { Tabs } from '@karvan/ui';

/*
 * Trade-case status filter: the underline Tabs component wired to the URL
 * (?status=); the server page filters via the store.
 */
export function CaseFilterTabs({tabs, activeStatus}: {tabs: ReadonlyArray<{id: string; label: string}>; activeStatus: string}) {
  const router = useRouter();

  return (
    <Tabs
      value={activeStatus}
      items={tabs.map((tab) => ({id: tab.id, label: tab.label, content: null}))}
      onValueChange={(id) => {
        const qs = id === 'all' ? '' : `?status=${id}`;
        router.replace(qs.length > 0 ? `/crm/cases${qs}` : '/crm/cases', {scroll: false});
      }}
    />
  );
}
