import { describe, expect, it } from 'vitest';
import { currentFiscalQuarter } from './fiscal-period';

describe('currentFiscalQuarter', () => {
  it('supports a fiscal year beginning in December', () => {
    const period = currentFiscalQuarter(new Date('2026-08-25T12:00:00Z'), 12);
    expect(period.label).toBe('FY2026 Q3');
    expect(period.start.toISOString()).toBe('2026-06-01T00:00:00.000Z');
    expect(period.end.toISOString()).toBe('2026-08-31T00:00:00.000Z');
  });
});
