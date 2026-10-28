import { Fragment, forwardRef } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface PageHeaderMetaItem {
  label: string;
  value: string;
}

export interface PageHeaderProps {
  title: string;
  meta?: readonly PageHeaderMetaItem[];
  actions?: ReactNode;
  className?: string;
}

/* Manifest header: display headline over a mono metadata strip and hairline. */
export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(function PageHeader(
  { title, meta, actions, className },
  ref,
) {
  return (
    <header ref={ref} className={cn('border-b border-rule pb-4', className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-[40px] leading-[1.3] text-ink">{title}</h1>
        {actions && <div className="flex flex-wrap items-center gap-2 no-print">{actions}</div>}
      </div>
      {meta && meta.length > 0 && (
        <ul className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[13px] text-ink-soft">
          {meta.map((item, index) => (
            <Fragment key={`${item.label}-${item.value}`}>
              {index > 0 && (
                <li aria-hidden="true" className="text-rule-strong">
                  ·
                </li>
              )}
              <li className="flex items-baseline gap-2">
                <span className="text-ink-faint">{item.label}</span>
                <bdi className="text-ink">{item.value}</bdi>
              </li>
            </Fragment>
          ))}
        </ul>
      )}
    </header>
  );
});
