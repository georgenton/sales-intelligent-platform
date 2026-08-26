import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = the one commercial action per view. onDark = on inverse surfaces (sidebar, Copilot). */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'onDark';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: ReactNode;
  iconAfter?: ReactNode;
  full?: boolean;
  children?: ReactNode;
}

export function Button(props: ButtonProps): JSX.Element;
