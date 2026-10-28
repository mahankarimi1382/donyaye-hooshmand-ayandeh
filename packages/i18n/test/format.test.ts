import { describe, expect, it } from 'vitest';

import { formatDateTime, formatJalaliDate, formatMoney, toFarsiDigits } from '../src';

describe('toFarsiDigits', () => {
  it('converts Latin digits in numbers and strings', () => {
    expect(toFarsiDigits(1405)).toBe('۱۴۰۵');
    expect(toFarsiDigits(0)).toBe('۰');
    expect(toFarsiDigits('RFQ-1405-00001')).toBe('RFQ-۱۴۰۵-۰۰۰۰۱');
    expect(toFarsiDigits('Q-1405-0001 · TC-1405-0002')).toBe('Q-۱۴۰۵-۰۰۰۱ · TC-۱۴۰۵-۰۰۰۲');
  });

  it('leaves non-digit characters untouched', () => {
    expect(toFarsiDigits('CIF Jebel Ali')).toBe('CIF Jebel Ali');
  });
});

describe('formatJalaliDate', () => {
  it('renders a Gregorian ISO date as a Jalali date with Farsi digits', () => {
    expect(formatJalaliDate('2025-08-07', 'fa')).toBe('۱۶ مرداد ۱۴۰۴');
    expect(formatJalaliDate('2026-01-01', 'fa')).toContain('۱۴۰۴');
    expect(formatJalaliDate('2025-08-07', 'fa')).toMatch(/^[۰-۹]+ [آ-ی]+ [۰-۹]+$/);
  });

  it('renders a long Gregorian date for the Latin locale', () => {
    expect(formatJalaliDate('2025-08-07', 'en')).toBe('August 7, 2025');
  });

  it('returns the input untouched when it does not parse', () => {
    expect(formatJalaliDate('not-a-date', 'fa')).toBe('not-a-date');
  });
});

describe('formatDateTime', () => {
  it('combines Jalali date and time for fa', () => {
    expect(formatDateTime('2025-08-07T10:30:00Z', 'fa')).toBe('۱۶ مرداد ۱۴۰۴ ساعت ۱۰:۳۰');
  });

  it('combines Gregorian date and time for en', () => {
    expect(formatDateTime('2025-08-07T10:30:00Z', 'en')).toBe('August 7, 2025 at 10:30 AM');
  });

  it('returns the input untouched when it does not parse', () => {
    expect(formatDateTime('not-a-date', 'en')).toBe('not-a-date');
  });
});

describe('formatMoney', () => {
  it('formats non-IRR currencies with two fraction digits', () => {
    expect(formatMoney('1234.5', 'USD', 'en')).toBe('$1,234.50');
    expect(formatMoney('205250', 'USD', 'en')).toBe('$205,250.00');
  });

  it('formats IRR without fraction digits', () => {
    expect(formatMoney('61420', 'IRR', 'en')).toBe('IRR\u00A061,420');
    const faRial = formatMoney('61420', 'IRR', 'fa');
    expect(faRial).toContain('ریال');
    expect(faRial).toContain('۶۱٬۴۲۰');
    expect(faRial).not.toMatch(/[.,]\d{2}$/);
  });

  it('formats fa money with Farsi digits and decimal separator', () => {
    const euro = formatMoney('99.9', 'EUR', 'fa');
    expect(euro).toContain('۹۹٫۹۰');
    expect(euro).toContain('€');
  });

  it('returns the input when the amount is not a number', () => {
    expect(formatMoney('n/a', 'USD', 'en')).toBe('n/a');
  });
});
