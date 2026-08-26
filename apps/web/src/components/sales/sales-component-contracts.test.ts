import { describe, expect, it } from 'vitest';
import { resolveForecastConfidence, resolveQuotaProgress } from './sales-component-contracts';

describe('decision-safe sales component states', () => {
  it('does not present an unconfigured quota as zero attainment', () => {
    const result = resolveQuotaProgress({ state: 'NOT_CONFIGURED' });

    expect(result).toEqual({
      state: 'NOT_CONFIGURED',
      message: 'Quota is not configured for this period.',
    });
  });

  it('calculates billed, incremental forecast and projected attainment separately', () => {
    const result = resolveQuotaProgress({
      state: 'AVAILABLE',
      quota: 100_000,
      billed: 40_000,
      forecast: 30_000,
    });

    expect(result).toEqual({
      state: 'AVAILABLE',
      quota: 100_000,
      billed: 40_000,
      forecast: 30_000,
      billedPct: 40,
      forecastPct: 30,
      projectedPct: 70,
    });
  });

  it('defensively treats a non-positive available quota as not configured', () => {
    expect(resolveQuotaProgress({ state: 'AVAILABLE', quota: 0, billed: 0, forecast: 0 })).toEqual({
      state: 'NOT_CONFIGURED',
      message: 'Quota is not configured for this period.',
    });
  });

  it('does not fabricate forecast confidence when the backend has no confidence signal', () => {
    expect(resolveForecastConfidence({ state: 'INSUFFICIENT_DATA' })).toEqual({
      state: 'INSUFFICIENT_DATA',
      message: 'System confidence not yet computed. More verified evidence is required.',
    });
  });

  it('clamps a real confidence value and states its relationship to the seller call', () => {
    expect(
      resolveForecastConfidence({ state: 'AVAILABLE', confidence: 120, alignment: 'ALIGNED' }),
    ).toEqual({
      state: 'AVAILABLE',
      confidence: 100,
      relationship: 'Aligned with seller call',
    });
  });
});
