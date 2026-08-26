import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** inverse = the dark instrument surface used by Copilot and the manager brief. */
  tone?: 'default' | 'inverse' | 'risk' | 'sunken';
  /** Apply 20px padding directly on the card instead of using CardHeader/CardContent. */
  pad?: boolean;
  children?: ReactNode;
}
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  /** Right-aligned control: link, Button, PeriodSelector. */
  action?: ReactNode;
  children?: ReactNode;
}
export interface CardContentProps extends HTMLAttributes<HTMLDivElement> { children?: ReactNode }

export function Card(props: CardProps): JSX.Element;
export function CardHeader(props: CardHeaderProps): JSX.Element;
export function CardContent(props: CardContentProps): JSX.Element;
