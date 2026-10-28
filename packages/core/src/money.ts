import {
  alignScaledDecimals,
  compareScaledDecimals,
  divideScaledDecimals,
  formatScaledDecimal,
  multiplyScaledDecimals,
  normalizeScaledDecimal,
  parseScaledDecimal,
  roundScaledDecimal,
} from './decimal';
import type { RoundingMode, ScaledDecimal } from './decimal';

export type { RoundingMode } from './decimal';

const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;
const MINOR_UNITS_PATTERN = /^[+-]?\d+$/;
const DEFAULT_CURRENCY_DECIMALS = 2;

// Minor-unit digits per currency; codes outside the table default to 2.
const DECIMALS_BY_CURRENCY: Readonly<Record<string, 0 | 2 | 3>> = {
  USD: 2,
  EUR: 2,
  GBP: 2,
  AED: 2,
  CNY: 2,
  CHF: 2,
  TRY: 2,
  SAR: 2,
  OMR: 3,
  KWD: 3,
  BHD: 3,
  JOD: 3,
  IRR: 0,
  JPY: 0,
  KRW: 0,
  VND: 0,
};

export function currencyDecimals(currency: string): 0 | 2 | 3 {
  if (!CURRENCY_CODE_PATTERN.test(currency)) throw new InvalidCurrencyError(currency);
  return DECIMALS_BY_CURRENCY[currency] ?? DEFAULT_CURRENCY_DECIMALS;
}

export class InvalidCurrencyError extends Error {
  readonly code = 'invalid_currency';
  readonly currency: string;

  constructor(currency: string) {
    super(`Invalid currency code: "${currency}". Expected three uppercase letters.`);
    this.name = 'InvalidCurrencyError';
    this.currency = currency;
  }
}

export class CurrencyMismatchError extends Error {
  readonly code = 'currency_mismatch';

  constructor(left: string, right: string) {
    super(`Currency mismatch: ${left} and ${right} cannot be combined.`);
    this.name = 'CurrencyMismatchError';
  }
}

export class MoneyParseError extends Error {
  readonly code = 'invalid_money_amount';

  constructor(message: string) {
    super(message);
    this.name = 'MoneyParseError';
  }
}

export class MoneyDivisionByZeroError extends Error {
  readonly code = 'division_by_zero';

  constructor() {
    super('Money cannot be divided by zero.');
    this.name = 'MoneyDivisionByZeroError';
  }
}

export interface SerializedMoney {
  amount: string;
  currency: string;
}

// Money is a BigInt scaled integer (digits + scale + sign); IEEE-754 never
// touches a monetary value on this platform.
export class Money {
  private readonly value: ScaledDecimal;
  readonly currency: string;

  constructor(amount: bigint, scale: number, currency: string) {
    if (!CURRENCY_CODE_PATTERN.test(currency)) throw new InvalidCurrencyError(currency);
    if (!Number.isInteger(scale) || scale < 0) throw new MoneyParseError(`Invalid decimal scale: ${scale}`);
    this.value = normalizeScaledDecimal({ digits: amount, scale });
    this.currency = currency;
  }

  static from(amount: string | number | bigint, currency: string): Money {
    const parsed = Money.parseAmount(amount);
    return new Money(parsed.digits, parsed.scale, currency);
  }

  static fromMinorUnits(minor: bigint | number | string, currency: string): Money {
    let digits: bigint;
    if (typeof minor === 'bigint') {
      digits = minor;
    } else if (typeof minor === 'number') {
      if (!Number.isSafeInteger(minor)) {
        throw new MoneyParseError(`Minor units must be a safe integer: ${minor}`);
      }
      digits = BigInt(minor);
    } else if (MINOR_UNITS_PATTERN.test(minor)) {
      digits = BigInt(minor);
    } else {
      throw new MoneyParseError(`Minor units must be an integer: "${minor}"`);
    }
    return new Money(digits, currencyDecimals(currency), currency);
  }

  static zero(currency: string): Money {
    return new Money(0n, currencyDecimals(currency), currency);
  }

  static sum(values: readonly Money[]): Money {
    if (values.length === 0) throw new Error('Money.sum requires at least one amount');
    return values.reduce((total, value) => total.add(value));
  }

