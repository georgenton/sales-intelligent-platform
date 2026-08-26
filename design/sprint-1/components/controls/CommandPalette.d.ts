import type { HTMLAttributes } from 'react';

export interface Command {
  id: string;
  label: string;
  /** Grouping shown right-aligned: Navigate, Create, Review, Copilot. */
  group?: string;
  /** Secondary detail, e.g. the customer name or a shortcut. */
  hint?: string;
}

export interface CommandPaletteProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  commands: Command[];
  onSelect?: (command: Command) => void;
  onClose?: () => void;
  placeholder?: string;
}

export function CommandPalette(props: CommandPaletteProps): JSX.Element | null;
