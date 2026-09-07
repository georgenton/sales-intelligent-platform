export type CoverageStatus = 'NOT_CONFIGURED' | 'FULFILLED' | 'REQUIRED';

export function commercialMetrics(input: {
  quota: number | null;
  billed: number;
  openForecast: number;
  eligibleOpenPipeline: number;
  weightedEligibleOpenPipeline: number;
}): {
  remainingQuota: number | null;
  projectedRevenue: number;
  projectedGap: number | null;
  billingAttainment: number | null;
  projectedAttainment: number | null;
  pipelineCoverage: number | null;
  weightedCoverage: number | null;
  coverageStatus: CoverageStatus;
} {
  const projectedRevenue = input.billed + input.openForecast;
  if (input.quota === null) {
    return {
      remainingQuota: null,
      projectedRevenue,
      projectedGap: null,
      billingAttainment: null,
      projectedAttainment: null,
      pipelineCoverage: null,
      weightedCoverage: null,
      coverageStatus: 'NOT_CONFIGURED',
    };
  }
  const remainingQuota = Math.max(0, input.quota - input.billed);
  const projectedGap = Math.max(0, input.quota - projectedRevenue);
  const billingAttainment = input.quota > 0 ? (input.billed / input.quota) * 100 : null;
  const projectedAttainment = input.quota > 0 ? (projectedRevenue / input.quota) * 100 : null;
  if (remainingQuota === 0) {
    return {
      remainingQuota,
      projectedRevenue,
      projectedGap,
      billingAttainment,
      projectedAttainment,
      pipelineCoverage: null,
      weightedCoverage: null,
      coverageStatus: 'FULFILLED',
    };
  }
  return {
    remainingQuota,
    projectedRevenue,
    projectedGap,
    billingAttainment,
    projectedAttainment,
    pipelineCoverage: input.eligibleOpenPipeline / remainingQuota,
    weightedCoverage: input.weightedEligibleOpenPipeline / remainingQuota,
    coverageStatus: 'REQUIRED',
  };
}
