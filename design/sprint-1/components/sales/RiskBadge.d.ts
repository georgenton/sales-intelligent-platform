import type { HTMLAttributes } from 'react';

export interface RiskBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  severity?: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  /** Overrides the default word. Keep it under three words. */
  label?: string;
  /** API alert code, e.g. MISSING_PO — humanised to "Missing PO" automatically (acronyms preserved). */
  code?: string;
}

export function RiskBadge(props: RiskBadgeProps): JSX.Element;
