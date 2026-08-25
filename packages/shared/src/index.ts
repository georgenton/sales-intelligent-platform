export type ForecastHealthStatus = 'HEALTHY' | 'AT_RISK' | 'CRITICAL';

export interface HealthFactor {
  code: string;
  impact: number;
  message: string;
}

export interface ForecastHealth {
  score: number;
  status: ForecastHealthStatus;
  factors: HealthFactor[];
}

export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    requestId: string;
  };
}
