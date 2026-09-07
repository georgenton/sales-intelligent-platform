import { describe, expect, it } from 'vitest';
import { compareForecastSnapshots } from './snapshot-diff';

const item = (overrides: Partial<Parameters<typeof compareForecastSnapshots>[0][number]> = {}) => ({
  opportunityId: 'opportunity-a',
  status: 'OPEN',
  forecastCategory: 'BEST_CASE',
  estimatedAmount: 100,
  stageId: 'stage-60',
  expectedCloseDate: new Date('2026-10-15T00:00:00Z'),
  expectedBillingDate: new Date('2026-10-30T00:00:00Z'),
  ...overrides,
});

describe('forecast snapshot diff', () => {
  it('detects every Phase 1 movement deterministically', () => {
    const diff = compareForecastSnapshots(
      [
        item({
          estimatedAmount: 130,
          stageId: 'stage-80',
          forecastCategory: 'COMMIT',
          expectedCloseDate: new Date('2026-11-01T00:00:00Z'),
          expectedBillingDate: null,
        }),
        item({ opportunityId: 'opportunity-added', estimatedAmount: 50 }),
      ],
      [item(), item({ opportunityId: 'opportunity-removed', estimatedAmount: 25 })],
    );
    expect(diff.added).toHaveLength(1);
    expect(diff.removed).toHaveLength(1);
    expect(diff.amountChanges[0]?.delta).toBe(30);
    expect(diff.stageChanges).toHaveLength(1);
    expect(diff.categoryChanges).toHaveLength(1);
    expect(diff.expectedCloseChanges).toHaveLength(1);
    expect(diff.billingDateChanges).toHaveLength(1);
    expect(diff.totalForecastDelta).toBe(55);
  });
});
