import { ForecastCategory, OpportunityStatus } from '@prisma/client';

export const CANONICAL_STAGE_CODES = ['20', '40', '60', '80', '90', '100'] as const;

const allowedForecastCategories: Record<
  (typeof CANONICAL_STAGE_CODES)[number],
  readonly ForecastCategory[]
> = {
  '20': [ForecastCategory.PIPELINE, ForecastCategory.OMITTED],
  '40': [ForecastCategory.PIPELINE, ForecastCategory.OMITTED],
  '60': [ForecastCategory.PIPELINE, ForecastCategory.BEST_CASE, ForecastCategory.OMITTED],
  '80': [
    ForecastCategory.PIPELINE,
    ForecastCategory.BEST_CASE,
    ForecastCategory.COMMIT,
    ForecastCategory.OMITTED,
  ],
  '90': [ForecastCategory.CLOSED],
  '100': [ForecastCategory.CLOSED],
};

export function isCanonicalStageCode(code: string): code is (typeof CANONICAL_STAGE_CODES)[number] {
  return (CANONICAL_STAGE_CODES as readonly string[]).includes(code);
}

export function defaultForecastCategory(code: string): ForecastCategory {
  switch (code) {
    case '60':
      return ForecastCategory.BEST_CASE;
    case '80':
      return ForecastCategory.COMMIT;
    case '90':
    case '100':
      return ForecastCategory.CLOSED;
    default:
      return ForecastCategory.PIPELINE;
  }
}

export function defaultOpportunityStatus(code: string): OpportunityStatus {
  return code === '90' || code === '100' ? OpportunityStatus.WON : OpportunityStatus.OPEN;
}

export function commercialStateIssue(input: {
  stageCode: string;
  status: OpportunityStatus;
  forecastCategory: ForecastCategory;
}): string | null {
  if (!isCanonicalStageCode(input.stageCode)) return null;
  if (input.status === OpportunityStatus.LOST || input.status === OpportunityStatus.CANCELLED) {
    return null;
  }
  const terminal = input.stageCode === '90' || input.stageCode === '100';
  if (terminal && input.status !== OpportunityStatus.WON) {
    return 'Terminal stages require WON status';
  }
  if (!terminal && input.status === OpportunityStatus.WON) {
    return 'WON status requires stage 90 or 100';
  }
  if (!allowedForecastCategories[input.stageCode].includes(input.forecastCategory)) {
    return `Forecast category ${input.forecastCategory} is incompatible with stage ${input.stageCode}`;
  }
  return null;
}

export function calculateFinancials(input: {
  estimatedAmount: number;
  grossProfit?: number | null;
  grossMarginPercent?: number | null;
}): { grossProfit: number | null; grossMarginPercent: number | null } {
  const { estimatedAmount } = input;
  if (!Number.isFinite(estimatedAmount) || estimatedAmount <= 0) {
    throw new RangeError('Estimated amount must be greater than zero');
  }
  if (
    input.grossMarginPercent !== undefined &&
    input.grossMarginPercent !== null &&
    (!Number.isFinite(input.grossMarginPercent) ||
      input.grossMarginPercent < 0 ||
      input.grossMarginPercent > 100)
  ) {
    throw new RangeError('Gross margin percent must be between 0 and 100');
  }
  if (
    input.grossProfit !== undefined &&
    input.grossProfit !== null &&
    (!Number.isFinite(input.grossProfit) || input.grossProfit < 0)
  ) {
    throw new RangeError('Gross profit cannot be negative');
  }

  const calculatedFromMargin =
    input.grossMarginPercent === undefined || input.grossMarginPercent === null
      ? null
      : Math.round(((estimatedAmount * input.grossMarginPercent) / 100) * 100) / 100;
  if (
    calculatedFromMargin !== null &&
    input.grossProfit !== undefined &&
    input.grossProfit !== null &&
    Math.abs(calculatedFromMargin - input.grossProfit) > 0.01
  ) {
    throw new RangeError('Gross profit and gross margin percent are inconsistent');
  }
  const grossProfit = calculatedFromMargin ?? input.grossProfit ?? null;
  return {
    grossProfit,
    grossMarginPercent:
      grossProfit === null ? null : Math.round((grossProfit / estimatedAmount) * 100 * 100) / 100,
  };
}

export function requiredQualificationGates(stageCode: string): string[] {
  if (stageCode === '60') return ['60'];
  if (stageCode === '80' || stageCode === '90' || stageCode === '100') return ['60', '80'];
  return [];
}
