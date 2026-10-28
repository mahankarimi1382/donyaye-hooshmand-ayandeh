import { describe, expect, it } from 'vitest';
import {
  InvalidTradeCaseTransitionError,
  TRADE_CASE_STATUS_VALUES,
  TRADE_CASE_TERMINAL_STATUSES,
  TRADE_CASE_TRANSITIONS,
  allowedTradeCaseTransitionsFrom,
  assertTradeCaseStatus,
  assertTradeCaseTransition,
  canTransitionTradeCase,
  isTradeCaseStatus,
  isTradeCaseTerminal,
} from '../src';
import type { TradeCaseStatus } from '../src';

type DomainError = Error & { code?: string };

function captureError(run: () => unknown): DomainError {
  try {
    run();
  } catch (error) {
    return error as DomainError;
  }
  throw new Error('Expected the call to throw');
}

describe('Trade case status machine', () => {
  it('declares the four statuses', () => {
    expect(TRADE_CASE_STATUS_VALUES).toEqual(['confirmed', 'in_execution', 'completed', 'cancelled']);
  });

  it('runs the legal chain', () => {
    expect(canTransitionTradeCase('confirmed', 'in_execution')).toBe(true);
    expect(canTransitionTradeCase('in_execution', 'completed')).toBe(true);
    expect(() => assertTradeCaseTransition('confirmed', 'in_execution')).not.toThrow();
    expect(() => assertTradeCaseTransition('in_execution', 'completed')).not.toThrow();
    expect(allowedTradeCaseTransitionsFrom('confirmed')).toEqual(['in_execution', 'cancelled']);
    expect(allowedTradeCaseTransitionsFrom('in_execution')).toEqual(['completed', 'cancelled']);
  });

  it('allows cancellation from confirmed and in_execution', () => {
    expect(canTransitionTradeCase('confirmed', 'cancelled')).toBe(true);
    expect(canTransitionTradeCase('in_execution', 'cancelled')).toBe(true);
    // The reason is a store-level requirement; the machine itself is topological.
    expect(() => assertTradeCaseTransition('in_execution', 'cancelled')).not.toThrow();
    const cancelRules = TRADE_CASE_TRANSITIONS.filter((rule) => rule.to === 'cancelled');
    expect(cancelRules.map((rule) => rule.action)).toEqual(['CANCEL_CASE', 'CANCEL_CASE']);
  });

  it('rejects illegal transitions', () => {
    const illegalPairs: ReadonlyArray<readonly [TradeCaseStatus, TradeCaseStatus]> = [
      ['confirmed', 'completed'],
      ['completed', 'in_execution'],
      ['completed', 'cancelled'],
      ['cancelled', 'confirmed'],
      ['cancelled', 'in_execution'],
    ];
    for (const [from, to] of illegalPairs) {
      expect(canTransitionTradeCase(from, to)).toBe(false);
      const error = captureError(() => assertTradeCaseTransition(from, to));
      expect(error).toBeInstanceOf(InvalidTradeCaseTransitionError);
      expect(error.code).toBe('invalid_trade_case_transition');
      const transitionError = error as InvalidTradeCaseTransitionError;
      expect(transitionError.from).toBe(from);
      expect(transitionError.to).toBe(to);
      expect(transitionError.allowed).toEqual(allowedTradeCaseTransitionsFrom(from));
    }
  });

  it('marks completed and cancelled as terminal', () => {
    expect(TRADE_CASE_TERMINAL_STATUSES).toEqual(['completed', 'cancelled']);
    for (const terminal of TRADE_CASE_TERMINAL_STATUSES) {
      expect(isTradeCaseTerminal(terminal)).toBe(true);
      expect(allowedTradeCaseTransitionsFrom(terminal)).toEqual([]);
      for (const status of TRADE_CASE_STATUS_VALUES) {
        expect(canTransitionTradeCase(terminal, status)).toBe(false);
      }
    }
    expect(isTradeCaseTerminal('confirmed')).toBe(false);
    expect(isTradeCaseTerminal('in_execution')).toBe(false);
  });

  it('guards status values', () => {
    for (const status of TRADE_CASE_STATUS_VALUES) {
      expect(isTradeCaseStatus(status)).toBe(true);
      expect(() => assertTradeCaseStatus(status)).not.toThrow();
    }
    expect(isTradeCaseStatus('pending')).toBe(false);
    expect(isTradeCaseStatus(1)).toBe(false);
  });
});
