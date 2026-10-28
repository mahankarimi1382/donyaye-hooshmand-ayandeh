import { defineStatusMachine } from './state-machine';
import type { StatusTransition } from './state-machine';

export const RFQ_STATUS_VALUES = [
  'draft',
  'submitted',
  'under_review',
  'needs_information',
  'qualified',
  'quote_preparation',
  'quoted',
  'accepted',
  'rejected',
  'expired',
  'cancelled',
] as const;

export type RfqStatus = (typeof RFQ_STATUS_VALUES)[number];

export const RFQ_STATUS_SET: ReadonlySet<string> = new Set<string>(RFQ_STATUS_VALUES);

export const RFQ_TRANSITIONS: readonly StatusTransition<RfqStatus>[] = [
  {
    from: 'draft',
    to: 'submitted',
    action: 'SUBMIT_RFQ',
    description: 'Buyer submits the draft request to the seller.',
  },
  {
    from: 'submitted',
    to: 'under_review',
    action: 'ASSIGN_LEAD',
    description: 'Request is assigned to a sales representative for review.',
  },
  {
    from: 'submitted',
    to: 'rejected',
    action: 'REJECT_LEAD',
    description: 'Request is rejected before review; a reason is required.',
  },
  {
    from: 'submitted',
    to: 'cancelled',
    action: 'CANCEL_RFQ',
    description: 'Buyer withdraws the request before review.',
  },
  {
    from: 'under_review',
    to: 'needs_information',
    action: 'REQUEST_INFO',
    description: 'Reviewer requests information; the question must be at least 20 characters.',
  },
  {
    from: 'under_review',
    to: 'qualified',
    action: 'QUALIFY_RFQ',
    description: 'Request passes qualification.',
  },
  {
    from: 'under_review',
    to: 'rejected',
    action: 'REJECT_RFQ',
    description: 'Request fails review; a reason is required.',
  },
  {
    from: 'under_review',
    to: 'cancelled',
    action: 'CANCEL_RFQ',
    description: 'Request is withdrawn while under review.',
  },
  {
    from: 'needs_information',
    to: 'under_review',
    action: 'PROVIDE_INFO',
    description: 'Buyer answers the outstanding question and review resumes.',
  },
  {
    from: 'needs_information',
    to: 'expired',
    action: 'EXPIRE_RFQ',
    description: 'No answer within the 24 hour SLA; the request expires.',
  },
  {
    from: 'needs_information',
    to: 'cancelled',
    action: 'CANCEL_RFQ',
    description: 'Request is withdrawn while waiting for information.',
  },
  {
    from: 'qualified',
    to: 'quote_preparation',
    action: 'START_PRICING',
    description: 'Qualified request enters quote preparation.',
  },
  {
    from: 'qualified',
    to: 'rejected',
    action: 'REJECT_RFQ',
    description: 'Qualified request is rejected; a reason is required.',
  },
  {
    from: 'qualified',
    to: 'cancelled',
    action: 'CANCEL_RFQ',
    description: 'Request is withdrawn after qualification.',
  },
  {
    from: 'quote_preparation',
    to: 'quoted',
    action: 'DISPATCH_QUOTE',
    description: 'A quote is dispatched for the request.',
  },
  {
    from: 'quote_preparation',
    to: 'rejected',
    action: 'REJECT_RFQ',
    description: 'Request is rejected during pricing; a reason is required.',
  },
  {
    from: 'quote_preparation',
    to: 'cancelled',
    action: 'CANCEL_RFQ',
    description: 'Request is withdrawn during pricing.',
  },
  {
    from: 'quoted',
    to: 'accepted',
    action: 'ACCEPT_DEAL',
    description: 'Buyer accepts the deal.',
  },
  {
    from: 'quoted',
    to: 'quote_preparation',
    action: 'REQUEST_REVISION',
    description: 'Buyer requests a revision; quote preparation reopens.',
  },
  {
    from: 'quoted',
    to: 'rejected',
    action: 'REJECT_RFQ',
    description: 'Buyer declines the quoted offer; a reason is required.',
  },
  {
    from: 'quoted',
    to: 'expired',
    action: 'EXPIRE_RFQ',
    description: 'Quote validity lapses and the request expires.',
  },
  {
    from: 'quoted',
    to: 'cancelled',
    action: 'CANCEL_RFQ',
    description: 'Request is withdrawn after quoting.',
  },
];

const machine = defineStatusMachine(RFQ_STATUS_VALUES, RFQ_TRANSITIONS);

export const RFQ_TERMINAL_STATUSES: readonly RfqStatus[] = machine.terminalStatuses;

export const RFQ_TERMINAL_STATUSES_SET: ReadonlySet<string> = new Set<string>(RFQ_TERMINAL_STATUSES);

export class InvalidRfqStatusError extends Error {
  readonly code = 'invalid_rfq_status';
  readonly status: string;

  constructor(status: string) {
    super(`Unknown RFQ status: "${status}"`);
    this.name = 'InvalidRfqStatusError';
    this.status = status;
  }
}

export class InvalidRfqTransitionError extends Error {
  readonly code = 'invalid_rfq_transition';
  readonly from: RfqStatus;
  readonly to: RfqStatus;
  readonly allowed: readonly RfqStatus[];

  constructor(from: RfqStatus, to: RfqStatus, allowed: readonly RfqStatus[]) {
    super(
      `RFQ cannot transition from "${from}" to "${to}". Allowed: ${
        allowed.length > 0 ? allowed.join(', ') : 'none'
      }.`,
    );
    this.name = 'InvalidRfqTransitionError';
    this.from = from;
    this.to = to;
    this.allowed = allowed;
  }
}

export function isRfqStatus(value: unknown): value is RfqStatus {
  return typeof value === 'string' && RFQ_STATUS_SET.has(value);
}

export function assertRfqStatus(value: unknown): asserts value is RfqStatus {
  if (!isRfqStatus(value)) throw new InvalidRfqStatusError(String(value));
}

export function isRfqTerminal(status: RfqStatus): boolean {
  return RFQ_TERMINAL_STATUSES_SET.has(status);
}

export function allowedRfqTransitionsFrom(status: RfqStatus): readonly RfqStatus[] {
  return machine.allowedTransitionsFrom(status);
}

export function canTransitionRfq(from: RfqStatus, to: RfqStatus): boolean {
  return machine.canTransition(from, to);
}

export function assertRfqTransition(from: RfqStatus, to: RfqStatus): void {
  if (!machine.canTransition(from, to)) {
    throw new InvalidRfqTransitionError(from, to, machine.allowedTransitionsFrom(from));
  }
}
