import { RFQ_STATUS_VALUES } from '@karvan/core';
import type { RfqStatus } from '@karvan/core';
import { cn } from '@karvan/ui';

/* Horizontal strip of all 11 RFQ states with the current one highlighted.
 * Small, mono, no pills — a reading of the machine, not a status display. */
export function RfqStatusStrip({
  current,
  labels,
}: {
  current: RfqStatus;
  labels: {stripLabel: string; statuses: Record<string, string>};
}) {
  return (
    <ol className="flex flex-wrap items-center gap-1.5" aria-label={labels.stripLabel}>
      {RFQ_STATUS_VALUES.map((status, index) => {
        const active = status === current;
        return (
          <li key={status} className="flex items-center gap-1.5">
            {index > 0 && (
              <span aria-hidden="true" className="text-rule-strong">
                →
              </span>
            )}
            <span
              aria-current={active ? 'step' : undefined}
              className={cn(
                'inline-flex items-center rounded-[2px] border px-2 py-0.5 font-mono text-[11px] leading-5',
                active
                  ? 'border-ink bg-ink font-medium text-sheet'
                  : 'border-rule bg-sheet text-ink-soft',
              )}
            >
              <bdi>{labels.statuses[status] ?? status}</bdi>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
