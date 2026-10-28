import { defineStatusMachine } from './state-machine';
import type { StatusTransition } from './state-machine';

export const TRADE_CASE_STATUS_VALUES = ['confirmed', 'in_execution', 'completed', 'cancelled'] as const;

export type TradeCaseStatus = (typeof TRADE_CASE_STATUS_VALUES)[number];

export const TRADE_CASE_STATUS_SET: ReadonlySet<string> = new Set<string>(TRADE_CASE_STATUS_VALUES);

export const TRADE_CASE_TRANSITIONS: readonly StatusTransition<TradeCaseStatus>[] = [
  {
    from: 'confirmed',
    to: 'in_execution',
    action: 'START_EXECUTION',
    description: 'Confirmed case enters execution.',
  },
  {
    from: 'in_execution',
    to: 'completed',
    action: 'COMPLETE_CASE',
    description: 'Case is completed after the shipment is delivered.',
  },
  {
    from: 'confirmed',
    to: 'cancelled',
    action: 'CANCEL_CASE',
    description: 'Case is cancelled before execution; the store requires a reason.',
  },
  {
    from: 'in_execution',
    to: 'cancelled',
    action: 'CANCEL_CASE',
    description: 'Case is cancelled during execution; the store requires a reason.',
  },
];

const machine = defineStatusMachine(TRADE_CASE_STATUS_VALUES, TRADE_CASE_TRANSITIONS);

// Cancellation requires a reason at the store level; this machine is topological.
export const TRADE_CASE_TERMINAL_STATUSES: readonly TradeCaseStatus[] = machine.terminalStatuses;

export const TRADE_CASE_TERMINAL_STATUSES_SET: ReadonlySet<string> = new Set<string>(
  TRADE_CASE_TERMINAL_STATUSES,
);

export class InvalidTradeCaseStatusError extends Error {
  readonly code = 'invalid_trade_case_status';
  readonly status: string;

  constructor(status: string) {
    super(`Unknown trade case status: "${status}"`);
    this.name = 'InvalidTradeCaseStatusError';
    this.status = status;
  }
}

export class InvalidTradeCaseTransitionError extends Error {
  readonly code = 'invalid_trade_case_transition';
  readonly from: TradeCaseStatus;
  readonly to: TradeCaseStatus;
  readonly allowed: readonly TradeCaseStatus[];

  constructor(from: TradeCaseStatus, to: TradeCaseStatus, allowed: readonly TradeCaseStatus[]) {
    super(
      `Trade case cannot transition from "${from}" to "${to}". Allowed: ${
        allowed.length > 0 ? allowed.join(', ') : 'none'
      }.`,
    );
    this.name = 'InvalidTradeCaseTransitionError';
    this.from = from;
    this.to = to;
    this.allowed = allowed;
  }
}

export function isTradeCaseStatus(value: unknown): value is TradeCaseStatus {
  return typeof value === 'string' && TRADE_CASE_STATUS_SET.has(value);
}

export function assertTradeCaseStatus(value: unknown): asserts value is TradeCaseStatus {
  if (!isTradeCaseStatus(value)) throw new InvalidTradeCaseStatusError(String(value));
}

export function isTradeCaseTerminal(status: TradeCaseStatus): boolean {
  return TRADE_CASE_TERMINAL_STATUSES_SET.has(status);
}

export function allowedTradeCaseTransitionsFrom(status: TradeCaseStatus): readonly TradeCaseStatus[] {
  return machine.allowedTransitionsFrom(status);
}

export function canTransitionTradeCase(from: TradeCaseStatus, to: TradeCaseStatus): boolean {
  return machine.canTransition(from, to);
}

export function assertTradeCaseTransition(from: TradeCaseStatus, to: TradeCaseStatus): void {
  if (!machine.canTransition(from, to)) {
    throw new InvalidTradeCaseTransitionError(from, to, machine.allowedTransitionsFrom(from));
  }
}
