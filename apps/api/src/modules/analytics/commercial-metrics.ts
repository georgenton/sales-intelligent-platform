export type CoverageStatus = 'NOT_CONFIGURED' | 'FULFILLED' | 'REQUIRED';

export function coverageMetrics(input: {
  quota: number | null;
  billed: number;
  eligibleOpenPipeline: number;
  weightedEligibleOpenPipeline: number;
}): {
  remainingQuota: number | null;
  pipelineCoverage: number | null;
  weightedCoverage: number | null;
  coverageStatus: CoverageStatus;
} {
  if (input.quota === null) {
    return {
      remainingQuota: null,
      pipelineCoverage: null,
      weightedCoverage: null,
      coverageStatus: 'NOT_CONFIGURED',
    };
  }
  const remainingQuota = Math.max(0, input.quota - input.billed);
  if (remainingQuota === 0) {
    return {
      remainingQuota,
      pipelineCoverage: null,
      weightedCoverage: null,
      coverageStatus: 'FULFILLED',
    };
  }
  return {
    remainingQuota,
    pipelineCoverage: input.eligibleOpenPipeline / remainingQuota,
    weightedCoverage: input.weightedEligibleOpenPipeline / remainingQuota,
    coverageStatus: 'REQUIRED',
  };
}
