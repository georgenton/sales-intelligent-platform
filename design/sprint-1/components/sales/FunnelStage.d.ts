import type { HTMLAttributes } from 'react';

export interface FunnelStageProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  /** Pipeline semantic token driving the band colour. */
  token?: 'discovery' | 'qualified' | 'proposal' | 'commit' | 'backlog' | 'billed';
  amount: number;
  count: number;
  /** Band width as a percentage of the funnel mouth — this is what makes it narrow. */
  widthPct?: number;
  /** Count of at-risk opportunities in this stage. */
  atRisk?: number;
  /** Value at risk in this stage — shown above count in the hover card. */
  atRiskAmount?: number;
  avgDaysInStage?: number;
  likelyToSlip?: number;
  /** Historical stage-to-stage conversion. Secondary metric, shown in the tooltip footer. */
  conversion?: number;
  /** Secondary: weighting probability for this stage. */
  probability?: number;
  /** Secondary: average deal size in this stage. */
  avgAmount?: number;
  currency?: string;
  selected?: boolean;
  onSelect?: () => void;
}

export function FunnelStage(props: FunnelStageProps): JSX.Element;
