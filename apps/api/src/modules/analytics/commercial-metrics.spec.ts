import { describe, expect, it } from 'vitest';
import { coverageMetrics } from './commercial-metrics';

describe('commercial dashboard metrics', () => {
  it('uses only eligible current-quarter pipeline over remaining quota', () => {
    expect(
      coverageMetrics({
        quota: 1_000,
        billed: 400,
        eligibleOpenPipeline: 1_200,
        weightedEligibleOpenPipeline: 600,
      }),
    ).toEqual({
      remainingQuota: 600,
      pipelineCoverage: 2,
      weightedCoverage: 1,
      coverageStatus: 'REQUIRED',
    });
  });

  it('does not divide by zero or pretend an unconfigured quota is zero', () => {
    expect(
      coverageMetrics({
        quota: 500,
        billed: 600,
        eligibleOpenPipeline: 0,
        weightedEligibleOpenPipeline: 0,
      }).coverageStatus,
    ).toBe('FULFILLED');
    expect(
      coverageMetrics({
        quota: null,
        billed: 0,
        eligibleOpenPipeline: 100,
        weightedEligibleOpenPipeline: 20,
      }).coverageStatus,
    ).toBe('NOT_CONFIGURED');
  });
});
