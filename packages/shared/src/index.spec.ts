import { describe, expect, it } from 'vitest';
import type { ForecastHealth } from './index';

describe('shared contracts', () => {
  it('represent explainable forecast health without provider-specific fields', () => {
    const health: ForecastHealth = {
      score: 72,
      status: 'AT_RISK',
      factors: [{ code: 'MISSING_PO', impact: -15, message: 'PO required' }],
    };
    expect(health.factors[0]?.impact).toBe(-15);
  });
});
