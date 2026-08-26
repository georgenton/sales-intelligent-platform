import type { HTMLAttributes } from 'react';

export interface CopilotInsightItem { label: string; value?: string; opportunityId?: string }

export interface CopilotInsightProps extends HTMLAttributes<HTMLDivElement> {
  /** The finding, stated as a fact: "4 meaningful changes since Monday". */
  headline: string;
  detail?: string;
  /** The evidence, revealed on expand. */
  items?: CopilotInsightItem[];
  tone?: 'neutral' | 'risk' | 'positive';
  defaultOpen?: boolean;
  onItemSelect?: (item: CopilotInsightItem) => void;
}

export function CopilotInsight(props: CopilotInsightProps): JSX.Element;
