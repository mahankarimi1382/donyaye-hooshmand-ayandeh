import { defineStatusMachine } from './state-machine';
import type { StatusTransition } from './state-machine';

export const QUOTE_STATUS_VALUES = [
  'draft',
  'internal_review',
  'approved',
  'sent',
  'revised',
  'accepted',
  'declined',
  'expired',
] as const;

export type QuoteStatus = (typeof QUOTE_STATUS_VALUES)[number];

export const QUOTE_STATUS_SET: ReadonlySet<string> = new Set<string>(QUOTE_STATUS_VALUES);

export const QUOTE_TRANSITIONS: readonly StatusTransition<QuoteStatus>[] = [
  {
    from: 'draft',
    to: 'internal_review',
    action: 'SUBMIT_FOR_APPROVAL',
    description: 'Quote enters management review.',
  },
  {
    from: 'draft',
    to: 'approved',
    action: 'AUTO_APPROVE',
    description: 'Quote below the approval thresholds is approved without review.',
  },
  {
    from: 'draft',
    to: 'sent',
    action: 'DIRECT_DISPATCH',
    description: 'Quote is dispatched directly while below the approval thresholds.',
  },
  {
    from: 'internal_review',
    to: 'approved',
    action: 'APPROVE_QUOTE',
    description: 'Management approves the quote.',
  },
  {
    from: 'internal_review',
    to: 'draft',
    action: 'RETURN_FOR_EDITS',
    description: 'Quote returns to draft; a reason of at least 10 characters is required.',
  },
  {
    from: 'internal_review',
    to: 'declined',
    action: 'DECLINE_INTERNALLY',
    description: 'Management declines the quote before dispatch.',
  },
  {
    from: 'approved',
    to: 'sent',
    action: 'DISPATCH_QUOTE',
    description: 'Approved quote is dispatched and its snapshot is frozen.',
  },
  {
    from: 'sent',
    to: 'accepted',
    action: 'ACCEPT_QUOTE',
    description: 'Buyer accepts the quote.',
  },
  {
    from: 'sent',
    to: 'revised',
    action: 'REVISE_QUOTE',
    description: 'Quote is superseded by a version n + 1 draft; this record is archived.',
  },
  {
    from: 'sent',
    to: 'declined',
    action: 'DECLINE_QUOTE',
    description: 'Buyer declines the quote.',
  },
  {
    from: 'sent',
    to: 'expired',
    action: 'EXPIRE_QUOTE',
    description: 'Validity sweep expires the quote past validUntil.',
  },
];

const machine = defineStatusMachine(QUOTE_STATUS_VALUES, QUOTE_TRANSITIONS);

// revised is not terminal: it marks the record superseded by version + 1 while
// carrying no outgoing transitions of its own.
export const QUOTE_TERMINAL_STATUSES: readonly QuoteStatus[] = ['accepted', 'declined', 'expired'];

export const QUOTE_TERMINAL_STATUSES_SET: ReadonlySet<string> = new Set<string>(QUOTE_TERMINAL_STATUSES);

export class InvalidQuoteStatusError extends Error {
  readonly code = 'invalid_quote_status';
  readonly status: string;

  constructor(status: string) {
    super(`Unknown quote status: "${status}"`);
    this.name = 'InvalidQuoteStatusError';
    this.status = status;
  }
}

export class InvalidQuoteTransitionError extends Error {
  readonly code = 'invalid_quote_transition';
  readonly from: QuoteStatus;
  readonly to: QuoteStatus;
  readonly allowed: readonly QuoteStatus[];

  constructor(from: QuoteStatus, to: QuoteStatus, allowed: readonly QuoteStatus[]) {
    super(
      `Quote cannot transition from "${from}" to "${to}". Allowed: ${
        allowed.length > 0 ? allowed.join(', ') : 'none'
      }.`,
    );
    this.name = 'InvalidQuoteTransitionError';
    this.from = from;
    this.to = to;
    this.allowed = allowed;
  }
}

export function isQuoteStatus(value: unknown): value is QuoteStatus {
  return typeof value === 'string' && QUOTE_STATUS_SET.has(value);
}

export function assertQuoteStatus(value: unknown): asserts value is QuoteStatus {
  if (!isQuoteStatus(value)) throw new InvalidQuoteStatusError(String(value));
}

export function isQuoteTerminal(status: QuoteStatus): boolean {
  return QUOTE_TERMINAL_STATUSES_SET.has(status);
}

export function allowedQuoteTransitionsFrom(status: QuoteStatus): readonly QuoteStatus[] {
  return machine.allowedTransitionsFrom(status);
}

export function canTransitionQuote(from: QuoteStatus, to: QuoteStatus): boolean {
  return machine.canTransition(from, to);
}

export function assertQuoteTransition(from: QuoteStatus, to: QuoteStatus): void {
  if (!machine.canTransition(from, to)) {
    throw new InvalidQuoteTransitionError(from, to, machine.allowedTransitionsFrom(from));
  }
}
