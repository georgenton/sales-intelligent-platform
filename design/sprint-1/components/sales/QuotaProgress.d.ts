import type { HTMLAttributes } from 'react';

export interface QuotaProgressProps extends HTMLAttributes<HTMLDivElement> {
  quota: number;
  /** Cash already invoiced — the solid segment. */
  billed: number;
  /** Weighted or committed pipeline — the translucent segment. */
  forecast: number;
  currency?: string;
  label?: string;
  /** Single-line variant for drawer and list rows. */
  compact?: boolean;
}

export function QuotaProgress(props: QuotaProgressProps): JSX.Element;
