import { describe, expect, it } from 'vitest';
import { evaluateOpportunityRisk } from './forecast-health.engine';

describe('evaluateOpportunityRisk', () => {
  it('returns an explainable critical score for missing PO and low margin', () => {
    const result = evaluateOpportunityRisk({
      amount: 100_000,
      grossProfit: 5_000,
      stageProbability: 90,
      poNumber: null,
      expectedCloseDate: new Date('2026-08-30T00:00:00Z'),
      expectedBillingDate: null,
      lastStageChangedAt: new Date('2026-07-01T00:00:00Z'),
      marginThreshold: 10,
      now: new Date('2026-08-25T00:00:00Z'),
    });

    expect(result.health.score).toBe(45);
    expect(result.health.status).toBe('CRITICAL');
    expect(result.health.factors.map((factor) => factor.code)).toEqual([
      'MISSING_PO',
      'LOW_MARGIN',
      'MISSING_BILLING_DATE',
      'STAGE_STAGNATION',
    ]);
  });

  it('keeps complete, current opportunities healthy', () => {
    const result = evaluateOpportunityRisk({
      amount: 50_000,
      grossProfit: 10_000,
      stageProbability: 75,
      poNumber: 'PO-100',
      expectedCloseDate: new Date('2026-10-15T00:00:00Z'),
      expectedBillingDate: new Date('2026-10-30T00:00:00Z'),
      lastStageChangedAt: new Date('2026-08-20T00:00:00Z'),
      marginThreshold: 10,
      now: new Date('2026-08-25T00:00:00Z'),
    });
    expect(result.health).toEqual({ score: 100, status: 'HEALTHY', factors: [] });
  });
});
