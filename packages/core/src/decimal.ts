export type RoundingMode = 'half_even' | 'half_up';

export interface ScaledDecimal {
  readonly digits: bigint;
  readonly scale: number;
}

export class DecimalParseError extends Error {
  readonly code = 'invalid_decimal';

  constructor(message: string) {
    super(message);
    this.name = 'DecimalParseError';
  }
}

const DECIMAL_STRING_PATTERN = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/;
const MINOR_UNITS_PATTERN = /^[+-]?\d+$/;
const LEADING_SIGN = /^[+-]/;
const TRAILING_FRACTION_ZEROS = /0+$/;

export function pow10(exponent: number): bigint {
  return 10n ** BigInt(exponent);
}

export function normalizeScaledDecimal(value: ScaledDecimal): ScaledDecimal {
  if (value.digits === 0n) return { digits: 0n, scale: 0 };
  let digits = value.digits;
  let scale = value.scale;
  while (scale > 0 && digits % 10n === 0n) {
    digits /= 10n;
    scale -= 1;
  }
  return { digits, scale };
}

function fixedNumberToString(input: number): string {
  const fixed = input.toFixed(10);
  const dot = fixed.indexOf('.');
  if (dot === -1) return fixed;
  const fraction = fixed.slice(dot + 1).replace(TRAILING_FRACTION_ZEROS, '');
  return fraction.length > 0 ? `${fixed.slice(0, dot)}.${fraction}` : fixed.slice(0, dot);
}

export function parseScaledDecimal(input: string | number | bigint): ScaledDecimal {
  if (typeof input === 'bigint') return normalizeScaledDecimal({ digits: input, scale: 0 });
  if (typeof input === 'number') {
    if (!Number.isFinite(input)) throw new DecimalParseError(`Amount is not a finite number: ${input}`);
    return parseDecimalString(fixedNumberToString(input));
  }
  return parseDecimalString(input);
}

function parseDecimalString(input: string): ScaledDecimal {
  if (!DECIMAL_STRING_PATTERN.test(input)) {
    throw new DecimalParseError(`Malformed decimal amount: "${input}"`);
  }
  const negative = input.startsWith('-');
  const unsigned = input.replace(LEADING_SIGN, '');
  const dot = unsigned.indexOf('.');
  const digits = dot === -1
    ? BigInt(unsigned)
    : BigInt(unsigned.slice(0, dot) + unsigned.slice(dot + 1));
  const scale = dot === -1 ? 0 : unsigned.length - dot - 1;
  return normalizeScaledDecimal({ digits: negative ? -digits : digits, scale });
}

export function isIntegerString(input: string): boolean {
  return MINOR_UNITS_PATTERN.test(input);
}

export function alignScaledDecimals(a: ScaledDecimal, b: ScaledDecimal): [ScaledDecimal, ScaledDecimal] {
  const scale = Math.max(a.scale, b.scale);
  return [rescaleUp(a, scale), rescaleUp(b, scale)];
}

export function rescaleUp(value: ScaledDecimal, scale: number): ScaledDecimal {
  if (scale <= value.scale) return value;
  return { digits: value.digits * pow10(scale - value.scale), scale };
}

export function addScaledDecimals(a: ScaledDecimal, b: ScaledDecimal): ScaledDecimal {
  const [left, right] = alignScaledDecimals(a, b);
  return { digits: left.digits + right.digits, scale: left.scale };
}

export function multiplyScaledDecimals(a: ScaledDecimal, b: ScaledDecimal): ScaledDecimal {
  return { digits: a.digits * b.digits, scale: a.scale + b.scale };
}

export function compareScaledDecimals(a: ScaledDecimal, b: ScaledDecimal): -1 | 0 | 1 {
  const [left, right] = alignScaledDecimals(a, b);
  if (left.digits < right.digits) return -1;
  return left.digits > right.digits ? 1 : 0;
}

// Exact remainder comparison: ties resolve without float drift, so HALF_EVEN and
// HALF_UP behave correctly on exact half-way values at any scale.
export function roundDiv(numerator: bigint, denominator: bigint, mode: RoundingMode): bigint {
  const negative = (numerator < 0n) !== (denominator < 0n);
  const unsignedNumerator = numerator < 0n ? -numerator : numerator;
  const unsignedDenominator = denominator < 0n ? -denominator : denominator;
  let quotient = unsignedNumerator / unsignedDenominator;
  const remainder = unsignedNumerator % unsignedDenominator;
  if (remainder > 0n) {
    const doubled = remainder * 2n;
    if (doubled > unsignedDenominator) {
      quotient += 1n;
    } else if (doubled === unsignedDenominator && (mode === 'half_up' || quotient % 2n === 1n)) {
      quotient += 1n;
    }
  }
  return negative ? -quotient : quotient;
}

export function roundScaledDecimal(value: ScaledDecimal, targetScale: number, mode: RoundingMode): ScaledDecimal {
  if (targetScale === value.scale) return value;
  if (targetScale > value.scale) return rescaleUp(value, targetScale);
  return { digits: roundDiv(value.digits, pow10(value.scale - targetScale), mode), scale: targetScale };
}

export function divideScaledDecimals(
  a: ScaledDecimal,
  b: ScaledDecimal,
  targetScale: number,
  mode: RoundingMode,
): ScaledDecimal {
  const shift = b.scale + targetScale - a.scale;
  let numerator = a.digits;
  let denominator = b.digits;
  if (shift >= 0) {
    numerator *= pow10(shift);
  } else {
    denominator *= pow10(-shift);
  }
  return { digits: roundDiv(numerator, denominator, mode), scale: targetScale };
}

export function formatScaledDecimal(value: ScaledDecimal): string {
  const negative = value.digits < 0n;
  let digits = (negative ? -value.digits : value.digits).toString();
  if (value.scale > 0) {
    if (digits.length <= value.scale) digits = digits.padStart(value.scale + 1, '0');
    const dot = digits.length - value.scale;
    const text = `${digits.slice(0, dot)}.${digits.slice(dot)}`;
    return negative ? `-${text}` : text;
  }
  return negative ? `-${digits}` : digits;
}
