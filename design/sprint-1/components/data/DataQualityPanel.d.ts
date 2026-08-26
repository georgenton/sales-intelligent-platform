import type { HTMLAttributes } from 'react';

export interface DataQualityCounts { ready?: number; warnings?: number; invalid?: number; duplicates?: number }
export interface DataQualityIssue { row: number; severity: 'warning' | 'invalid'; message: string }

export interface DataQualityPanelProps extends HTMLAttributes<HTMLDivElement> {
  counts?: DataQualityCounts;
  /** Row-level detail. Never dump more than 50 — page or filter. */
  issues?: DataQualityIssue[];
  onReview?: () => void;
}

export function DataQualityPanel(props: DataQualityPanelProps): JSX.Element;
