import { forwardRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../lib/cn';

export interface StepperStep {
  id: string;
  label: string;
  description?: string;
}

export interface StepperProps {
  steps: readonly StepperStep[];
  current: number;
  onStepClick?: (index: number) => void;
  isStepClickable?: (index: number) => boolean;
  className?: string;
}

type StepState = 'completed' | 'current' | 'future';

/*
 * The flex row and the connector after each node follow the inline
 * direction, so the whole track mirrors under RTL without extra classes.
 * Only completed steps are clickable.
 */
export const Stepper = forwardRef<HTMLOListElement, StepperProps>(function Stepper(
  { steps, current, onStepClick, isStepClickable, className },
  ref,
) {
  return (
    <ol ref={ref} className={cn('flex flex-row items-start', className)}>
      {steps.map((step, index) => {
        const state: StepState = index < current ? 'completed' : index === current ? 'current' : 'future';
        const clickable =
          Boolean(onStepClick) && (isStepClickable ? isStepClickable(index) : state === 'completed');
        const node = (
          <>
            <span
              aria-hidden="true"
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-2xl border font-mono text-sm shadow-xs transition-all',
                state === 'completed' && 'border-harbor bg-harbor text-sheet',
                state === 'current' && 'border-2 border-harbor bg-primary-fixed/50 text-on-primary-fixed-variant font-bold',
                state === 'future' && 'border-rule bg-surface-container-low text-ink-faint',
              )}
            >
              {state === 'completed' ? <Check className="size-4" /> : index + 1}
            </span>
            <span className="flex flex-col items-center gap-0.5 text-center">
              <span
                className={cn(
                  'text-sm',
                  state === 'current' ? 'font-medium text-ink' : 'text-ink-soft',
                )}
              >
                {step.label}
              </span>
              {step.description && (
                <span className="text-[13px] text-ink-faint">{step.description}</span>
              )}
            </span>
          </>
        );
        return (
          <li
            key={step.id}
            aria-current={state === 'current' ? 'step' : undefined}
            className={cn('flex flex-1 items-start', index === steps.length - 1 && 'flex-none')}
          >
            {clickable ? (
              <button type="button" onClick={() => onStepClick?.(index)} className="flex flex-col items-center gap-2">
                {node}
              </button>
            ) : (
              <div className="flex flex-col items-center gap-2">{node}</div>
            )}
            {index < steps.length - 1 && (
              <span aria-hidden="true" className="mt-[15px] h-0.5 flex-1 bg-rule-strong">
                <span
                  className="block h-full bg-harbor transition-[width] duration-300"
                  style={{ width: index < current ? '100%' : '0%' }}
                />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
});
