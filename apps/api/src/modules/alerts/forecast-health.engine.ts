import type { ForecastHealth, HealthFactor } from '@sip/shared';

export interface OpportunityRiskInput {
  amount: number;
  grossProfit: number | null;
  stageProbability: number;
  poNumber: string | null;
  expectedCloseDate: Date;
  expectedBillingDate: Date | null;
  lastStageChangedAt: Date;
  marginThreshold: number;
  now?: Date;
  status?: 'OPEN' | 'WON' | 'LOST' | 'CANCELLED';
  forecastCategory?: 'PIPELINE' | 'BEST_CASE' | 'COMMIT' | 'CLOSED' | 'OMITTED';
  qualificationComplete?: boolean;
  periodStart?: Date;
  periodEnd?: Date;
}

export interface RiskAlert {
  code: string;
  severity: 'WARNING' | 'HIGH' | 'CRITICAL';
  message: string;
}

const DAY = 86_400_000;

export function evaluateOpportunityRisk(input: OpportunityRiskInput): {
  health: ForecastHealth;
  alerts: RiskAlert[];
} {
  const now = input.now ?? new Date();
  const factors: HealthFactor[] = [];
  const alerts: RiskAlert[] = [];
  const daysToClose = Math.ceil((input.expectedCloseDate.getTime() - now.getTime()) / DAY);
  const daysInStage = Math.floor((now.getTime() - input.lastStageChangedAt.getTime()) / DAY);
  const margin =
    input.grossProfit === null || input.amount <= 0
      ? null
      : (input.grossProfit / input.amount) * 100;

  const add = (
    code: string,
    impact: number,
    severity: RiskAlert['severity'],
    message: string,
  ): void => {
    factors.push({ code, impact, message });
    alerts.push({ code, severity, message });
  };

  if (input.amount <= 0) add('MISSING_AMOUNT', -25, 'HIGH', 'Opportunity amount is missing');
  if (input.stageProbability >= 90 && !input.poNumber) {
    add('MISSING_PO', -20, 'CRITICAL', 'Purchase order is required at this stage');
  }
  if (daysToClose >= 0 && daysToClose <= 14 && input.stageProbability < 50) {
    add(
      'LOW_STAGE_NEAR_CLOSE',
      -15,
      'HIGH',
      'Close date is near while the opportunity remains at a low stage',
    );
  }
  if (margin !== null && margin < input.marginThreshold) {
    add(
      'LOW_MARGIN',
      -15,
      'WARNING',
      `Margin is below the ${input.marginThreshold}% tenant threshold`,
    );
  }
  if (input.stageProbability >= 75 && !input.expectedBillingDate) {
    add('MISSING_BILLING_DATE', -10, 'HIGH', 'Expected billing date is required at this stage');
  }
  if (daysInStage > 30)
    add(
      'STAGE_STAGNATION',
      -10,
      'WARNING',
      `Opportunity has remained ${daysInStage} days in stage`,
    );
  if (input.status === 'OPEN' && input.expectedCloseDate < now) {
    add('PAST_CLOSE_DATE', -15, 'HIGH', 'Expected close date is in the past');
  }
  if (
    input.expectedBillingDate &&
    input.expectedBillingDate.getTime() < input.expectedCloseDate.getTime()
  ) {
    add(
      'BILLING_DATE_BEFORE_CLOSE',
      -15,
      'HIGH',
      'Expected billing date is before the expected close date',
    );
  }
  if (
    input.periodStart &&
    input.periodEnd &&
    ['BEST_CASE', 'COMMIT'].includes(input.forecastCategory ?? '') &&
    (input.expectedCloseDate < input.periodStart || input.expectedCloseDate > input.periodEnd)
  ) {
    add(
      'FORECAST_OUTSIDE_CURRENT_QUARTER',
      -10,
      'WARNING',
      'Forecast opportunity closes outside the current fiscal quarter',
    );
  }
  if (input.qualificationComplete === false && input.stageProbability >= 60) {
    add(
      input.forecastCategory === 'COMMIT' ? 'COMMIT_WITHOUT_EVIDENCE' : 'QUALIFICATION_INCOMPLETE',
      -20,
      'HIGH',
      input.forecastCategory === 'COMMIT'
        ? 'Commit lacks required qualification evidence'
        : 'Qualification evidence is incomplete',
    );
  }

  const score = Math.max(
    0,
    factors.reduce((total, factor) => total + factor.impact, 100),
  );
  return {
    health: {
      score,
      status: score < 50 ? 'CRITICAL' : score < 75 ? 'AT_RISK' : 'HEALTHY',
      factors,
    },
    alerts,
  };
}
