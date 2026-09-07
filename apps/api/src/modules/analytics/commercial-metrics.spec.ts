import { describe, expect, it } from 'vitest';
import { commercialMetrics } from './commercial-metrics';

describe('commercial dashboard metrics', () => {
  it('uses only eligible current-quarter pipeline over remaining quota', () => {
    expect(
      commercialMetrics({
        quota: 1_000,
        billed: 400,
        openForecast: 300,
        eligibleOpenPipeline: 1_200,
        weightedEligibleOpenPipeline: 600,
      }),
    ).toEqual({
      remainingQuota: 600,
      projectedRevenue: 700,
      projectedGap: 300,
      billingAttainment: 40,
      projectedAttainment: 70,
      pipelineCoverage: 2,
      weightedCoverage: 1,
      coverageStatus: 'REQUIRED',
    });
  });

  it('does not divide by zero or pretend an unconfigured quota is zero', () => {
    expect(
      commercialMetrics({
        quota: 500,
        billed: 600,
        openForecast: 50,
        eligibleOpenPipeline: 0,
        weightedEligibleOpenPipeline: 0,
      }).coverageStatus,
    ).toBe('FULFILLED');
    expect(
      commercialMetrics({
        quota: null,
        billed: 0,
        openForecast: 50,
        eligibleOpenPipeline: 100,
        weightedEligibleOpenPipeline: 20,
      }).coverageStatus,
    ).toBe('NOT_CONFIGURED');
  });

  it('separates remaining quota from the projected commercial gap without premature rounding', () => {
    expect(
      commercialMetrics({
        quota: 3_000_000,
        billed: 1_980_000,
        openForecast: 720_000,
        eligibleOpenPipeline: 1_500_000,
        weightedEligibleOpenPipeline: 900_000,
      }),
    ).toEqual({
      remainingQuota: 1_020_000,
      projectedRevenue: 2_700_000,
      projectedGap: 300_000,
      billingAttainment: 66,
      projectedAttainment: 90,
      pipelineCoverage: 1_500_000 / 1_020_000,
      weightedCoverage: 900_000 / 1_020_000,
      coverageStatus: 'REQUIRED',
    });
  });
});
