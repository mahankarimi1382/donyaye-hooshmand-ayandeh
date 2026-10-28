'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';

import { postJson } from '../../_components/api-client';
import { MutationErrorNotice } from '../../_components/mutation-feedback';

/*
 * Document checklist: five fixed items (contracts CASE_CHECKLIST_ITEMS) drawn
 * as switch rows. Toggles POST immediately; no expectedVersion — the toggle
 * is a field write, not a state-machine transition.
 */

export interface ChecklistEntry {
  item: string;
  label: string;
  done: boolean;
}

export interface ChecklistPanelLabels {
  title: string;
  done: string;
  pending: string;
  versionConflict: string;
  refresh: string;
  forbidden: string;
  sessionExpired: string;
  invalidTransition: string;
  genericError: string;
}

export function ChecklistPanel({
  caseId,
  entries,
  labels,
}: {
  caseId: string;
  entries: readonly ChecklistEntry[];
  labels: ChecklistPanelLabels;
}) {
  const router = useRouter();
  const [pendingItem, setPendingItem] = useState<string | null>(null);
  const [failure, setFailure] = useState<{status: number; code: string; message: string} | null>(null);

  const toggle = async (item: string, value: boolean) => {
    setPendingItem(item);
    setFailure(null);
    const result = await postJson<unknown>(`/api/v1/cases/${caseId}/checklist`, {item, value});
    setPendingItem(null);
    if (result.ok) {
      router.refresh();
      return;
    }
    setFailure(result.failure);
  };

  const doneCount = entries.filter((entry) => entry.done).length;

  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-[11px] text-ink-faint">
        <bdi>
          {doneCount}/{entries.length}
        </bdi>{' '}
        {labels.done}
      </p>
      <ul className="flex flex-col divide-y divide-rule rounded-[2px] border border-rule bg-sheet">
        {entries.map((entry) => (
          <li key={entry.item} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <span className="text-sm text-ink">{entry.label}</span>
            <span className="flex items-center gap-2">
              <span className={`text-[11px] ${entry.done ? 'text-clear' : 'text-ink-faint'}`}>
                {entry.done ? labels.done : labels.pending}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={entry.done}
                aria-label={`${entry.label} — ${entry.done ? labels.done : labels.pending}`}
                disabled={pendingItem === entry.item}
                onClick={() => void toggle(entry.item, !entry.done)}
                className={`relative h-5 w-9 rounded-[2px] border transition-colors ${
                  entry.done ? 'border-clear bg-clear/20' : 'border-rule-strong bg-transparent'
                } disabled:opacity-60`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute top-1/2 size-3 -translate-y-1/2 rounded-[1px] transition-all ${
                    entry.done ? 'start-[calc(100%-1rem)] bg-clear' : 'start-1 bg-ink-faint'
                  }`}
                />
              </button>
            </span>
          </li>
        ))}
      </ul>
      {failure && (
        <MutationErrorNotice
          failure={failure}
          labels={{
            versionConflict: labels.versionConflict,
            forbidden: labels.forbidden,
            sessionExpired: labels.sessionExpired,
            invalidTransition: labels.invalidTransition,
            genericError: labels.genericError,
            refresh: labels.refresh,
          }}
          onRefresh={() => router.refresh()}
        />
      )}
    </div>
  );
}
