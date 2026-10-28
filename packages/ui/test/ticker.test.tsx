import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Ticker } from '../src/components/ticker';

const items = [
  { id: 'usd', label: 'USD 61,420 IRR' },
  { id: 'scfi', label: 'SCFI 1,742' },
];

afterEach(cleanup);

describe('Ticker', () => {
  it('doubles the track for a seamless loop', () => {
    render(<Ticker items={items} label="نرخ‌های روز" />);
    expect(screen.getAllByText('USD 61,420 IRR')).toHaveLength(2);
    expect(screen.getAllByRole('list', { hidden: true })).toHaveLength(2);
  });

  it('hides the duplicated copy from assistive technology', () => {
    const { container } = render(<Ticker items={items} />);
    const lists = container.querySelectorAll('ul');
    expect(lists[0].getAttribute('aria-hidden')).toBeNull();
    expect(lists[1].getAttribute('aria-hidden')).toBe('true');
  });

  it('runs the kv-ticker animation and pauses on hover', () => {
    const { container } = render(<Ticker items={items} />);
    const track = container.firstElementChild?.firstElementChild as HTMLElement;
    expect(track.className).toContain('kv-ticker');
    expect(track.className).toContain('hover:[animation-play-state:paused]');
  });

  it('wraps items in bdi and keeps mono meta type', () => {
    const { container } = render(<Ticker items={items} />);
    const firstItem = container.querySelector('li bdi');
    expect(firstItem).not.toBeNull();
    expect(container.querySelector('li')?.className).toContain('font-mono');
  });

  it('renders nothing without items', () => {
    const { container } = render(<Ticker items={[]} />);
    expect(container.firstElementChild).toBeNull();
  });
});
