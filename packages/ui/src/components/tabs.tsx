'use client';

import { forwardRef, useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
  mono?: boolean;
}

export interface TabsProps {
  items: readonly TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  className?: string;
}

/*
 * Roving-tabindex tablist: arrow keys move focus and activate, Home/End
 * jump to the edges. Arrow direction follows the resolved writing mode so
 * the control behaves natively in RTL.
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { items, value, defaultValue, onValueChange, className },
  ref,
) {
  const baseId = useId();
  const [internalValue, setInternalValue] = useState(defaultValue ?? items[0]?.id);
  const activeId = value ?? internalValue;
  const listRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());

  const activate = (id: string) => {
    if (value === undefined) {
      setInternalValue(id);
    }
    onValueChange?.(id);
    tabRefs.current.get(id)?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = items.findIndex((item) => item.id === activeId);
    if (currentIndex < 0) return;
    const isRtl = listRef.current ? getComputedStyle(listRef.current).direction === 'rtl' : false;
    const forwardKey = isRtl ? 'ArrowLeft' : 'ArrowRight';
    const backKey = isRtl ? 'ArrowRight' : 'ArrowLeft';
    let nextIndex: number | undefined;
    if (event.key === forwardKey) nextIndex = (currentIndex + 1) % items.length;
    else if (event.key === backKey) nextIndex = (currentIndex - 1 + items.length) % items.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = items.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    activate(items[nextIndex].id);
  };

  return (
    <div ref={ref} className={className}>
      <div
        ref={listRef}
        role="tablist"
        className="flex items-end gap-1 border-b border-rule"
        onKeyDown={handleKeyDown}
      >
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <button
              key={item.id}
              ref={(node) => {
                if (node) {
                  tabRefs.current.set(item.id, node);
                } else {
                  tabRefs.current.delete(item.id);
                }
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={active}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => activate(item.id)}
              className={cn(
                '-mb-px border-b-2 px-3 py-2 text-sm transition-colors',
                item.mono && 'font-mono text-[13px]',
                active
                  ? 'border-stamp font-medium text-ink'
                  : 'border-transparent text-ink-soft hover:text-ink',
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${baseId}-panel-${item.id}`}
          aria-labelledby={`${baseId}-tab-${item.id}`}
          hidden={item.id !== activeId}
          tabIndex={0}
          className="pt-4"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
});
