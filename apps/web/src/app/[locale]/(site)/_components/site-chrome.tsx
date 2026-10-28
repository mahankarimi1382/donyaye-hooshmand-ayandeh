import type { ReactNode } from 'react';
import { toFarsiDigits } from '@karvan/i18n';
import { cn } from '@karvan/ui';

/*
 * Shared (site) group chrome — the marketing-page furniture of the
 * Port Ledger language: ledger margin hairline with binding marks (§8.6),
 * mono honesty tag for seed/sample data, and manifest section indexes.
 */

/** Content frame: max-width grid container with the ledger margin hairline. */
export function SiteFrame({
  children,
  className,
  marginNote,
}: {
  children: ReactNode;
  className?: string;
  marginNote?: string;
}) {
  return (
    <div className={cn('relative mx-auto w-full max-w-7xl px-6 lg:px-12', className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 start-6 hidden w-px bg-rule lg:block"
      >
        <span className="absolute -start-[5px] top-0 h-px w-2.5 bg-rule-strong" />
        <span className="absolute -start-[5px] top-1/4 h-px w-2.5 bg-rule" />
        <span className="absolute -start-[5px] top-2/4 h-px w-2.5 bg-rule" />
        <span className="absolute -start-[5px] top-3/4 h-px w-2.5 bg-rule" />
        <span className="absolute -start-[5px] bottom-0 h-px w-2.5 bg-rule-strong" />
      </div>
      {marginNote && (
        <p
          aria-hidden="true"
          className="absolute top-1 hidden start-0 font-mono text-[10px] tracking-widest text-ink-faint [writing-mode:vertical-rl] lg:block"
        >
          <bdi>{marginNote}</bdi>
        </p>
      )}
      {children}
    </div>
  );
}

/** Mono honesty tag shown beside every seed/sample figure (BRAND honesty rule). */
export function MonoTag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[2px] border border-rule bg-sheet px-1.5 py-0.5 font-mono text-[11px] text-ink-soft',
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Manifest section index: ۰۱ in fa, 01 in en. */
export function sectionIndex(locale: string, n: number): string {
  const padded = String(n).padStart(2, '0');
  return locale === 'fa' ? toFarsiDigits(padded) : padded;
}

/** Mono link styled after the Button design-system classes (Button is <button>-only). */
export function linkButtonClasses(variant: 'harbor' | 'ink' | 'outline' | 'ghost', size: 'md' | 'lg'): string {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-[2px] font-medium transition-colors';
  const variants = {
    harbor: 'border border-harbor bg-harbor text-sheet shadow-register hover:bg-harbor-deep',
    ink: 'border border-ink bg-ink text-sheet shadow-register hover:bg-ink-soft',
    outline: 'border border-rule-strong bg-transparent text-ink hover:border-harbor hover:text-harbor',
    ghost: 'border border-transparent bg-transparent text-ink hover:bg-well',
  } as const;
  const sizes = {
    md: 'h-10 gap-2 px-4 text-sm',
    lg: 'h-12 gap-2 px-6 text-base',
  } as const;
  return `${base} ${variants[variant]} ${sizes[size]}`;
}

const UNIT_SHORT: Record<string, string> = {
  metric_ton: 'MT',
  kg: 'kg',
  pcs: 'PCS',
  meter: 'M',
  container_20ft: '20FT',
  container_40ft: '40FT',
};

/** Short Latin unit code for mono data cells (data tables keep Latin digits). */
export function unitShort(unit: string): string {
  return UNIT_SHORT[unit] ?? unit;
}

/** Jalali (fa) or Gregorian (en) year of an ISO timestamp, for the year column. */
export function yearOf(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR-u-ca-persian' : 'en-US', {
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
