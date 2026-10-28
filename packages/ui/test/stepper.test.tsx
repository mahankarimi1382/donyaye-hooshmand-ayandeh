import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Stepper } from '../src/components/stepper';
import type { StepperStep } from '../src/components/stepper';

const steps: readonly StepperStep[] = [
  { id: 'commodity', label: 'کالا' },
  { id: 'incoterm', label: 'اینکوترمز' },
  { id: 'review', label: 'بازبینی' },
  { id: 'dispatch', label: 'ارسال' },
];

afterEach(cleanup);

describe('Stepper', () => {
  it('marks the current step with aria-current', () => {
    render(<Stepper steps={steps} current={2} />);
    const current = document.querySelector('[aria-current="step"]');
    expect(current?.textContent).toContain('بازبینی');
  });

  it('shows a check icon on completed steps and digits on the rest', () => {
    const { container } = render(<Stepper steps={steps} current={2} />);
    expect(container.querySelectorAll('svg').length).toBe(2);
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('makes only completed steps clickable', () => {
    const onStepClick = vi.fn();
    render(<Stepper steps={steps} current={2} onStepClick={onStepClick} />);
    expect(screen.getAllByRole('button')).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: 'کالا' }));
    expect(onStepClick).toHaveBeenCalledWith(0);

    expect(screen.getByText('بازبینی').closest('button')).toBeNull();
    expect(screen.getByText('ارسال').closest('button')).toBeNull();
  });

  it('renders no buttons without onStepClick', () => {
    render(<Stepper steps={steps} current={2} />);
    expect(document.querySelectorAll('button')).toHaveLength(0);
  });

  it('honours isStepClickable over the completed-only default', () => {
    const onStepClick = vi.fn();
    const { unmount } = render(
      <Stepper
        steps={steps}
        current={2}
        onStepClick={onStepClick}
        isStepClickable={(index) => index === 3}
      />,
    );
    expect(screen.getAllByRole('button')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'ارسال' }));
    expect(onStepClick).toHaveBeenCalledWith(3);
    unmount();

    render(<Stepper steps={steps} current={2} onStepClick={vi.fn()} isStepClickable={() => false} />);
    expect(document.querySelectorAll('button')).toHaveLength(0);
  });

  it('fills the connector rule up to the current step', () => {
    const { container } = render(<Stepper steps={steps} current={2} />);
    const fills = container.querySelectorAll<HTMLElement>('[style*="width"]');
    expect(fills).toHaveLength(3);
    expect(fills[0].style.width).toBe('100%');
    expect(fills[1].style.width).toBe('100%');
    expect(fills[2].style.width).toBe('0%');
  });

  it('grows the harbor progress rule inside the rule-strong track', () => {
    const { container } = render(<Stepper steps={steps} current={1} />);
    const fills = container.querySelectorAll<HTMLElement>('li > span > span');
    expect(fills).toHaveLength(3);
    expect(fills[0].className).toContain('bg-harbor');
    expect(fills[0].className).toContain('transition-[width]');
    expect(fills[0].parentElement?.className).toContain('bg-rule-strong');
  });

  it('mirrors under rtl through inline-direction layout classes', () => {
    const { container } = render(
      <div dir="rtl">
        <Stepper steps={steps} current={2} />
      </div>,
    );
    const track = container.querySelector('ol');
    expect(track?.className).toContain('flex-row');
    expect(track?.className).not.toContain('flex-row-reverse');
    // the connector follows its node in DOM order, so the inline direction
    // places it on the mirrored side without any physical classes
    for (const item of container.querySelectorAll('ol > li')) {
      const [node, connector] = Array.from(item.children);
      expect(['BUTTON', 'DIV']).toContain(node.tagName);
      if (connector) {
        expect(connector.className).toContain('bg-rule-strong');
      }
    }
  });
});
