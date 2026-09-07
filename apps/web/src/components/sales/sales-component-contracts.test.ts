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
      openForecast: 30_000,
    });

    expect(result).toEqual({
      state: 'AVAILABLE',
      quota: 100_000,
      billed: 40_000,
      openForecast: 30_000,
      billedPct: 40,
      forecastPct: 30,
      projectedPct: 70,
    });
  });

  it('defensively treats a non-positive available quota as not configured', () => {
    expect(
      resolveQuotaProgress({ state: 'AVAILABLE', quota: 0, billed: 0, openForecast: 0 }),
    ).toEqual({
      state: 'NOT_CONFIGURED',
      message: 'Quota is not configured for this period.',
    });
  });

  it('keeps quota failures distinct from valid zero values', () => {
    expect(resolveQuotaProgress({ state: 'ERROR' })).toEqual({
      state: 'ERROR',
      message: 'Quota attainment could not be loaded.',
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
      resolveForecastConfidence({
        state: 'AVAILABLE',
        confidence: 120,
        range: { min: 85, max: 110 },
        alignment: 'ALIGNED',
      }),
    ).toEqual({
      state: 'AVAILABLE',
      confidence: 100,
      range: { min: 85, max: 100 },
      relationship: 'Aligned with seller call',
    });
  });

  it.each([
    ['UNAVAILABLE' as const, 'System confidence is unavailable.'],
    ['ERROR' as const, 'System confidence could not be loaded.'],
  ])('keeps %s confidence distinct from zero percent', (state, message) => {
    expect(resolveForecastConfidence({ state })).toEqual({ state, message });
  });
});
