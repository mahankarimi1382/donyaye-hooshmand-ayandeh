import { describe, expect, it } from 'vitest';
import {
  CurrencyMismatchError,
  InvalidCurrencyError,
  Money,
  MoneyDivisionByZeroError,
  MoneyParseError,
} from '../src';

type DomainError = Error & { code?: string };

function captureError(run: () => unknown): DomainError {
  try {
    run();
  } catch (error) {
    return error as DomainError;
  }
  throw new Error('Expected the call to throw');
}

describe('Money precision', () => {
  it('adds decimal fractions exactly where IEEE-754 drifts', () => {
    const sum = Money.from('0.1', 'USD').add(Money.from('0.2', 'USD'));
    expect(sum.toDecimalString()).toBe('0.3');
    expect(sum.equals(Money.from('0.3', 'USD'))).toBe(true);
  });

  it('carries large values without precision loss', () => {
    const total = Money.from('9999999999999999.99', 'USD').add(Money.from('0.01', 'USD'));
    expect(total.toDecimalString()).toBe('10000000000000000');
  });

  it('subtracts across differing scales exactly', () => {
    const difference = Money.from('1.00', 'USD').sub(Money.from('0.999', 'USD'));
    expect(difference.toDecimalString()).toBe('0.001');
  });

  it('multiplies exactly without rounding', () => {
    expect(Money.from('10.25', 'USD').mul(3).toDecimalString()).toBe('30.75');
    expect(Money.from('10.25', 'USD').mul('1.5').toDecimalString()).toBe('15.375');
    expect(Money.from('10.25', 'USD').mul(-2).toDecimalString()).toBe('-20.5');
    expect(Money.from('0.000001', 'USD').mul('0.000001').toDecimalString()).toBe('0.000000000001');
  });

  it('rounds division to currency decimals with exact tie handling', () => {
    expect(Money.from('100.00', 'USD').div(Money.from('3', 'USD')).toDecimalString()).toBe('33.33');
    expect(Money.from('1', 'USD').div('8').toDecimalString()).toBe('0.12');
    expect(Money.from('1', 'USD').div('8', 'half_up').toDecimalString()).toBe('0.13');
    expect(Money.from('10', 'USD').div(4).toDecimalString()).toBe('2.5');
  });

  it('rejects division by zero', () => {
    const error = captureError(() => Money.from('10', 'USD').div(Money.from('0', 'USD')));
    expect(error).toBeInstanceOf(MoneyDivisionByZeroError);
    expect(error.code).toBe('division_by_zero');
  });
});

describe('Money parsing', () => {
  it('converts numbers through a fixed decimal expansion', () => {
    expect(Money.from(0.1, 'USD').toDecimalString()).toBe('0.1');
    expect(Money.from(1e-5, 'USD').toDecimalString()).toBe('0.00001');
    expect(Money.from(1250.5, 'USD').toDecimalString()).toBe('1250.5');
    expect(Money.from(-0.5, 'USD').toDecimalString()).toBe('-0.5');
  });

  it('rejects malformed amounts', () => {
    for (const bad of ['', '+', '-', '1.', '1e5', '1,000', ' 1.00', 'abc']) {
      const error = captureError(() => Money.from(bad, 'USD'));
      expect(error).toBeInstanceOf(MoneyParseError);
      expect(error.code).toBe('invalid_money_amount');
    }
  });

  it('rejects non-finite numbers', () => {
    expect(() => Money.from(Number.NaN, 'USD')).toThrow(MoneyParseError);
    expect(() => Money.from(Number.POSITIVE_INFINITY, 'USD')).toThrow(MoneyParseError);
    expect(() => Money.from(Number.NEGATIVE_INFINITY, 'USD')).toThrow(MoneyParseError);
  });
});

describe('Money currencies', () => {
  it('maps currency codes to minor-unit digits', () => {
    expect(currencyDecimalsOf('USD')).toBe(2);
    expect(currencyDecimalsOf('AED')).toBe(2);
    expect(currencyDecimalsOf('OMR')).toBe(3);
    expect(currencyDecimalsOf('KWD')).toBe(3);
    expect(currencyDecimalsOf('IRR')).toBe(0);
    expect(currencyDecimalsOf('JPY')).toBe(0);
    expect(currencyDecimalsOf('XYZ')).toBe(2);
  });

  it('keeps three-decimal currencies exact', () => {
    expect(Money.from('1.234', 'OMR').toDecimalString()).toBe('1.234');
    expect(Money.fromMinorUnits(1234, 'OMR').toDecimalString()).toBe('1.234');
  });

  it('treats zero-decimal currencies as whole units', () => {
    const rials = Money.from('1500', 'IRR');
    expect(rialDecimals()).toBe(0);
    expect(rials.toDecimalString()).toBe('1500');
    expect(rials.toMinorUnits()).toBe(1500n);
    expect(Money.fromMinorUnits('2500', 'IRR').toDecimalString()).toBe('2500');
  });

  it('rejects malformed currency codes', () => {
    for (const bad of ['usd', 'USDD', 'US1', '']) {
      const error = captureError(() => Money.from('1', bad));
      expect(error).toBeInstanceOf(InvalidCurrencyError);
      expect(error.code).toBe('invalid_currency');
    }
  });
});

