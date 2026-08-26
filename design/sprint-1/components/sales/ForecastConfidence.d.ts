import type { HTMLAttributes } from 'react';

export interface ForecastConfidenceProps extends HTMLAttributes<HTMLDivElement> {
  sellerCategory?: 'PIPELINE' | 'BEST_CASE' | 'COMMIT' | 'CLOSED' | 'OMITTED';
  /** 0–100 system confidence in the seller's call. */
  confidence?: number;
  /** One line explaining the number. Required in Review Mode. */
  rationale?: string;
}

export function ForecastConfidence(props: ForecastConfidenceProps): JSX.Element;
