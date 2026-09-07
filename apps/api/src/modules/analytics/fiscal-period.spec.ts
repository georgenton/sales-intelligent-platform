import { describe, expect, it } from 'vitest';
import { currentFiscalQuarter } from './fiscal-period';

describe('currentFiscalQuarter', () => {
  it('supports a fiscal year beginning in December', () => {
    const period = currentFiscalQuarter(new Date('2026-08-25T12:00:00Z'), 12);
    expect(period.label).toBe('FY2026 Q3');
    expect(period.start.toISOString()).toBe('2026-06-01T00:00:00.000Z');
    expect(period.end.toISOString()).toBe('2026-08-31T00:00:00.000Z');
  });

  it.each([
    ['2025-12-01T00:00:00Z', 'FY2026 Q1', '2025-12-01', '2026-02-28'],
    ['2026-02-28T23:59:59Z', 'FY2026 Q1', '2025-12-01', '2026-02-28'],
    ['2026-03-01T00:00:00Z', 'FY2026 Q2', '2026-03-01', '2026-05-31'],
    ['2026-05-31T23:59:59Z', 'FY2026 Q2', '2026-03-01', '2026-05-31'],
    ['2026-06-01T00:00:00Z', 'FY2026 Q3', '2026-06-01', '2026-08-31'],
    ['2026-09-01T00:00:00Z', 'FY2026 Q4', '2026-09-01', '2026-11-30'],
    ['2026-11-30T23:59:59Z', 'FY2026 Q4', '2026-09-01', '2026-11-30'],
  ])('maps %s to the approved fiscal quarter', (date, label, start, end) => {
    const period = currentFiscalQuarter(new Date(date), 12);
    expect(period.label).toBe(label);
    expect(period.start.toISOString().slice(0, 10)).toBe(start);
    expect(period.end.toISOString().slice(0, 10)).toBe(end);
  });

  it('uses February 29 for a leap-year Q1 boundary', () => {
    const period = currentFiscalQuarter(new Date('2024-02-29T12:00:00Z'), 12);
    expect(period.label).toBe('FY2024 Q1');
    expect(period.end.toISOString().slice(0, 10)).toBe('2024-02-29');
  });

  it('rejects invalid fiscal start months', () => {
    expect(() => currentFiscalQuarter(new Date(), 0)).toThrow(RangeError);
    expect(() => currentFiscalQuarter(new Date(), 13)).toThrow(RangeError);
  });
});
