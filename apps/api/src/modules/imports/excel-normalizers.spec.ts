import { describe, expect, it } from 'vitest';
import { normalizeDate, normalizeMoney, normalizeStage, normalizeText } from './excel-normalizers';

describe('Excel normalizers', () => {
  it('normalizes whitespace, currency and stages', () => {
    expect(normalizeText('  Banco\n ABC  ')).toBe('Banco ABC');
    expect(normalizeMoney('$ 123,450.75')).toBe(123_450.75);
    expect(normalizeStage('90%')).toBe(90);
    expect(normalizeStage('33%')).toBeNull();
  });

  it('supports Spanish months and day-first dates', () => {
    expect(normalizeDate('Agosto', 2026)?.toISOString()).toBe('2026-08-01T00:00:00.000Z');
    expect(normalizeDate('25/08/2026')?.toISOString()).toBe('2026-08-25T00:00:00.000Z');
  });
});
