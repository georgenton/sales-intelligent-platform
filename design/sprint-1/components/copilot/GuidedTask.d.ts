import type { HTMLAttributes, ReactNode } from 'react';

export interface GuidedTaskProps extends HTMLAttributes<HTMLElement> {
  step: number;
  total: number;
  title: string;
  /** Why this step matters commercially. Guided Mode is coaching, not a form. */
  why?: string;
  children?: ReactNode;
  primaryLabel?: string;
  onPrimary?: () => void;
  onSkip?: () => void;
  onBack?: () => void;
}

export function GuidedTask(props: GuidedTaskProps): JSX.Element;
