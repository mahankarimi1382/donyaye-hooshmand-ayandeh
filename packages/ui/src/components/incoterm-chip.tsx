import { forwardRef } from 'react';
import { cn } from '../lib/cn';

/* Per-term tint from the status palette (DESIGN_SPEC §5.8). */
const TERM_TINTS: Record<string, string> = {
  FOB: 'border-harbor text-harbor bg-harbor/10',
  CIF: 'border-clear text-clear bg-clear/10',
  EXW: 'border-ochre text-ochre bg-ochre/10',
  DAP: 'border-observed text-observed bg-observed/10',
  CFR: 'border-rule-strong text-ink-soft bg-transparent',
};

const DEFAULT_TINT = 'border-rule text-ink-soft bg-transparent';

export interface IncotermChipProps {
  term: string;
  namedPlace?: string;
  className?: string;
}

export const IncotermChip = forwardRef<HTMLSpanElement, IncotermChipProps>(function IncotermChip(
  { term, namedPlace, className },
  ref,
) {
  const tint = TERM_TINTS[term] ?? DEFAULT_TINT;
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-0.5 font-mono text-[12px] font-semibold',
        tint,
        className,
      )}
    >
      <bdi>
        {term}
        {namedPlace ? ` / ${namedPlace}` : ''}
      </bdi>
    </span>
  );
});
