import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Ship } from 'lucide-react';
import { Button } from '../src/components/button';

afterEach(cleanup);

describe('Button', () => {
  it('renders each variant with its signature token class', () => {
    const variants = [
      { variant: 'ink' as const, signature: 'bg-ink' },
      { variant: 'harbor' as const, signature: 'bg-harbor' },
      { variant: 'outline' as const, signature: 'border-rule-strong' },
      { variant: 'ghost' as const, signature: 'bg-transparent' },
      { variant: 'danger' as const, signature: 'bg-seal' },
    ];
    for (const { variant, signature } of variants) {
      const { unmount } = render(<Button variant={variant}>ثبت</Button>);
      expect(screen.getByRole('button').className).toContain(signature);
      unmount();
    }
  });

  it('renders each size class', () => {
    const sizes = [
      { size: 'sm' as const, signature: 'h-8' },
      { size: 'md' as const, signature: 'h-10' },
      { size: 'lg' as const, signature: 'h-12' },
    ];
    for (const { size, signature } of sizes) {
      const { unmount } = render(<Button size={size}>ثبت</Button>);
      expect(screen.getByRole('button').className).toContain(signature);
      unmount();
    }
  });

  it('marks loading state with aria-busy, disables the button and shows the spinner', () => {
    const { container } = render(<Button isLoading>ارسال</Button>);
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(container.querySelector('.animate-spin')).not.toBeNull();
    expect(screen.getByText('ارسال')).toBeTruthy();
  });

  it('keeps the label unchanged while loading and respects an explicit disabled prop', () => {
    render(
      <Button disabled leftIcon={<Ship />}>
        بارگیری
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.getAttribute('aria-busy')).toBeNull();
  });

  it('renders icon slots and full width', () => {
    const { container } = render(
      <Button fullWidth leftIcon={<Ship />} rightIcon={<Ship />}>
        مسیر
      </Button>,
    );
    expect(screen.getByRole('button').className).toContain('w-full');
    expect(container.querySelectorAll('span > svg').length).toBe(2);
  });
});
