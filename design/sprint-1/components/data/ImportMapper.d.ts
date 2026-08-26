import type { HTMLAttributes } from 'react';

export interface ImportMappingRow {
  /** Header exactly as it appears in the workbook, e.g. "OPPTY", "VBM", "Monto". */
  source: string;
  /** Platform field it maps to. Empty string = ignore. */
  target?: string;
  /** 0–100 mapping confidence from the detector. */
  confidence?: number;
}

export interface ImportMapperProps extends HTMLAttributes<HTMLDivElement> {
  rows: ImportMappingRow[];
  /** Available platform fields, e.g. Opportunity, Seller, Customer, Stage, Amount. */
  fields: string[];
  /** Detected saved template name, e.g. "TD Forecast Template". */
  templateName?: string;
  templateConfidence?: number;
  onChange?: (source: string, target: string) => void;
}

export function ImportMapper(props: ImportMapperProps): JSX.Element;
