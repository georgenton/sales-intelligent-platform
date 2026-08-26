import type { SVGProps } from 'react';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  /** Lucide icon name in PascalCase, e.g. "Target", "TriangleAlert". */
  name: string;
  /** Pixel box. 14 in dense tables, 16 default, 18 in nav, 20 in tile headers. */
  size?: number;
  strokeWidth?: number;
  /** Accessible name. Omit for decorative icons — they render aria-hidden. */
  label?: string;
}

export function Icon(props: IconProps): JSX.Element;
