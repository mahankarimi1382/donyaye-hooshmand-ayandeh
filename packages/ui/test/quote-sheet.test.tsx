import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { QuoteSheet } from '../src/components/quote-sheet';

const labels = {
  documentCode: 'شماره سند',
  issueDate: 'تاریخ',
  parties: 'طرفین',
  lineItems: 'ردیف‌های کالا',
  description: 'شرح کالا',
  quantity: 'مقدار',
  unitPrice: 'بهای واحد',
  amount: 'مبلغ',
  financials: 'خلاصه مالی',
  grandTotal: 'جمع کل',
  checksum: 'اثر انگشت دیجیتال',
};

const lines = [
  { id: 'l1', description: 'پارچه نخی', quantity: '1,200 kg', unitPrice: '2.40', amount: '2,880.00' },
  { id: 'l2', description: 'پارچه پشمی', quantity: '300 kg', unitPrice: '4.10', amount: '1,230.00' },
];

const financials = [
  { label: 'جمع کالا', value: '4,110.00' },
  { label: 'کرایه حمل', value: '310.00' },
];

afterEach(cleanup);

describe('QuoteSheet', () => {
  it('renders the document code header and parties', () => {
    render(
      <QuoteSheet
        documentCode="KVN-PRO-1404-0017"
        issueDate="1404/08/03"
        parties={[
          { role: 'فروشنده', name: 'بافت پارس' },
          { role: 'خریدار', name: 'Loom & Co.' },
        ]}
        lines={lines}
        financials={financials}
        grandTotal="4,420.00 USD"
        checksum="9f2c…"
        labels={labels}
      />,
    );
    expect(screen.getByText('KVN-PRO-1404-0017')).toBeTruthy();
    expect(screen.getByText('بافت پارس')).toBeTruthy();
    expect(screen.getByText('Loom & Co.')).toBeTruthy();
  });

  it('renders line items through the ledger table', () => {
    render(
      <QuoteSheet
        documentCode="KVN-PRO-1404-0017"
        parties={[]}
        lines={lines}
        financials={financials}
        grandTotal="4,420.00 USD"
        checksum="9f2c…"
        labels={labels}
      />,
    );
    expect(screen.getByText('پارچه نخی')).toBeTruthy();
    expect(screen.getByText('پارچه پشمی')).toBeTruthy();
    expect(screen.getByText('شرح کالا')).toBeTruthy();
  });

  it('renders financial rows with dotted leaders', () => {
    const { container } = render(
      <QuoteSheet
        documentCode="KVN-PRO-1404-0017"
        parties={[]}
        lines={lines}
        financials={financials}
        grandTotal="4,420.00 USD"
        checksum="9f2c…"
        labels={labels}
      />,
    );
    expect(screen.getByText('جمع کالا')).toBeTruthy();
    expect(screen.getByText('کرایه حمل')).toBeTruthy();
    expect(container.querySelectorAll('.border-dotted').length).toBeGreaterThanOrEqual(2);
  });

  it('marks the grand total row with the double rule', () => {
    render(
      <QuoteSheet
        documentCode="KVN-PRO-1404-0017"
        parties={[]}
        lines={lines}
        financials={financials}
        grandTotal="4,420.00 USD"
        checksum="9f2c…"
        labels={labels}
      />,
    );
    const grandTotalLabel = screen.getByText('جمع کل');
    const row = grandTotalLabel.parentElement;
    expect(row?.className).toContain('border-double');
    expect(row?.className).toContain('border-t-[3px]');
    expect(screen.getByText('4,420.00 USD')).toBeTruthy();
  });

  it('renders the checksum strip in mono at the bottom', () => {
    render(
      <QuoteSheet
        documentCode="KVN-PRO-1404-0017"
        parties={[]}
        lines={lines}
        financials={financials}
        grandTotal="4,420.00 USD"
        checksum="9f2c7a41d0e8"
        labels={labels}
      />,
    );
    const checksum = screen.getByText('9f2c7a41d0e8');
    expect(checksum.closest('footer')).not.toBeNull();
    expect(checksum.closest('footer')?.className).toContain('font-mono');
  });

  it('renders the incoterm chip, status slot and footer slot', () => {
    render(
      <QuoteSheet
        documentCode="KVN-PRO-1404-0017"
        parties={[]}
        lines={lines}
        financials={financials}
        grandTotal="4,420.00 USD"
        checksum="9f2c…"
        labels={labels}
        incoterm={{ term: 'FOB', namedPlace: 'بندرعباس' }}
        statusSlot={<div>پیش‌نویس</div>}
        footerSlot={<button type="button">صدور پیش‌فاکتور</button>}
      />,
    );
    expect(screen.getByText('FOB / بندرعباس')).toBeTruthy();
    expect(screen.getByText('پیش‌نویس')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'صدور پیش‌فاکتور' })).toBeTruthy();
  });
});
