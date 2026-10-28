import { describe, expect, it } from 'vitest';

import { dictionaries, getDictionary, getLocaleDirection, isRtlLocale, isSupportedLocale } from '../src';

describe('dictionary access', () => {
  it('returns the requested locale dictionary', () => {
    expect(getDictionary('fa')).toBe(dictionaries.fa);
    expect(getDictionary('en')).toBe(dictionaries.en);
    expect(getDictionary('fa').nav.home).toBe('خانه');
    expect(getDictionary('en').nav.home).toBe('Home');
  });

  it('falls back to the Persian dictionary for unknown or missing locales', () => {
    expect(getDictionary('fr')).toBe(dictionaries.fa);
    expect(getDictionary(undefined)).toBe(dictionaries.fa);
    expect(getDictionary(null)).toBe(dictionaries.fa);
    expect(getDictionary('').nav.home).toBe('خانه');
  });
});

describe('locale support and direction', () => {
  it('recognises only fa and en', () => {
    expect(isSupportedLocale('fa')).toBe(true);
    expect(isSupportedLocale('en')).toBe(true);
    expect(isSupportedLocale('ar')).toBe(false);
    expect(isSupportedLocale(42)).toBe(false);
  });

  it('marks fa as RTL and en as LTR', () => {
    expect(isRtlLocale('fa')).toBe(true);
    expect(isRtlLocale('en')).toBe(false);
    expect(getLocaleDirection('fa')).toBe('rtl');
    expect(getLocaleDirection('en')).toBe('ltr');
  });
});
