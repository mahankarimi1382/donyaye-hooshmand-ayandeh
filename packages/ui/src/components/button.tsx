import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '../lib/cn';

export type ButtonVariant = 'ink' | 'harbor' | 'outline' | 'ghost' | 'danger' | 'primary' | 'secondary';

export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  ink: 'border border-on-surface bg-ink text-surface shadow-sm hover:bg-on-surface-variant hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200',
  harbor: 'border border-primary bg-harbor text-on-primary shadow-sm hover:bg-primary-container hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-[0_8px_25px_-4px_rgba(157,62,26,0.3)]',
  primary: 'border border-primary bg-harbor text-on-primary shadow-sm hover:bg-primary-container hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-[0_8px_25px_-4px_rgba(157,62,26,0.3)]',
  secondary: 'border border-secondary bg-secondary text-on-secondary shadow-sm hover:bg-secondary-container hover:text-on-secondary-container hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200',
  outline: 'border border-rule-strong bg-transparent text-on-surface hover:bg-surface-container hover:border-primary/50 transition-all duration-200',
  ghost: 'border border-transparent bg-transparent text-on-surface hover:bg-surface-container transition-all duration-200',
  danger: 'border border-seal bg-seal text-on-error shadow-sm hover:opacity-90 transition-all duration-200',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3.5 text-sm',
  md: 'h-10 gap-2 px-5 text-sm',
  lg: 'h-12 gap-2.5 px-7 text-base',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'ink',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    className,
    children,
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {leftIcon && (
        <span aria-hidden="true" className="inline-flex rtl:order-last">
          {leftIcon}
        </span>
      )}
      {children}
      {isLoading && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
      {rightIcon && (
        <span aria-hidden="true" className="inline-flex rtl:order-first">
          {rightIcon}
        </span>
      )}
    </button>
  );
});
