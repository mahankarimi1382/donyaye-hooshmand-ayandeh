import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../lib/cn';

export interface EmptyStateProps {
  title: string;
  code?: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

/* All copy arrives via props; the panel only draws the stamped frame. */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { title, code, description, icon: Icon, action, className },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col items-center gap-3 rounded-[2px] border border-dashed border-rule-strong bg-sheet px-8 py-14 text-center shadow-xs backdrop-blur-xs',
        className,
      )}
    >
      {Icon && (
        <div className="flex size-14 items-center justify-center rounded-2xl bg-surface-container text-primary">
          <Icon aria-hidden="true" className="size-7" />
        </div>
      )}
      <p className="font-display text-2xl font-bold text-on-surface">{title}</p>
      {code && (
        <bdi className="font-mono text-xs tracking-wider text-on-surface-variant/70 uppercase px-3 py-1 rounded-full bg-surface-container">{code}</bdi>
      )}
      {description && <p className="max-w-md text-sm text-on-surface-variant leading-relaxed">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
});
