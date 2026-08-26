import type { HTMLAttributes } from 'react';

export interface FilterChip { id: string; label: string; count?: number }

export interface FilterBarProps extends HTMLAttributes<HTMLDivElement> {
  filters: FilterChip[];
  /** Ids of active chips. Filter state belongs in global interaction state. */
  applied?: string[];
  onToggle?: (id: string) => void;
  onClear?: () => void;
  search?: string;
  /** Pass a handler to render the search field; omit to hide it. */
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
}

export function FilterBar(props: FilterBarProps): JSX.Element;
