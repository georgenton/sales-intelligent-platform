import type { HTMLAttributes, ReactNode } from 'react';

export interface DrawerOpportunity {
  title: string;
  customer: string;
  amount: number;
  currency?: string;
  stage: string;
  forecastCategory: string;
  seller: string;
  partner?: string | null;
  brand?: string | null;
  closeDate: string;
  billingDate?: string | null;
  margin?: number | null;
  health?: { score: number; status?: 'HEALTHY' | 'AT_RISK' | 'CRITICAL' };
  alerts?: Array<{ code: string; severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL' }>;
  daysInStage?: number;
  stageBenchmarkDays?: number;
  /** The dated, owned commitment — the most important thing in the drawer. */
  nextStep?: { text: string; date: string; owner: string; overdue?: boolean };
  /** Last meaningful customer-facing touch. `stale` turns it red. */
  lastActivity?: { what: string; when: string; who?: string; stale?: boolean };
  /** Stage evidence answering "why is this Commit?" */
  evidence?: { present?: string[]; missing?: string[]; verdict?: string };
  /** Legacy single-line recommendation. Prefer `nextStep`. */
  nextAction?: string;
  stageHistory?: Array<{ from?: string | null; to: string; by: string; at: string }>;
}

export interface OpportunityDrawerProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  opportunity?: DrawerOpportunity | null;
  onClose?: () => void;
  /** Escalation to the full record page. Offer it, never require it. */
  onOpenFull?: () => void;
  /** Contextual action chips under the header. Strings, or {label, primary}. */
  quickActions?: Array<string | { label: string; primary?: boolean }>;
  onQuickAction?: (label: string) => void;
  /** Extra content appended to the scroll area, e.g. a CopilotInsight. */
  footer?: ReactNode;
}

export function OpportunityDrawer(props: OpportunityDrawerProps): JSX.Element | null;
