export type QuotaProgressState =
  | { state: 'AVAILABLE'; quota: number; billed: number; forecast: number }
  | {
      state: 'LOADING' | 'NOT_CONFIGURED' | 'UNAVAILABLE' | 'ERROR';
      quota?: never;
      billed?: never;
      forecast?: never;
    };

export type ResolvedQuotaProgress =
  | {
      state: 'AVAILABLE';
      quota: number;
      billed: number;
      forecast: number;
      billedPct: number;
      forecastPct: number;
      projectedPct: number;
    }
  | { state: 'LOADING' | 'NOT_CONFIGURED' | 'UNAVAILABLE' | 'ERROR'; message: string };

export function resolveQuotaProgress(input: QuotaProgressState): ResolvedQuotaProgress {
  if (input.state !== 'AVAILABLE') {
    return {
      state: input.state,
      message:
        input.state === 'LOADING'
          ? 'Loading quota attainment…'
          : input.state === 'NOT_CONFIGURED'
            ? 'Quota is not configured for this period.'
            : input.state === 'ERROR'
              ? 'Quota attainment could not be loaded.'
              : 'Quota attainment is unavailable for this period.',
    };
  }

  if (input.quota <= 0) {
    return {
      state: 'NOT_CONFIGURED',
      message: 'Quota is not configured for this period.',
    };
  }

  const billedPct = Math.min(100, Math.max(0, (input.billed / input.quota) * 100));
  const forecastPct = Math.min(100 - billedPct, Math.max(0, (input.forecast / input.quota) * 100));
  return {
    state: input.state,
    quota: input.quota,
    billed: input.billed,
    forecast: input.forecast,
    billedPct,
    forecastPct,
    projectedPct: Math.max(0, ((input.billed + input.forecast) / input.quota) * 100),
  };
}

export type ForecastConfidenceState =
  | {
      state: 'AVAILABLE';
      confidence: number;
      range: { min: number; max: number };
      alignment: 'ALIGNED' | 'DIVERGES';
    }
  | {
      state: 'LOADING' | 'INSUFFICIENT_DATA' | 'UNAVAILABLE' | 'ERROR';
      confidence?: never;
      alignment?: never;
    };

export type ResolvedForecastConfidence =
  | {
      state: 'AVAILABLE';
      confidence: number;
      range: { min: number; max: number };
      relationship: 'Aligned with seller call' | 'Differs from seller call';
    }
  | {
      state: 'LOADING' | 'INSUFFICIENT_DATA' | 'UNAVAILABLE' | 'ERROR';
      message: string;
    };

export function resolveForecastConfidence(
  input: ForecastConfidenceState,
): ResolvedForecastConfidence {
  if (input.state !== 'AVAILABLE') {
    return {
      state: input.state,
      message:
        input.state === 'LOADING'
          ? 'Loading forecast confidence…'
          : input.state === 'INSUFFICIENT_DATA'
            ? 'System confidence not yet computed. More verified evidence is required.'
            : input.state === 'ERROR'
              ? 'System confidence could not be loaded.'
              : 'System confidence is unavailable.',
    };
  }

  const firstBound = Math.min(100, Math.max(0, input.range.min));
  const secondBound = Math.min(100, Math.max(0, input.range.max));
  return {
    state: input.state,
    confidence: Math.min(100, Math.max(0, input.confidence)),
    range: { min: Math.min(firstBound, secondBound), max: Math.max(firstBound, secondBound) },
    relationship:
      input.alignment === 'ALIGNED' ? 'Aligned with seller call' : 'Differs from seller call',
  };
}