describe('Money rounding', () => {
  it('applies HALF_EVEN on exact ties by default', () => {
    expect(Money.from('2.675', 'USD').round().toDecimalString()).toBe('2.68');
    expect(Money.from('2.665', 'USD').round().toDecimalString()).toBe('2.66');
    expect(Money.from('2.5', 'IRR').round().toDecimalString()).toBe('2');
    expect(Money.from('3.5', 'IRR').round().toDecimalString()).toBe('4');
    expect(Money.from('-2.5', 'IRR').round().toDecimalString()).toBe('-2');
  });

  it('applies HALF_UP on demand', () => {
    expect(Money.from('2.665', 'USD').round('half_up').toDecimalString()).toBe('2.67');
    expect(Money.from('2.675', 'USD').round('half_up').toDecimalString()).toBe('2.68');
    expect(Money.from('-2.5', 'IRR').round('half_up').toDecimalString()).toBe('-3');
  });
});

describe('Money currency guards', () => {
  const dollars = Money.from('10.00', 'USD');
  const euros = Money.from('10.00', 'EUR');

  it('throws on arithmetic between currencies', () => {
    const operations: Array<() => unknown> = [
      () => dollars.add(euros),
      () => dollars.sub(euros),
      () => dollars.compare(euros),
      () => dollars.lessThan(euros),
      () => Money.min(dollars, euros),
      () => Money.max(dollars, euros),
      () => Money.sum([dollars, euros]),
      () => dollars.div(euros),
    ];
    for (const operation of operations) {
      const error = captureError(operation);
      expect(error).toBeInstanceOf(CurrencyMismatchError);
      expect(error.code).toBe('currency_mismatch');
    }
  });

  it('reports false instead of throwing on equals across currencies', () => {
    expect(dollars.equals(euros)).toBe(false);
  });
});

describe('Money minor units', () => {
  it('round-trips minor units', () => {
    expect(Money.from('12.34', 'USD').toMinorUnits()).toBe(1234n);
    expect(Money.fromMinorUnits(1234n, 'USD').equals(Money.from('12.34', 'USD'))).toBe(true);
    expect(Money.fromMinorUnits('-5', 'USD').toDecimalString()).toBe('-0.05');
  });

  it('rounds excess precision when extracting minor units', () => {
    expect(Money.from('0.005', 'USD').toMinorUnits()).toBe(0n);
    expect(Money.from('0.015', 'USD').toMinorUnits()).toBe(2n);
    expect(Money.from('0.004', 'USD').toMinorUnits()).toBe(0n);
  });

  it('rejects fractional minor units', () => {
    expect(() => Money.fromMinorUnits(1.5, 'USD')).toThrow(MoneyParseError);
    expect(() => Money.fromMinorUnits('1.5', 'USD')).toThrow(MoneyParseError);
  });
});

describe('Money aggregations', () => {
  it('sums same-currency amounts exactly', () => {
    const total = Money.sum([
      Money.from('1.10', 'USD'),
      Money.from('2.20', 'USD'),
      Money.from('3.30', 'USD'),
    ]);
    expect(total.toDecimalString()).toBe('6.6');
  });

  it('picks extremes with min and max', () => {
    const low = Money.from('2.00', 'AED');
    const mid = Money.from('5.50', 'AED');
    const high = Money.from('9.25', 'AED');
    expect(Money.min(high, low, mid)).toBe(low);
    expect(Money.max(low, mid, high)).toBe(high);
  });

  it('requires at least one amount', () => {
    expect(() => Money.sum([])).toThrow();
    expect(() => Money.min()).toThrow();
    expect(() => Money.max()).toThrow();
  });
});

describe('Money signs and comparisons', () => {
  it('classifies signs', () => {
    const negative = Money.from('-3.50', 'EUR');
    expect(negative.isNegative()).toBe(true);
    expect(negative.isPositive()).toBe(false);
    expect(Money.zero('EUR').isZero()).toBe(true);
    expect(Money.from('0.001', 'EUR').isPositive()).toBe(true);
  });

  it('compares on scale-normalized values', () => {
    expect(Money.from('1.5', 'USD').equals(Money.from('1.50', 'USD'))).toBe(true);
    expect(Money.from('1.5', 'USD').lessThan(Money.from('1.51', 'USD'))).toBe(true);
    expect(Money.from('1.5', 'USD').lessThanOrEqual(Money.from('1.50', 'USD'))).toBe(true);
    expect(Money.from('2', 'USD').greaterThan(Money.from('1.99', 'USD'))).toBe(true);
    expect(Money.from('2', 'USD').greaterThanOrEqual(Money.from('2.00', 'USD'))).toBe(true);
    expect(Money.from('0.00', 'IRR').isZero()).toBe(true);
  });

  it('negates and takes absolute values', () => {
    const debt = Money.from('-7.25', 'EUR');
    expect(debt.abs().toDecimalString()).toBe('7.25');
    expect(debt.abs().negate().equals(debt)).toBe(true);
  });
});

describe('Money serialization', () => {
  it('serializes to an exact decimal string plus currency', () => {
    const amount = Money.from('12.34', 'USD');
    expect(amount.toJSON()).toEqual({ amount: '12.34', currency: 'USD' });
    const restored = JSON.parse(JSON.stringify(amount)) as { amount: string; currency: string };
    expect(Money.from(restored.amount, restored.currency).equals(amount)).toBe(true);
  });

  it('renders display and debug forms', () => {
    expect(Money.from('12.3', 'USD').format()).toBe('12.30');
    expect(Money.from('12', 'JPY').format()).toBe('12');
    expect(Money.from('12.3', 'USD').toString()).toBe('12.3 USD');
  });

  it('keeps zero canonical', () => {
    expect(Money.zero('USD').toDecimalString()).toBe('0');
    expect(Money.zero('USD').toMinorUnits()).toBe(0n);
  });
});

function currencyDecimalsOf(currency: string): number {
  return Money.zero(currency).decimals;
}

function rialDecimals(): number {
  return Money.zero('IRR').decimals;
}
