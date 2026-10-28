import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface SectionHeaderProps {
  /* Manifest index, e.g. ۰۱ — Farsi numerals arrive as a string. */
  index: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  as?: 'h2' | 'h3';
  className?: string;
}

/* Numbered section opening: mono index, em dash, title, 120px ghost numeral. */
export const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(function SectionHeader(
  { index, title, description, actions, as: Heading = 'h2', className },
  ref,
) {
  return (
    <div ref={ref} className={cn('relative', className)}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 start-0 select-none font-display text-[120px] leading-none text-ink opacity-[0.08]"
      >
        {index}
      </span>
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[13px] text-ink-faint">{index}</span>
          <span aria-hidden="true" className="text-ink-faint">
            —
          </span>
          <Heading className="font-display text-[28px] leading-[1.4] text-ink">{title}</Heading>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {description && <p className="relative mt-2 max-w-2xl text-ink-soft">{description}</p>}
    </div>
  );
});
