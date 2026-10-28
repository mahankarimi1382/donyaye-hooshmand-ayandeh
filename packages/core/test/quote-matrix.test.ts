import { describe, expect, it } from 'vitest';
import {
  InvalidQuoteStatusError,
  InvalidQuoteTransitionError,
  QUOTE_STATUS_VALUES,
  QUOTE_TERMINAL_STATUSES,
  QUOTE_TRANSITIONS,
  allowedQuoteTransitionsFrom,
  assertQuoteStatus,
  assertQuoteTransition,
  canTransitionQuote,
  isQuoteStatus,
  isQuoteTerminal,
} from '../src';
import type { QuoteStatus } from '../src';

type DomainError = Error & { code?: string };

function captureError(run: () => unknown): DomainError {
  try {
    run();
  } catch (error) {
    return error as DomainError;
  }
  throw new Error('Expected the call to throw');
}

const LEGAL_PAIRS: ReadonlyArray<readonly [QuoteStatus, QuoteStatus]> = [
  ['draft', 'internal_review'],
  ['draft', 'approved'],
  ['draft', 'sent'],
  ['internal_review', 'approved'],
  ['internal_review', 'draft'],
  ['internal_review', 'declined'],
  ['approved', 'sent'],
  ['sent', 'accepted'],
  ['sent', 'revised'],
  ['sent', 'declined'],
  ['sent', 'expired'],
];

const EXPECTED_ACTIONS: ReadonlyArray<readonly [QuoteStatus, QuoteStatus, string]> = [
  ['draft', 'internal_review', 'SUBMIT_FOR_APPROVAL'],
  ['draft', 'approved', 'AUTO_APPROVE'],
  ['draft', 'sent', 'DIRECT_DISPATCH'],
  ['internal_review', 'approved', 'APPROVE_QUOTE'],
  ['internal_review', 'draft', 'RETURN_FOR_EDITS'],
  ['internal_review', 'declined', 'DECLINE_INTERNALLY'],
  ['approved', 'sent', 'DISPATCH_QUOTE'],
  ['sent', 'accepted', 'ACCEPT_QUOTE'],
  ['sent', 'revised', 'REVISE_QUOTE'],
  ['sent', 'declined', 'DECLINE_QUOTE'],
  ['sent', 'expired', 'EXPIRE_QUOTE'],
];

describe('Quote state machine', () => {
  it('declares exactly the eight documented statuses', () => {
    expect(QUOTE_STATUS_VALUES).toEqual([
      'draft',
      'internal_review',
      'approved',
      'sent',
      'revised',
      'accepted',
      'declined',
      'expired',
    ]);
  });

  it('declares exactly the legal transitions from the table', () => {
    expect(QUOTE_TRANSITIONS).toHaveLength(LEGAL_PAIRS.length);
    const declaredPairs = QUOTE_TRANSITIONS.map((rule) => [rule.from, rule.to] as const);
    for (const [from, to] of LEGAL_PAIRS) {
      expect(declaredPairs).toContainEqual([from, to]);
      expect(canTransitionQuote(from, to)).toBe(true);
      expect(() => assertQuoteTransition(from, to)).not.toThrow();
      expect(allowedQuoteTransitionsFrom(from)).toContain(to);
    }
    for (const [from, to] of declaredPairs) {
      expect(LEGAL_PAIRS).toContainEqual([from, to]);
    }
  });

  it('carries the documented action code on each rule', () => {
    for (const [from, to, action] of EXPECTED_ACTIONS) {
      const rule = QUOTE_TRANSITIONS.find((candidate) => candidate.from === from && candidate.to === to);
      expect(rule?.action).toBe(action);
      expect(rule?.description.length).toBeGreaterThan(0);
    }
  });

  it('lists allowed targets per status', () => {
    expect(allowedQuoteTransitionsFrom('draft')).toEqual(['internal_review', 'approved', 'sent']);
    expect(allowedQuoteTransitionsFrom('internal_review')).toEqual(['approved', 'draft', 'declined']);
    expect(allowedQuoteTransitionsFrom('approved')).toEqual(['sent']);
    expect(allowedQuoteTransitionsFrom('sent')).toEqual(['accepted', 'revised', 'declined', 'expired']);
  });

  it('rejects illegal transitions with the machine error shape', () => {
    const illegalPairs: ReadonlyArray<readonly [QuoteStatus, QuoteStatus]> = [
      ['draft', 'accepted'],
      ['draft', 'declined'],
      ['draft', 'expired'],
      ['internal_review', 'sent'],
      ['approved', 'draft'],
      ['approved', 'accepted'],
      ['sent', 'approved'],
      ['sent', 'draft'],
      ['revised', 'sent'],
      ['accepted', 'declined'],
      ['declined', 'expired'],
    ];
    for (const [from, to] of illegalPairs) {
      expect(canTransitionQuote(from, to)).toBe(false);
      const error = captureError(() => assertQuoteTransition(from, to));
      expect(error).toBeInstanceOf(InvalidQuoteTransitionError);
      expect(error.code).toBe('invalid_quote_transition');
      const transitionError = error as InvalidQuoteTransitionError;
      expect(transitionError.from).toBe(from);
      expect(transitionError.to).toBe(to);
      expect(transitionError.allowed).toEqual(allowedQuoteTransitionsFrom(from));
    }
  });

  it('treats revised as superseded rather than terminal', () => {
    expect(isQuoteTerminal('revised')).toBe(false);
    expect(allowedQuoteTransitionsFrom('revised')).toEqual([]);
    expect(QUOTE_TERMINAL_STATUSES).toEqual(['accepted', 'declined', 'expired']);
  });

  it('gives terminal states no outgoing transitions', () => {
    for (const terminal of QUOTE_TERMINAL_STATUSES) {
      expect(isQuoteTerminal(terminal)).toBe(true);
      for (const status of QUOTE_STATUS_VALUES) {
        expect(canTransitionQuote(terminal, status)).toBe(false);
        expect(() => assertQuoteTransition(terminal, status)).toThrow(InvalidQuoteTransitionError);
      }
    }
  });

  it('guards status values', () => {
    for (const status of QUOTE_STATUS_VALUES) {
      expect(isQuoteStatus(status)).toBe(true);
      expect(() => assertQuoteStatus(status)).not.toThrow();
    }
    expect(isQuoteStatus('sent ')).toBe(false);
    expect(isQuoteStatus(null)).toBe(false);
    const error = captureError(() => assertQuoteStatus('shipping'));
    expect(error).toBeInstanceOf(InvalidQuoteStatusError);
    expect(error.code).toBe('invalid_quote_status');
  });
});
