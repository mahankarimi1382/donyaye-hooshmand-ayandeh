import { describe, expect, it } from 'vitest';
import {
  InvalidRfqStatusError,
  InvalidRfqTransitionError,
  RFQ_STATUS_VALUES,
  RFQ_TERMINAL_STATUSES,
  RFQ_TRANSITIONS,
  allowedRfqTransitionsFrom,
  assertRfqStatus,
  assertRfqTransition,
  canTransitionRfq,
  isRfqStatus,
  isRfqTerminal,
} from '../src';
import type { RfqStatus } from '../src';

type DomainError = Error & { code?: string };

function captureError(run: () => unknown): DomainError {
  try {
    run();
  } catch (error) {
    return error as DomainError;
  }
  throw new Error('Expected the call to throw');
}

const LEGAL_PAIRS: ReadonlyArray<readonly [RfqStatus, RfqStatus]> = [
  ['draft', 'submitted'],
  ['submitted', 'under_review'],
  ['submitted', 'rejected'],
  ['submitted', 'cancelled'],
  ['under_review', 'needs_information'],
  ['under_review', 'qualified'],
  ['under_review', 'rejected'],
  ['under_review', 'cancelled'],
  ['needs_information', 'under_review'],
  ['needs_information', 'expired'],
  ['needs_information', 'cancelled'],
  ['qualified', 'quote_preparation'],
  ['qualified', 'rejected'],
  ['qualified', 'cancelled'],
  ['quote_preparation', 'quoted'],
  ['quote_preparation', 'rejected'],
  ['quote_preparation', 'cancelled'],
  ['quoted', 'accepted'],
  ['quoted', 'quote_preparation'],
  ['quoted', 'rejected'],
  ['quoted', 'expired'],
  ['quoted', 'cancelled'],
];

const EXPECTED_ACTIONS: ReadonlyArray<readonly [RfqStatus, RfqStatus, string]> = [
  ['draft', 'submitted', 'SUBMIT_RFQ'],
  ['submitted', 'under_review', 'ASSIGN_LEAD'],
  ['submitted', 'rejected', 'REJECT_LEAD'],
  ['under_review', 'needs_information', 'REQUEST_INFO'],
  ['under_review', 'qualified', 'QUALIFY_RFQ'],
  ['under_review', 'rejected', 'REJECT_RFQ'],
  ['needs_information', 'under_review', 'PROVIDE_INFO'],
  ['needs_information', 'expired', 'EXPIRE_RFQ'],
  ['qualified', 'quote_preparation', 'START_PRICING'],
  ['quote_preparation', 'quoted', 'DISPATCH_QUOTE'],
  ['quoted', 'accepted', 'ACCEPT_DEAL'],
  ['quoted', 'quote_preparation', 'REQUEST_REVISION'],
  ['quoted', 'expired', 'EXPIRE_RFQ'],
];

describe('RFQ state machine', () => {
  it('declares exactly the eleven documented statuses', () => {
    expect(RFQ_STATUS_VALUES).toEqual([
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
    ]);
  });

  it('declares exactly the legal transitions from the table', () => {
    expect(RFQ_TRANSITIONS).toHaveLength(LEGAL_PAIRS.length);
    const declaredPairs = RFQ_TRANSITIONS.map((rule) => [rule.from, rule.to] as const);
    for (const [from, to] of LEGAL_PAIRS) {
      expect(declaredPairs).toContainEqual([from, to]);
      expect(canTransitionRfq(from, to)).toBe(true);
      expect(() => assertRfqTransition(from, to)).not.toThrow();
      expect(allowedRfqTransitionsFrom(from)).toContain(to);
    }
    for (const [from, to] of declaredPairs) {
      expect(LEGAL_PAIRS).toContainEqual([from, to]);
    }
  });

  it('carries an action code and description on every rule', () => {
    for (const rule of RFQ_TRANSITIONS) {
      expect(rule.action).toMatch(/^[A-Z][A-Z_]*$/);
      expect(rule.description.length).toBeGreaterThan(0);
    }
    for (const [from, to, action] of EXPECTED_ACTIONS) {
      const rule = RFQ_TRANSITIONS.find((candidate) => candidate.from === from && candidate.to === to);
      expect(rule?.action).toBe(action);
    }
  });

  it('lists allowed targets per status', () => {
    expect(allowedRfqTransitionsFrom('draft')).toEqual(['submitted']);
    expect(allowedRfqTransitionsFrom('submitted')).toEqual(['under_review', 'rejected', 'cancelled']);
    expect(allowedRfqTransitionsFrom('quoted')).toEqual([
      'accepted',
      'quote_preparation',
      'rejected',
      'expired',
      'cancelled',
    ]);
  });

  it('rejects illegal transitions with the machine error shape', () => {
    const illegalPairs: ReadonlyArray<readonly [RfqStatus, RfqStatus]> = [
      ['draft', 'under_review'],
      ['draft', 'cancelled'],
      ['submitted', 'qualified'],
      ['submitted', 'expired'],
      ['under_review', 'quoted'],
      ['needs_information', 'qualified'],
      ['qualified', 'quoted'],
      ['quote_preparation', 'accepted'],
      ['quoted', 'under_review'],
      ['accepted', 'cancelled'],
    ];
    for (const [from, to] of illegalPairs) {
      expect(canTransitionRfq(from, to)).toBe(false);
      const error = captureError(() => assertRfqTransition(from, to));
      expect(error).toBeInstanceOf(InvalidRfqTransitionError);
      expect(error.code).toBe('invalid_rfq_transition');
      const transitionError = error as InvalidRfqTransitionError;
      expect(transitionError.from).toBe(from);
      expect(transitionError.to).toBe(to);
      expect(transitionError.allowed).toEqual(allowedRfqTransitionsFrom(from));
    }
  });

  it('gives terminal states no outgoing transitions', () => {
    expect(RFQ_TERMINAL_STATUSES).toEqual(['accepted', 'rejected', 'expired', 'cancelled']);
    for (const terminal of RFQ_TERMINAL_STATUSES) {
      expect(allowedRfqTransitionsFrom(terminal)).toEqual([]);
      expect(isRfqTerminal(terminal)).toBe(true);
      for (const status of RFQ_STATUS_VALUES) {
        expect(canTransitionRfq(terminal, status)).toBe(false);
        expect(() => assertRfqTransition(terminal, status)).toThrow(InvalidRfqTransitionError);
      }
    }
    expect(isRfqTerminal('draft')).toBe(false);
    expect(isRfqTerminal('quoted')).toBe(false);
  });

  it('guards status values', () => {
    for (const status of RFQ_STATUS_VALUES) {
      expect(isRfqStatus(status)).toBe(true);
      expect(() => assertRfqStatus(status)).not.toThrow();
    }
    expect(isRfqStatus('Draft')).toBe(false);
    expect(isRfqStatus('bogus')).toBe(false);
    expect(isRfqStatus(42)).toBe(false);
    const error = captureError(() => assertRfqStatus('bogus'));
    expect(error).toBeInstanceOf(InvalidRfqStatusError);
    expect(error.code).toBe('invalid_rfq_status');
  });
});
