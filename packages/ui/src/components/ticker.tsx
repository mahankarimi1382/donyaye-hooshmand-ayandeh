import { forwardRef } from 'react';
import type { CSSProperties } from 'react';
import { cn } from '../lib/cn';

export interface TickerItem {
  id: string;
  label: string;
}

export interface TickerProps {
  items: readonly TickerItem[];
  /* Animation duration for one full loop; 60px/s on a typical track. */
  duration?: string;
  label?: string;
  className?: string;
}

/*
 * Doubled track: the item list renders twice and kv-ticker translates the
 * track by -50% for a seamless loop. Under RTL the direction reverses.
 * Reduced-motion renders it static (base.css neutralizes the animation).
 */
export const Ticker = forwardRef<HTMLDivElement, TickerProps>(function Ticker(
  { items, duration = '40s', label, className },
  ref,
) {
  if (items.length === 0) {
    return null;
  }
  return (
    <div
      ref={ref}
      aria-label={label}
      className={cn('overflow-hidden border-y border-rule bg-sheet py-2', className)}
    >
      <div
        className="flex w-max animate-[kv-ticker_var(--kv-ticker-duration,40s)_linear_infinite] hover:[animation-play-state:paused] rtl:[animation-direction:reverse]"
        style={{ '--kv-ticker-duration': duration } as CSSProperties}
      >
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1 || undefined}
            className="flex shrink-0 items-center"
          >
            {items.map((item) => (
              <li
                key={item.id}
                className="whitespace-nowrap px-6 font-mono text-[13px] text-ink-soft after:ms-6 after:content-['·'] after:text-rule-strong"
              >
                <bdi>{item.label}</bdi>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
});
