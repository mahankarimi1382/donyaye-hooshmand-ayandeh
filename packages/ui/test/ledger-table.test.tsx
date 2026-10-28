import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { LedgerTable } from '../src/components/ledger-table';
import type { LedgerColumnDef } from '../src/components/ledger-table';

interface SampleRow {
  id: string;
  item: string;
  qty: string;
  total: string;
}

const columns: ReadonlyArray<LedgerColumnDef<SampleRow>> = [
  { key: 'item', header: 'کالا' },
  { key: 'qty', header: 'تعداد', numeric: true },
  { key: 'total', header: 'جمع کل', numeric: true, mono: true },
];

const rows: readonly SampleRow[] = [
  { id: 'l1', item: 'پارچه نخی', qty: '1,200', total: '61,420,000' },
  { id: 'total', item: 'جمع فاکتور', qty: '', total: '61,420,000' },
];

afterEach(cleanup);

describe('LedgerTable', () => {
  it('renders header and body cells', () => {
    render(
      <LedgerTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        caption="ردیف‌های پیش‌فاکتور"
      />,
    );
    expect(screen.getByText('کالا')).toBeTruthy();
    expect(screen.getByText('پارچه نخی')).toBeTruthy();
    expect(screen.getAllByText('61,420,000')).toHaveLength(2);
  });

  it('applies compact and comfortable density classes', () => {
    const { container, unmount } = render(
      <LedgerTable columns={columns} rows={rows} rowKey={(row) => row.id} density="compact" />,
    );
    expect(container.querySelector('td')?.className).toContain('h-8');
    unmount();
    const comfortable = render(
      <LedgerTable columns={columns} rows={rows} rowKey={(row) => row.id} />,
    );
    expect(comfortable.container.querySelector('td')?.className).toContain('h-12');
    comfortable.unmount();
  });

  it('draws the double rule above isTotal rows', () => {
    const { container } = render(
      <LedgerTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        isTotal={(row) => row.id === 'total'}
      />,
    );
    const cells = Array.from(container.querySelectorAll('tbody tr'));
    const totalRow = cells.find((tr) => tr.textContent?.includes('جمع فاکتور'));
    expect(totalRow).toBeTruthy();
    const totalCell = totalRow?.querySelector('td');
    expect(totalCell?.className).toContain('border-double');
    expect(totalCell?.className).toContain('border-t-[3px]');
  });

  it('renders mono columns with the mono face and tabular numerals', () => {
    const { container } = render(<LedgerTable columns={columns} rows={rows} rowKey={(row) => row.id} />);
    const monoCell = Array.from(container.querySelectorAll('td')).find((td) =>
      td.className.includes('font-mono'),
    );
    expect(monoCell?.className).toContain('tabular-nums');
    expect(monoCell?.className).toContain('text-right');
  });

  it('keeps the caption visually hidden', () => {
    const { container } = render(
      <LedgerTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        caption="ردیف‌های پیش‌فاکتور"
      />,
    );
    const caption = container.querySelector('caption');
    expect(caption?.className).toContain('sr-only');
    expect(caption?.textContent).toBe('ردیف‌های پیش‌فاکتور');
  });

  it('renders the empty message when there are no rows', () => {
    render(
      <LedgerTable
        columns={columns}
        rows={[]}
        rowKey={(row) => row.id}
        emptyMessage="ردیفی ثبت نشده است"
      />,
    );
    expect(screen.getByText('ردیفی ثبت نشده است')).toBeTruthy();
  });

  it('paints the leading status edge from rowTone', () => {
    const { container } = render(
      <LedgerTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        rowTone={(row) => (row.id === 'l1' ? 'seal' : undefined)}
      />,
    );
    const firstCell = container.querySelector('tbody tr td');
    expect(firstCell?.className).toContain('border-s-[3px]');
    expect(firstCell?.className).toContain('border-seal');
  });
});
