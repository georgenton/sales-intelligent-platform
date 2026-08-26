import type { HTMLAttributes, ReactNode } from 'react';

export interface QuotaGapDriver { label: string; amount: number }

export interface QuotaGapProps extends HTMLAttributes<HTMLDivElement> {
  /** Positive = short of quota, negative = above. */
  gap: number;
  currency?: string;
  /** One sentence of plain-language interpretation. This is the point of the component. */
  interpretation?: string;
  /** The two or three opportunities/sellers accounting for most of the gap. */
  drivers?: QuotaGapDriver[];
  action?: ReactNode;
  onAction?: () => void;
}

export function QuotaGap(props: QuotaGapProps): JSX.Element;
