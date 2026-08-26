import type { InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  /** Error message; also sets aria-invalid and a danger border. */
  error?: string;
  /** Leading glyph — the search pattern in the app header and table toolbars. */
  icon?: ReactNode;
  /** Filled, border-free variant used for the header search field. */
  borderless?: boolean;
}

export function Input(props: InputProps): JSX.Element;
