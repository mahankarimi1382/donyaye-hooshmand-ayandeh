import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import { Fingerprint } from 'lucide-react';
import { cn } from '../lib/cn';
import { IncotermChip } from './incoterm-chip';
import { LedgerTable } from './ledger-table';
import type { LedgerColumnDef } from './ledger-table';
import { Perforation } from './perforation';

export interface QuoteSheetParty {
  role: string;
  name: string;
  detail?: string;
}

export interface QuoteSheetLine {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
}

export interface QuoteSheetFinancialRow {
  label: string;
  value: string;
}

export interface QuoteSheetLabels {
  documentCode: string;
  issueDate: string;
  parties: string;
  lineItems: string;
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
  financials: string;
  grandTotal: string;
  checksum: string;
}

export interface QuoteSheetIncoterm {
  term: string;
  namedPlace?: string;
}

export interface QuoteSheetProps {
  documentCode: string;
  issueDate?: string;
  parties: readonly QuoteSheetParty[];
  lines: readonly QuoteSheetLine[];
  financials: readonly QuoteSheetFinancialRow[];
  grandTotal: string;
  checksum: string;
  labels: QuoteSheetLabels;
  incoterm?: QuoteSheetIncoterm;
  statusSlot?: ReactNode;
  footerSlot?: ReactNode;
  className?: string;
}

export const QuoteSheet = forwardRef<HTMLElement, QuoteSheetProps>(function QuoteSheet(
  {
    documentCode,
    issueDate,
    parties,
    lines,
    financials,
    grandTotal,
    checksum,
    labels,
    incoterm,
    statusSlot,
    footerSlot,
    className,
  },
  ref,
) {
  const columns: ReadonlyArray<LedgerColumnDef<QuoteSheetLine>> = [
    { key: 'description', header: labels.description },
    { key: 'quantity', header: labels.quantity, numeric: true },
    { key: 'unitPrice', header: labels.unitPrice, numeric: true, mono: true },
    { key: 'amount', header: labels.amount, numeric: true, mono: true },
  ];
  return (
    <article
      ref={ref}
      className={cn('rounded-[2px] border border-rule bg-sheet shadow-register', className)}
    >
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-rule px-6 py-4">
        <p className="flex items-baseline gap-2 font-mono text-[13px] text-ink-soft">
          <span>{labels.documentCode}</span>
          <bdi className="text-ink">{documentCode}</bdi>
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {incoterm && <IncotermChip term={incoterm.term} namedPlace={incoterm.namedPlace} />}
          {issueDate && (
            <p className="flex items-baseline gap-2 font-mono text-[13px] text-ink-soft">
              <span>{labels.issueDate}</span>
              <bdi className="text-ink">{issueDate}</bdi>
            </p>
          )}
        </div>
      </header>
      {statusSlot && <div className="px-6 pt-4">{statusSlot}</div>}
      <section aria-label={labels.parties} className="grid gap-4 px-6 py-5 sm:grid-cols-2">
        {parties.map((party) => (
          <div key={party.role}>
            <p className="font-mono text-[13px] text-ink-faint">{party.role}</p>
            <p className="font-medium text-ink">{party.name}</p>
            {party.detail && <p className="text-sm text-ink-soft">{party.detail}</p>}
          </div>
        ))}
      </section>
      <Perforation />
      <section aria-label={labels.lineItems} className="px-6 py-5">
        <LedgerTable
          columns={columns}
          rows={lines}
          rowKey={(line) => line.id}
          caption={labels.lineItems}
        />
      </section>
      <section aria-label={labels.financials} className="px-6 pb-5">
        <p className="mb-2 font-mono text-[13px] text-ink-faint">{labels.financials}</p>
        <ul className="flex flex-col">
          {financials.map((row) => (
            <li key={row.label} className="flex items-baseline gap-2 py-1 text-sm">
              <span className="text-ink-soft">{row.label}</span>
              <span aria-hidden="true" className="flex-1 border-b border-dotted border-rule-strong" />
              <bdi className="font-mono tabular-nums text-ink">{row.value}</bdi>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-baseline justify-between gap-2 border-t-[3px] border-double border-ink pt-3">
          <span className="font-medium text-ink">{labels.grandTotal}</span>
          <bdi className="font-mono text-lg font-medium tabular-nums text-ink">{grandTotal}</bdi>
        </div>
      </section>
      <footer className="flex items-center gap-2 border-t border-rule px-6 py-3 font-mono text-[13px] text-ink-faint">
        <Fingerprint aria-hidden="true" className="size-4 shrink-0" />
        <span>{labels.checksum}</span>
        <bdi className="truncate text-ink-soft">{checksum}</bdi>
      </footer>
      {footerSlot && <div className="border-t border-rule px-6 py-4 no-print">{footerSlot}</div>}
    </article>
  );
});
