import type { HTMLAttributes, ReactNode } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'brand' | 'positive' | 'warning' | 'risk' | 'critical' | 'outline';
  icon?: ReactNode;
  /** Uppercase + letter-spaced, for enum values like OPEN / COMMIT. */
  uppercase?: boolean;
  children?: ReactNode;
}

export function Badge(props: BadgeProps): JSX.Element;
