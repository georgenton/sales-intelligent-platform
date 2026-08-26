import type { HTMLAttributes } from 'react';

export interface SellerPerformanceRow {
  seller: string;
  opportunities: number;
  pipeline: number;
  commit: number;
  quota?: number;
}

export interface SellerPerformanceProps extends HTMLAttributes<HTMLDivElement> {
  sellers: SellerPerformanceRow[];
  currency?: string;
  /** Row click opens the seller's forecast in a contextual panel. */
  onSelect?: (row: SellerPerformanceRow) => void;
}

export function SellerPerformance(props: SellerPerformanceProps): JSX.Element;
