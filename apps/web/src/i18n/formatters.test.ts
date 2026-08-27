import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, isAppLocale, resolveAppLocale } from './config';
import {
  formatRelativeTime,
  formatSalesCurrency,
  formatSalesDate,
  formatSalesNumber,
} from './formatters';

describe('locale contracts', () => {
  it('accepts only supported locales and defaults the current demo to Spanish', () => {
    expect(DEFAULT_LOCALE).toBe('es');
    expect(isAppLocale('en')).toBe(true);
    expect(isAppLocale('es')).toBe(true);
    expect(isAppLocale('fr')).toBe(false);
  });

  it('resolves a missing or invalid cookie to Spanish and respects explicit preferences', () => {
    expect(resolveAppLocale(undefined)).toBe('es');
    expect(resolveAppLocale('es')).toBe('es');
    expect(resolveAppLocale('en')).toBe('en');
    expect(resolveAppLocale('fr')).toBe('es');
  });

  it('formats compact and full USD amounts for English and Spanish', () => {
    expect(formatSalesCurrency(3_600_000, 'en')).toBe('$3.6M');
    expect(formatSalesCurrency(3_600_000, 'es')).toMatch(/^\$3,6\s?M$/u);
    expect(formatSalesCurrency(390_000, 'en')).toBe('$390,000');
    expect(formatSalesCurrency(390_000, 'es')).toBe('$390.000');
  });

  it('formats numbers, dates and relative time with the selected locale', () => {
    expect(formatSalesNumber(12_345.6, 'en')).toBe('12,345.6');
    expect(formatSalesNumber(12_345.6, 'es')).toBe('12.345,6');
    expect(formatSalesDate('2026-08-27T04:30:00.000Z', 'en')).toBe('8/26/2026');
    expect(formatSalesDate('2026-08-27T04:30:00.000Z', 'es')).toBe('26/8/2026');
    const now = new Date('2026-08-27T12:00:00.000Z');
    expect(formatRelativeTime('2026-08-26T12:00:00.000Z', 'en', now)).toBe('yesterday');
    expect(formatRelativeTime('2026-08-26T12:00:00.000Z', 'es', now)).toBe('ayer');
  });
});
