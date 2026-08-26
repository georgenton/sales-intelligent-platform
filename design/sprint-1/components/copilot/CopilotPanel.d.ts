import type { HTMLAttributes, ReactNode } from 'react';

export interface CopilotMessage { role: 'user' | 'assistant'; text: string }

export interface CopilotPanelProps extends HTMLAttributes<HTMLElement> {
  /** Where the user is: 'Dashboard' | 'Opportunity' | 'Forecast review' | 'Import'. Drives suggestions. */
  context?: string;
  contextLabel?: string;
  /** Context-specific prompts. Never generic small talk. */
  suggestions?: string[];
  /** One or more <CopilotInsight> elements pinned above the conversation. */
  insights?: ReactNode;
  messages?: CopilotMessage[];
  onAsk?: (question: string) => void;
  placeholder?: string;
}

export function CopilotPanel(props: CopilotPanelProps): JSX.Element;
