'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

/*
 * Copies an immutable checksum (or any mono token) to the clipboard.
 * The copied value is data — Latin digits, never localized.
 */
export function CopyButton({ value, label, copiedLabel }: {value: string; label: string; copiedLabel: string}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => {
        void copy();
      }}
      title={label}
      aria-label={`${label}: ${value}`}
      className="inline-flex size-6 items-center justify-center rounded-[2px] border border-rule bg-sheet text-ink-soft transition-colors hover:border-harbor hover:text-harbor"
    >
      {copied ? <Check aria-hidden="true" className="size-3.5 text-clear" /> : <Copy aria-hidden="true" className="size-3.5" />}
      <span className="sr-only">{copied ? copiedLabel : label}</span>
    </button>
  );
}
