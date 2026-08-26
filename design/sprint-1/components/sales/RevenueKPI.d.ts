import type { HTMLAttributes, ReactNode } from 'react';

export interface RevenueKPIProps extends HTMLAttributes<HTMLDivElement> {
  /** Short uppercase label: Quota, Forecast, Billed, Gap, Pipeline. */
  label: string;
  value: number | string;
  currency?: string;
  format?: 'currency' | 'percent' | 'multiple' | 'raw';
  /** The qualifier that makes the number decidable, e.g. "94.2% attainment". */
  detail?: string;
  /** Signed change vs the previous forecast snapshot. */
  delta?: number;
  deltaLabel?: string;
  icon?: ReactNode;
  tone?: 'default' | 'positive' | 'warning' | 'risk';
  /** Larger 36px value for the one lead metric of a view. */
  hero?: boolean;
}

export function RevenueKPI(props: RevenueKPIProps): JSX.Element;
