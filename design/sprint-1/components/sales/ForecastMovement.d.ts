import type { HTMLAttributes } from 'react';

export interface ForecastMovementItem {
  label: string;
  /** Signed change in forecast value. */
  delta: number;
  /** Why it moved: stage change, slip, category change, margin. */
  reason?: string;
  opportunityId?: string;
}

export interface ForecastMovementProps extends HTMLAttributes<HTMLDivElement> {
  /** Reference point, usually the last immutable snapshot. */
  since?: string;
  net?: number;
  currency?: string;
  movements?: ForecastMovementItem[];
  /** Opens the opportunity drawer for the moved deal. */
  onSelect?: (item: ForecastMovementItem) => void;
}

export function ForecastMovement(props: ForecastMovementProps): JSX.Element;
