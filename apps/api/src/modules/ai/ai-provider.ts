export interface ManagerBriefContext {
  period: string;
  quota: number | null;
  billed: number;
  openForecast: number;
  projectedGap: number | null;
  commit: number;
  backlog: number;
  topRisks: Array<{ title: string; severity: string; message: string }>;
  topOpportunities: Array<{ title: string; amount: number }>;
  sellerSummary: Array<{ seller: string; pipeline: number; commit: number }>;
}

export interface AiProvider {
  generateManagerBrief(context: ManagerBriefContext, locale?: 'en' | 'es'): Promise<string>;
}
