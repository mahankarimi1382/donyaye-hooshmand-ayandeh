import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Tabs } from '../src/components/tabs';

const items = [
  { id: 'inbox', label: 'صندوق ورودی', content: <p>استعلام‌های جدید</p> },
  { id: 'cases', label: 'پرونده‌ها', content: <p>پرونده‌های جاری</p> },
  { id: 'audit', label: 'دفتر رخداد', content: <p>رخدادها</p>, mono: true },
];

afterEach(cleanup);

describe('Tabs', () => {
  it('renders the tablist with tab and tabpanel roles', () => {
    render(<Tabs items={items} />);
    expect(screen.getByRole('tablist')).toBeTruthy();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getAllByRole('tabpanel', { hidden: true })).toHaveLength(3);
  });

  it('selects the first tab by default and hides the others', () => {
    render(<Tabs items={items} />);
    expect(screen.getByRole('tab', { name: 'صندوق ورودی' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tab', { name: 'پرونده‌ها' }).getAttribute('aria-selected')).toBe('false');
    expect(screen.getByText('استعلام‌های جدید').closest('[role="tabpanel"]')).not.toBeNull();
    expect(screen.getByText('پرونده‌های جاری').closest('div')?.hasAttribute('hidden')).toBe(true);
  });

  it('underlines the active tab with the stamp-red rule', () => {
    render(<Tabs items={items} />);
    const active = screen.getByRole('tab', { name: 'صندوق ورودی' });
    expect(active.className).toContain('border-stamp');
    expect(active.className).toContain('border-b-2');
    const inactive = screen.getByRole('tab', { name: 'پرونده‌ها' });
    expect(inactive.className).not.toContain('border-stamp');
  });

  it('switches on click and reports the change', () => {
    const onValueChange = vi.fn();
    render(<Tabs items={items} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'پرونده‌ها' }));
    expect(onValueChange).toHaveBeenCalledWith('cases');
    expect(screen.getByRole('tab', { name: 'پرونده‌ها' }).getAttribute('aria-selected')).toBe('true');
  });

  it('moves focus and selection with arrow keys', () => {
    render(<Tabs items={items} />);
    const first = screen.getByRole('tab', { name: 'صندوق ورودی' });
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    const second = screen.getByRole('tab', { name: 'پرونده‌ها' });
    expect(second.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(second);
    expect(second.getAttribute('tabindex')).toBe('0');
    expect(first.getAttribute('tabindex')).toBe('-1');

    fireEvent.keyDown(second, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(first);
  });

  it('renders mono labels when requested', () => {
    render(<Tabs items={items} defaultValue="audit" />);
    expect(screen.getByRole('tab', { name: 'دفتر رخداد' }).className).toContain('font-mono');
  });
});
