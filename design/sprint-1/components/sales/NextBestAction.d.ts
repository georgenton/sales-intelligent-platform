import type { HTMLAttributes } from 'react';

export interface NextBestActionProps extends HTMLAttributes<HTMLDivElement> {
  customer: string;
  amount: number;
  currency?: string;
  /** Forecast category shown as context, e.g. "Commit". */
  category?: string;
  /** Why this matters — mandatory in practice. One sentence. */
  risk?: string;
  /** The recommended move, e.g. "Contact customer". */
  suggestion?: string;
  severity?: 'WARNING' | 'HIGH' | 'CRITICAL';
  primaryLabel?: string;
  onPrimary?: () => void;
  /** Opens the opportunity drawer. */
  onOpen?: () => void;
}

export function NextBestAction(props: NextBestActionProps): JSX.Element;
