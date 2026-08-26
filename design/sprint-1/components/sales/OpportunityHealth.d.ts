import type { HTMLAttributes } from 'react';

export interface HealthFactor { code: string; impact: number; message: string }

export interface OpportunityHealthProps extends HTMLAttributes<HTMLDivElement> {
  /** 0–100 deterministic score from the API. */
  score: number;
  status?: 'HEALTHY' | 'AT_RISK' | 'CRITICAL';
  /** The explainability payload — show it wherever there is room. */
  factors?: HealthFactor[];
  showFactors?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function OpportunityHealth(props: OpportunityHealthProps): JSX.Element;
