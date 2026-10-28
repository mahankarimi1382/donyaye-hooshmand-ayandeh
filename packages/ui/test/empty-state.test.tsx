import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Search } from 'lucide-react';
import { EmptyState } from '../src/components/empty-state';

afterEach(cleanup);

describe('EmptyState', () => {
  it('draws the stamped dashed panel', () => {
    const { container } = render(<EmptyState title="استعلامی یافت نشد" />);
    const panel = container.firstElementChild as HTMLElement;
    expect(panel.className).toContain('border-dashed');
    expect(panel.className).toContain('border-rule-strong');
    expect(panel.className).toContain('rounded-[2px]');
    expect(panel.className).toContain('bg-sheet');
  });

  it('renders the display title and the mono sub-code in a bdi', () => {
    render(<EmptyState title="پرونده‌ای یافت نشد" code="CASE-1404-018" />);
    expect(screen.getByText('پرونده‌ای یافت نشد').className).toContain('font-display');
    const code = screen.getByText('CASE-1404-018');
    expect(code.closest('bdi')).not.toBeNull();
    expect(code.className).toContain('font-mono');
  });

  it('renders the description, icon and action slot', () => {
    const { container } = render(
      <EmptyState
        title="سند خالی است"
        code="DOC-0"
        description="هنوز ردیفی در این سند ثبت نشده است."
        icon={Search}
        action={<button type="button">ثبت استعلام</button>}
      />,
    );
    expect(screen.getByText('هنوز ردیفی در این سند ثبت نشده است.')).toBeTruthy();
    expect(container.querySelector('svg')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'ثبت استعلام' })).toBeTruthy();
  });

  it('omits the optional slots when they are absent', () => {
    const { container } = render(<EmptyState title="خالی" />);
    expect(container.querySelector('bdi')).toBeNull();
    expect(container.querySelector('svg')).toBeNull();
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });
});
