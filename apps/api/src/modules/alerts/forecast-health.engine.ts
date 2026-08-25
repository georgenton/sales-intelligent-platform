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
