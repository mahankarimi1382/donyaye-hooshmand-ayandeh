import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { toneClasses, UNKNOWN_STATUS_META } from '../meta';
import type { StatusMetaEntry } from '../meta';

const STAMP_LAND = 'animate-[kv-stamp-land_220ms_cubic-bezier(0.2,0.7,0.2,1)_both]';

export interface StampBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: string;
  label: string;
  meta?: StatusMetaEntry;
  justApplied?: boolean;
}

/*
 * Rubber-stamp status chip: 2px outer border plus a 1px inner hairline
 * (pseudo-element inset over the border edge), held at -2deg. The Latin
 * machine code sits beside the Persian label in mono.
 */
export const StampBadge = forwardRef<HTMLSpanElement, StampBadgeProps>(function StampBadge(
  { status, label, meta, justApplied = false, className, ...rest },
  ref,
) {
  const { tone, icon: Icon } = meta ?? UNKNOWN_STATUS_META;
  const classes = toneClasses(tone);
  const latinCode = status.toUpperCase().replace(/_/g, ' ');
  return (
    <span
      ref={ref}
      className={cn(
        'relative inline-flex -rotate-2 items-center gap-1.5 rounded-[2px] border-2 border-current px-2.5 py-1',
        'after:pointer-events-none after:absolute after:inset-0 after:rounded-[1px] after:border after:border-current after:content-[""]',
        classes.bg,
        classes.text,
        justApplied && STAMP_LAND,
        className,
      )}
      {...rest}
    >
      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      <span className="text-sm font-semibold">{label}</span>
      <bdi className="font-mono text-[13px] font-medium uppercase leading-none tracking-wide">{latinCode}</bdi>
    </span>
  );
});
