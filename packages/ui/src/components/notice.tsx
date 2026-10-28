import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { CircleCheck, Info, OctagonX, TriangleAlert, X } from 'lucide-react';
import { cn } from '../lib/cn';

export type NoticeVariant = 'info' | 'success' | 'warning' | 'danger';

interface NoticeMeta {
  role: 'status' | 'alert';
  icon: LucideIcon;
  classes: string;
}

const NOTICE_META: Record<NoticeVariant, NoticeMeta> = {
  info: { role: 'status', icon: Info, classes: 'border-observed text-observed' },
  success: { role: 'status', icon: CircleCheck, classes: 'border-clear text-clear' },
  warning: { role: 'alert', icon: TriangleAlert, classes: 'border-ochre text-ochre' },
  danger: { role: 'alert', icon: OctagonX, classes: 'border-seal text-seal' },
};

export interface NoticeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: NoticeVariant;
  tag?: string;
  title?: string;
  onDismiss?: () => void;
  dismissLabel?: string;
}

export const Notice = forwardRef<HTMLDivElement, NoticeProps>(function Notice(
  {
    variant = 'info',
    tag,
    title,
    onDismiss,
    dismissLabel = 'بستن',
    children,
    className,
    ...rest
  },
  ref,
) {
  const { role, icon: Icon, classes } = NOTICE_META[variant];
  return (
    <div
      ref={ref}
      role={role}
      className={cn('flex items-start gap-3 rounded-2xl border bg-surface-container-lowest/90 px-4 py-3.5 shadow-xs backdrop-blur-xs', classes, className)}
      {...rest}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">
        {(tag || title) && (
          <p className="flex flex-wrap items-baseline gap-x-2">
            {tag && <span className="font-mono text-[13px] font-medium">{tag}</span>}
            {title && <span className="font-medium text-ink">{title}</span>}
          </p>
        )}
        <div className="text-sm text-ink-soft">{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="rounded-full p-1 text-ink-faint transition-colors hover:bg-well hover:text-ink"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      )}
    </div>
  );
});