  static min(...values: readonly Money[]): Money {
    if (values.length === 0) throw new Error('Money.min requires at least one amount');
    return values.reduce((smallest, value) => (value.compare(smallest) < 0 ? value : smallest));
  }

  static max(...values: readonly Money[]): Money {
    if (values.length === 0) throw new Error('Money.max requires at least one amount');
    return values.reduce((largest, value) => (value.compare(largest) > 0 ? value : largest));
  }

  get decimals(): 0 | 2 | 3 {
    return currencyDecimals(this.currency);
  }

  get scale(): number {
    return this.value.scale;
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    const [left, right] = alignScaledDecimals(this.value, other.value);
    return new Money(left.digits + right.digits, left.scale, this.currency);
  }

  sub(other: Money): Money {
    this.assertSameCurrency(other);
    const [left, right] = alignScaledDecimals(this.value, other.value);
    return new Money(left.digits - right.digits, left.scale, this.currency);
  }

  mul(factor: string | number | bigint): Money {
    const factorValue = Money.parseAmount(factor);
    const product = multiplyScaledDecimals(this.value, factorValue);
    return new Money(product.digits, product.scale, this.currency);
  }

  div(divisor: Money | string | number | bigint, mode: RoundingMode = 'half_even'): Money {
    const divisorValue = divisor instanceof Money ? divisor.value : Money.parseAmount(divisor);
    if (divisor instanceof Money) this.assertSameCurrency(divisor);
    if (divisorValue.digits === 0n) throw new MoneyDivisionByZeroError();
    const quotient = divideScaledDecimals(this.value, divisorValue, this.decimals, mode);
    return new Money(quotient.digits, quotient.scale, this.currency);
  }

  round(mode: RoundingMode = 'half_even'): Money {
    const rounded = roundScaledDecimal(this.value, this.decimals, mode);
    return new Money(rounded.digits, rounded.scale, this.currency);
  }

  abs(): Money {
    const digits = this.value.digits < 0n ? -this.value.digits : this.value.digits;
    return new Money(digits, this.value.scale, this.currency);
  }

  negate(): Money {
    return new Money(-this.value.digits, this.value.scale, this.currency);
  }

  isZero(): boolean {
    return this.value.digits === 0n;
  }

  isPositive(): boolean {
    return this.value.digits > 0n;
  }

  isNegative(): boolean {
    return this.value.digits < 0n;
  }

  // Currency mismatch yields false here; every other comparison throws.
  equals(other: Money): boolean {
    if (!(other instanceof Money)) return false;
    if (other.currency !== this.currency) return false;
    return compareScaledDecimals(this.value, other.value) === 0;
  }

  compare(other: Money): -1 | 0 | 1 {
    this.assertSameCurrency(other);
    return compareScaledDecimals(this.value, other.value);
  }

  lessThan(other: Money): boolean {
    return this.compare(other) < 0;
  }

  lessThanOrEqual(other: Money): boolean {
    return this.compare(other) <= 0;
  }

  greaterThan(other: Money): boolean {
    return this.compare(other) > 0;
  }

  greaterThanOrEqual(other: Money): boolean {
    return this.compare(other) >= 0;
  }

  toMinorUnits(): bigint {
    return roundScaledDecimal(this.value, this.decimals, 'half_even').digits;
  }

  toDecimalString(): string {
    return formatScaledDecimal(this.value);
  }

  format(): string {
    return formatScaledDecimal(roundScaledDecimal(this.value, this.decimals, 'half_even'));
  }

  toString(): string {
    return `${this.toDecimalString()} ${this.currency}`;
  }

  toJSON(): SerializedMoney {
    return { amount: this.toDecimalString(), currency: this.currency };
  }

  private assertSameCurrency(other: Money): void {
    if (!(other instanceof Money) || other.currency !== this.currency) {
      throw new CurrencyMismatchError(this.currency, other instanceof Money ? other.currency : String(other));
    }
  }

  private static parseAmount(amount: string | number | bigint): ScaledDecimal {
    try {
      return parseScaledDecimal(amount);
    } catch (error) {
      throw new MoneyParseError(error instanceof Error ? error.message : 'Malformed money amount');
    }
  }
}
