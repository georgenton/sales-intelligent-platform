import type { ReactNode, SelectHTMLAttributes } from 'react';

export interface SelectOption { value: string; label: string }

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  /** Strings, or {value,label} pairs. */
  options?: Array<string | SelectOption>;
  children?: ReactNode;
}

export function Select(props: SelectProps): JSX.Element;
