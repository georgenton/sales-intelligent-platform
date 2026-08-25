import type { ForecastHealth } from '@sip/shared';

export interface DashboardData {
  period: { label: string; start: string; end: string };
  currency: string;
  kpis: {
    quota: number;
    pipeline: number;
    weightedPipeline: number;
    forecast: number;
    commit: number;
    backlog: number;
    billed: number;
    gap: number;
    forecastAttainment: number;
    billingAttainment: number;
    pipelineCoverage: number;
    averageMargin: number;
    atRisk: number;
  };
  funnel: Array<{ stage: string; probability: number; count: number; amount: number }>;
  byBrand: Array<{ brand: string; amount: number }>;
  sellerPerformance: Array<{
    seller: string;
    pipeline: number;
    commit: number;
    opportunities: number;
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
  stageHistory?: Array<{
    id: string;
    reason: string | null;
    changedAt: string;
    fromStage: { name: string } | null;
    toStage: { name: string };
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
