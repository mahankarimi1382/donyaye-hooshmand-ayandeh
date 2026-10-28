import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { RouteTimeline } from '../src/components/route-timeline';
import { MILESTONE_META } from '../src/meta';

const waypoints = Object.keys(MILESTONE_META).map((id) => ({
  id,
  label: id,
}));

afterEach(cleanup);

describe('RouteTimeline', () => {
  it('renders all nine waypoints', () => {
    render(<RouteTimeline waypoints={waypoints} currentIndex={4} />);
    expect(document.querySelectorAll('li')).toHaveLength(9);
    expect(screen.getByText('in_transit')).toBeTruthy();
  });

  it('splits waypoints into completed, current and future', () => {
    render(<RouteTimeline waypoints={waypoints} currentIndex={4} />);
    expect(document.querySelectorAll('[data-state="completed"]')).toHaveLength(4);
    expect(document.querySelectorAll('[data-state="current"]')).toHaveLength(1);
    expect(document.querySelectorAll('[data-state="future"]')).toHaveLength(4);
  });

  it('marks the current waypoint with a pulsing ring', () => {
    const { container } = render(<RouteTimeline waypoints={waypoints} currentIndex={4} />);
    const current = container.querySelector('[data-state="current"]');
    expect(current?.querySelector('.kv-pulse-ring')).not.toBeNull();
  });

  it('fills completed dots with harbor and leaves future dots hollow', () => {
    const { container } = render(<RouteTimeline waypoints={waypoints} currentIndex={2} />);
    const completedDot = container.querySelector('[data-state="completed"] span span');
    expect(completedDot?.className).toContain('bg-harbor');
    const futureDot = container.querySelector('[data-state="future"] span span');
    expect(futureDot?.className).toContain('border-rule-strong');
  });

  it('exposes per-waypoint status through screen-reader labels', () => {
    render(<RouteTimeline waypoints={waypoints} currentIndex={4} />);
    expect(screen.getByText('موقعیت فعلی').className).toContain('sr-only');
    expect(screen.getAllByText('انجام‌شده')).toHaveLength(4);
    expect(screen.getAllByText('پیش‌رو')).toHaveLength(4);
  });

  it('draws an SVG route line', () => {
    const { container } = render(<RouteTimeline waypoints={waypoints} currentIndex={4} drawRoute />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    const lines = svg?.querySelectorAll('line');
    expect(lines?.length).toBe(2);
  });

  it('renders the vertical variant for narrow screens', () => {
    const { container } = render(
      <RouteTimeline waypoints={waypoints} currentIndex={4} orientation="vertical" />,
    );
    expect(container.querySelector('ol')?.className).toContain('flex-col');
    expect(document.querySelectorAll('[data-state="current"]')).toHaveLength(1);
  });
});
