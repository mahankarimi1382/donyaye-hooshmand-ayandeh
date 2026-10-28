'use client';

import { createContext, forwardRef, useContext, useId } from 'react';
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/cn';

interface FormFieldContextValue {
  controlId: string;
  describedBy: string | undefined;
  invalid: boolean;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

export interface FormFieldProps {
  label: string;
  id?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, id, required = false, hint, error, children, className }: FormFieldProps) {
  const autoId = useId();
  const controlId = id ?? autoId;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={controlId} className="text-sm font-medium text-ink">
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="ms-1 text-seal">
              *
            </span>
            <span className="sr-only">(required)</span>
          </>
        )}
      </label>
      <FormFieldContext.Provider value={{ controlId, describedBy, invalid: Boolean(error) }}>
        {children}
      </FormFieldContext.Provider>
      {hint && (
        <p id={hintId} className="text-[13px] text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="font-mono text-[13px] text-seal">
          {error}
        </p>
      )}
    </div>
  );
}

const CONTROL_BASE =
  'w-full rounded-xl border border-outline-variant/35 bg-sheet px-3.5 py-2.5 font-sans text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-60';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, startAdornment, endAdornment, className, ...rest },
  ref,
) {
  const field = useContext(FormFieldContext);
  const autoId = useId();
  const inputId = id ?? field?.controlId ?? autoId;
  const input = (
    <input
      ref={ref}
      id={inputId}
      aria-describedby={field?.describedBy}
      aria-invalid={field?.invalid || undefined}
      className={cn(
        CONTROL_BASE,
        field?.invalid && 'border-2 border-seal',
        startAdornment && 'ps-9',
        endAdornment && 'pe-9',
        className,
      )}
      {...rest}
    />
  );
  if (!startAdornment && !endAdornment) {
    return input;
  }
  return (
    <div className="relative">
      {startAdornment && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-ink-faint"
        >
          {startAdornment}
        </span>
      )}
      {input}
      {endAdornment && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3 text-ink-faint"
        >
          {endAdornment}
        </span>
      )}
    </div>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

/* Prose field: Persian body text stays in the sans stack at line-height 1.8. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { id, className, rows = 4, ...rest },
  ref,
) {
  const field = useContext(FormFieldContext);
  const autoId = useId();
  const textareaId = id ?? field?.controlId ?? autoId;
  return (
    <textarea
      ref={ref}
      id={textareaId}
      rows={rows}
      aria-describedby={field?.describedBy}
      aria-invalid={field?.invalid || undefined}
      className={cn(
        'w-full rounded-xl border border-outline-variant/35 bg-sheet px-3.5 py-2.5 font-sans text-sm leading-[1.8] text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-60',
        field?.invalid && 'border-2 border-seal',
        className,
      )}
      {...rest}
    />
  );
});

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { id, className, children, ...rest },
  ref,
) {
  const field = useContext(FormFieldContext);
  const autoId = useId();
  const selectId = id ?? field?.controlId ?? autoId;
  return (
    <div className="relative">
      <select
        ref={ref}
        id={selectId}
        aria-describedby={field?.describedBy}
        aria-invalid={field?.invalid || undefined}
        className={cn(CONTROL_BASE, 'appearance-none pe-9', field?.invalid && 'border-2 border-seal', className)}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 end-3 my-auto size-4 text-ink-faint"
      />
    </div>
  );
});
