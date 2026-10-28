import { forwardRef } from 'react';
import type { ReactElement, ReactNode, Ref, RefAttributes } from 'react';
import { cn } from '../lib/cn';
import { toneClasses } from '../meta';
import type { StatusTone } from '../meta';

export interface LedgerColumnDef<T> {
  key: string;
  header: ReactNode;
  render?: (row: T) => ReactNode;
  align?: 'start' | 'center' | 'end';
  mono?: boolean;
  /* Numeric columns align to the physical right and never mirror (§7). */
  numeric?: boolean;
  width?: string;
}

export interface LedgerTableProps<T> {
  columns: ReadonlyArray<LedgerColumnDef<T>>;
  rows: readonly T[];
  rowKey: (row: T) => string;
  caption?: string;
  density?: 'comfortable' | 'compact';
  isTotal?: (row: T) => boolean;
  rowTone?: (row: T) => StatusTone | undefined;
  emptyMessage?: ReactNode;
  className?: string;
}

const DENSITY_CLASSES = {
  comfortable: 'h-12',
  compact: 'h-8',
} as const;

const ALIGN_CLASSES = {
  start: 'text-start',
  center: 'text-center',
  end: 'text-end',
} as const;

function renderLedgerTable<T>(
  {
    columns,
    rows,
    rowKey,
    caption,
    density = 'comfortable',
    isTotal,
    rowTone,
    emptyMessage,
    className,
  }: LedgerTableProps<T>,
  ref: Ref<HTMLTableElement>,
) {
  const densityClass = DENSITY_CLASSES[density];
  return (
    <table ref={ref} className={cn('w-full border-collapse bg-sheet text-sm', className)}>
      {caption && <caption className="sr-only">{caption}</caption>}
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              scope="col"
              style={column.width ? { width: column.width } : undefined}
              className={cn(
                'sticky top-0 z-10 border-b border-rule bg-well/70 px-4 font-semibold text-ink-soft backdrop-blur-xs',
                densityClass,
                ALIGN_CLASSES[column.align ?? 'start'],
                column.numeric && 'text-right tabular-nums',
              )}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="h-24 px-4 text-center text-ink-faint">
              {emptyMessage}
            </td>
          </tr>
        ) : (
          rows.map((row) => {
            const total = isTotal?.(row) ?? false;
            const tone = rowTone?.(row);
            const rowToneClasses = tone ? toneClasses(tone) : undefined;
            return (
              <tr
                key={rowKey(row)}
                className="border-b border-rule/50 transition-colors last:border-b-0 hover:bg-row-hover odd:bg-sheet even:bg-well/25"
              >
                {columns.map((column, columnIndex) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-4 align-middle text-ink',
                      densityClass,
                      ALIGN_CLASSES[column.align ?? 'start'],
                      column.numeric && 'text-right tabular-nums',
                      column.mono && 'font-mono text-[13px]',
                      total && 'border-t-[3px] border-double border-ink',
                      columnIndex === 0 && 'border-s-[3px]',
                      columnIndex === 0 &&
                        (rowToneClasses ? rowToneClasses.border : 'border-s-transparent'),
                    )}
                  >
                    {column.render
                      ? column.render(row)
                      : String((row as Record<string, unknown>)[column.key] ?? '')}
                  </td>
                ))}
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}

type LedgerTableComponent = <T>(
  props: LedgerTableProps<T> & RefAttributes<HTMLTableElement>,
) => ReactElement | null;

export const LedgerTable = forwardRef(renderLedgerTable) as LedgerTableComponent;
