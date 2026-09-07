import type { ForecastHealth } from '@sip/shared';

export interface DashboardData {
  period: { label: string; start: string; end: string };
  currency: string;
  kpis: {
    quota: number | null;
    quotaConfigured: boolean;
    pipeline: number;
    totalOpenPipeline: number;
    weightedPipeline: number;
    forecast: number;
    commit: number;
    backlog: number;
    billed: number;
    gap: number | null;
    forecastAttainment: number | null;
    billingAttainment: number | null;
    pipelineCoverage: number | null;
    weightedCoverage: number | null;
    coverageStatus: 'NOT_CONFIGURED' | 'FULFILLED' | 'REQUIRED';
    averageMargin: number | null;
    atRisk: number;
  };
  funnel: Array<{
    stage: string;
    stageCode: string;
    probability: number;
    count: number;
    amount: number;
  }>;
  byBrand: Array<{ brandId: string; brand: string; amount: number }>;
  brandPerformance: Array<{
    brandId: string;
    brand: string;
    quota: number | null;
    billed: number;
    pipeline: number;
    forecast: number;
    commit: number;
    backlog: number;
    gap: number | null;
    billingAttainment: number | null;
    forecastAttainment: number | null;
    grossMargin: number | null;
  }>;
  sellerPerformance: Array<{
    seller: string;
    pipeline: number;
    commit: number;
    opportunities: number;
    grossProfit: number;
    grossMargin: number | null;
  }>;
}

export interface AlertData {
  id: string;
  code: string;
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  message: string;
  createdAt: string;
  opportunity: { id: string; title: string } | null;
}

export interface OpportunityData {
  id: string;
  title: string;
  status: string;
  forecastCategory: string;
  currency: string;
  estimatedAmount: number;
  grossProfit: number | null;
  grossMarginPercent: number | null;
  margin: number | null;
  expectedCloseDate: string;
  expectedBillingDate: string | null;
  poNumber: string | null;
  notes: string | null;
  updatedAt: string;
  health: ForecastHealth;
  stage: { id: string; code: string; name: string; probability: number };
  seller: { id: string; name: string };
  manager: { id: string; name: string } | null;
  customer: { id: string; name: string };
  partner: { id: string; name: string } | null;
  lineItems: Array<{
    id: string;
    description: string;
    amount: number;
    cost: number | null;
    brand: { id: string; name: string };
  }>;
  alerts: AlertData[];
  qualificationResponses?: Array<{
    id: string;
    answer: 'YES' | 'NO' | 'UNKNOWN';
    evidence: string | null;
    updatedAt: string;
    criterion: QualificationCriterion;
    updatedBy: { id: string; name: string };
  }>;
  reviewEvents?: ReviewEvent[];
  stageHistory?: Array<{
    id: string;
    reason: string | null;
    changedAt: string;
    fromStage: { name: string; code: string } | null;
    toStage: { name: string; code: string };
    changedBy: { id: string; name: string };
  }>;
  auditTrail?: Array<{
    id: string;
    action: string;
    occurredAt: string;
    metadata: unknown;
    actor: { name: string } | null;
  }>;
}

export interface QualificationCriterion {
  id: string;
  gateCode: string;
  code: string;
  labelEn: string;
  labelEs: string;
  descriptionEn: string | null;
  descriptionEs: string | null;
  required: boolean;
  evidenceRequired: boolean;
  sortOrder: number;
  enabled: boolean;
}

export interface QualificationGate {
  gateCode: string;
  verdict: {
    complete: boolean;
    required: number;
    satisfied: number;
    missing: Array<{ criterionId: string; code: string; reason: 'ANSWER' | 'EVIDENCE' }>;
  };
  criteria: Array<
    QualificationCriterion & {
      response: {
        id: string;
        answer: 'YES' | 'NO' | 'UNKNOWN';
        evidence: string | null;
        updatedBy: { id: string; name: string };
        updatedAt: string;
      } | null;
    }
  >;
}

export interface QualificationData {
  opportunityId: string;
  gates: QualificationGate[];
}

export interface ReviewEvent {
  id: string;
  opportunityId: string;
  type:
    | 'KEEP_COMMIT'
    | 'MOVE_BEST_CASE'
    | 'ASK_SELLER'
    | 'SELLER_RESPONSE'
    | 'MANAGER_NOTE'
    | 'GUIDED_ACTION'
    | 'OVERRIDE_QUALIFICATION';
  body: string | null;
  parentEventId: string | null;
  resolvedAt: string | null;
  createdAt: string;
  opportunity: { id: string; title: string; sellerId: string };
  actor: { id: string; name: string };
  targetUser: { id: string; name: string } | null;
  replies: Array<{
    id: string;
    body: string | null;
    createdAt: string;
    actor: { id: string; name: string };
  }>;
}
