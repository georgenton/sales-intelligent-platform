import type { HTMLAttributes, ReactNode } from 'react';
import type { FunnelStageProps } from './FunnelStage';

export type FunnelStageDatum = Omit<FunnelStageProps, 'widthPct' | 'selected' | 'onSelect'>;

export interface SalesFunnelProps extends HTMLAttributes<HTMLDivElement> {
  stages: FunnelStageDatum[];
  currency?: string;
  /** Controlled selection. Omit to let the funnel own it. */
  selectedStage?: string | null;
  onSelectStage?: (stage: string | null) => void;
  /** Renders the contextual breakdown under the funnel — opportunity list, seller or brand split. */
  renderDetail?: (stage: FunnelStageDatum | undefined) => ReactNode;
}

export function SalesFunnel(props: SalesFunnelProps): JSX.Element;
