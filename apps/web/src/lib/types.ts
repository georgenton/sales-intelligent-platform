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
    openForecast: number;
    commit: number;
    backlog: number;
    billed: number;
    remainingQuota: number | null;
    projectedRevenue: number;
    projectedGap: number | null;
    projectedAttainment: number | null;
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
    remainingQuota: number | null;
    projectedRevenue: number;
    projectedGap: number | null;
    billingAttainment: number | null;
    projectedAttainment: number | null;
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

export interface ManagerDashboardData {
  generatedAt: string;
  currency: string;
  periods: Array<{ value: 'current' | 'next'; label: string; start: string; end: string }>;
  filters: {
    selected: {
      period: 'current' | 'next';
      brandId: string | null;
      line: string | null;
      sellerId: string | null;
      weekStart: string;
    };
    brands: Array<{ id: string; name: string }>;
    lines: string[];
    sellers: Array<{ id: string; name: string }>;
  };
  period: { label: string; start: string; end: string };
  week: { start: string; end: string; closed: boolean };
  importState: {
    status: 'NO_PUBLISHED_BATCH' | 'PROCESSING' | 'PUBLISHED' | 'PARTIAL' | 'FAILED';
    partial: boolean;
    sourceCutoff: string | null;
    loadedAt: string | null;
    summary: unknown;
  };
  summary: {
    quota: number | null;
    billed: number;
    pipeline: number;
    forecast: number;
    backlog: number;
    forecastAndBacklog: number;
    closeProjection: number;
    compliance: { status: 'PENDING_VALIDATION'; reason: string };
    marginAmount: number;
    marginPercent: number | null;
    marginTarget: number;
  };
  coverage: {
    status: 'NOT_EVALUABLE' | 'SUFFICIENT' | 'INSUFFICIENT';
    baseAmount: number | null;
    requiredPipeline: number | null;
    availablePipeline: number;
    difference: number | null;
    ratio: number;
  };
  brandHierarchy: {
    label: string;
    aliasDecision: string;
    brands: Array<{
      brandId: string;
      brand: string;
      mappingState: string;
      quota: number | null;
      billed: number;
      pipeline: number;
      forecast: number;
      backlog: number;
      forecastAndBacklog: number;
      lines: Array<{
        line: string;
        quota: number | null;
        billed: number;
        pipeline: number;
        forecast: number;
        backlog: number;
        forecastAndBacklog: number;
        opportunityIds: string[];
      }>;
    }>;
  };
  weeklyPipeline: {
    status: 'NO_COMPARISON' | 'AVAILABLE';
    currentCutoff: string | null;
    previousCutoff: string | null;
    previous: number | null;
    current: number | null;
    changeAmount: number | null;
    changePercent: number | null;
    droppedMoreThanTenPercent: boolean;
    movements: Array<{
      opportunityId: string;
      kind:
        | 'ENTERED_PIPELINE'
        | 'LEFT_PIPELINE'
        | 'ADVANCED_TO_FORECAST'
        | 'LOST_OR_CANCELLED'
        | 'AMOUNT_CHANGED';
      delta: number;
    }>;
  };
  stages: Array<{
    stageCode: string;
    count: number;
    amount: number;
    opportunityIds: string[];
  }>;
  visits: Array<{
    id: string;
    sellerId: string;
    seller: string;
    customerId: string;
    customer: string;
    visitedAt: string;
    foundOpportunity: boolean;
    opportunity: { id: string; title: string } | null;
    linkStatus: 'PENDING_LINK' | 'COMPLETE';
  }>;
  sellerPerformance: Array<{
    sellerId: string;
    seller: string;
    opportunities: number;
    pipeline: number;
    forecast: number;
    backlog: number;
    forecastAndBacklog: number;
    visitedCustomers: number;
    visitTarget: number;
    visitStatus: 'CLOSED' | 'IN_PROGRESS';
    grossMarginAmount: number;
    grossMarginPercent: number | null;
  }>;
  stalled: Array<{
    opportunityId: string;
    title: string;
    sellerId: string;
    seller: string;
    stageCode: string;
    startedAt: string;
    daysWithoutProgress: number;
    thresholdDays: number;
    thresholdSource: string;
    amount: number;
  }>;
  salesCycle: { status: 'PENDING_DEFINITION'; reason: string; averageDays: null };
  alerts: Array<{
    id: string;
    code: 'A01' | 'A02' | 'A03' | 'A04' | 'A05' | 'A06' | 'A07';
    group: 'DEALS' | 'SELLERS_BRANDS';
    kind: 'SIGNAL' | 'CONTEXT' | 'MISSING_INFORMATION';
    severity: 'INFO' | 'WARNING' | 'HIGH';
    title: string;
    rule: string;
    cutoff: string | null;
    affectedAmount: number | null;
    opportunityId?: string;
    entity?: { id: string; label: string };
    observed?: unknown;
  }>;
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
