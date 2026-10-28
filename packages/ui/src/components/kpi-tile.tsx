import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../lib/cn';

export type KpiDeltaDirection = 'up' | 'down' | 'flat';

const DELTA_ICONS: Record<KpiDeltaDirection, LucideIcon> = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
};

export interface KpiTileProps {
  label: string;
  /* Preformatted display value; Farsi numerals arrive as a string. */
  value: string;
  delta?: string;
  deltaDirection?: KpiDeltaDirection;
  hint?: ReactNode;
  className?: string;
}

export const KpiTile = forwardRef<HTMLDivElement, KpiTileProps>(function KpiTile(
  { label, value, delta, deltaDirection = 'flat', hint, className },
  ref,
) {
  const DeltaIcon = DELTA_ICONS[deltaDirection];
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-3xl border border-outline-variant/35 bg-surface-container-lowest p-6 shadow-bento transition-all duration-200 hover:-translate-y-0.5 hover:shadow-bento-hover',
        className,
      )}
    >
      <p className="font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{label}</p>
      <p className="mt-2 font-display text-4xl font-extrabold text-primary">{value}</p>
      {delta && (
        <p className="mt-2 flex items-center gap-1.5 font-mono text-[13px] text-secondary font-medium">
          <DeltaIcon
            aria-hidden="true"
            className={cn('size-3.5', deltaDirection !== 'flat' && 'rtl:[transform:scaleX(-1)]')}
          />
          <bdi>{delta}</bdi>
        </p>
      )}
      {hint && <p className="mt-2 text-xs text-on-surface-variant/70">{hint}</p>}
    </div>
  );
});
