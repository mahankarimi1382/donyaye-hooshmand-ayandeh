import { forwardRef } from 'react';
import { cn } from '../lib/cn';

export interface PerforationProps {
  className?: string;
}

/*
 * Ticket perforation: dashed hairline flanked by half-circle notches —
 * paper-color circles punched over the strip edges (a cutout, not a ramp).
 * Inline start/end insets keep the notches on the edges under RTL.
 */
export const Perforation = forwardRef<HTMLDivElement, PerforationProps>(function Perforation(
  { className },
  ref,
) {
  return (
    <div ref={ref} role="separator" className={cn('relative h-3', className)}>
      <span
        aria-hidden="true"
        className="absolute start-[-5px] top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-paper"
      />
      <span
        aria-hidden="true"
        className="absolute end-[-5px] top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-paper"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-4 top-1/2 border-t border-dashed border-rule-strong"
      />
    </div>
  );
});
