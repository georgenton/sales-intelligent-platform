import type { HTMLAttributes } from 'react';

export interface PeriodSelectorProps extends HTMLAttributes<HTMLDivElement> {
  /** Fiscal labels, e.g. ['FY26 Q1','FY26 Q2','FY26 Q3']. Fiscal year starts in December for the demo tenant. */
  periods: string[];
  value?: string;
  onChange?: (period: string) => void;
  /** Optional comparison baseline, e.g. "last snapshot". */
  comparison?: string;
}

export function PeriodSelector(props: PeriodSelectorProps): JSX.Element;
