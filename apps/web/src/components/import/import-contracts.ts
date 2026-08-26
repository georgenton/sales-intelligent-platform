export const IMPORT_FIELDS = [
  'Ignore',
  'Opportunity',
  'Customer',
  'Stage',
  'Amount',
  'Expected close',
  'Brand',
  'Seller',
  'Forecast category',
  'PO number',
  'Description',
] as const;

export type ImportField = (typeof IMPORT_FIELDS)[number];

export const REQUIRED_IMPORT_FIELDS: ImportField[] = [
  'Opportunity',
  'Customer',
  'Stage',
  'Amount',
  'Expected close',
  'Brand',
];

export interface MappingSuggestion {
  target: ImportField;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface MappingValidation {
  status: 'PASS' | 'BLOCKED';
  issues: string[];
}

export interface ImportReferenceData {
  customers: Array<{ name: string }>;
  stages: Array<{ name: string; code: string }>;
  brands: Array<{ name: string }>;
  users: Array<{ name: string }>;
}

export interface ImportRowValidation {
  sourceIndex: number;
  rowNumber: number;
  status: 'READY' | 'WARNING' | 'BLOCKED';
  blockingReasons: string[];
  warnings: string[];
  duplicate: boolean;
}

export interface ImportQualitySummary {
  status: 'PASS' | 'WARNING' | 'BLOCKED';
  ready: number;
  warning: number;
  blocked: number;
  duplicates: number;
  rows: ImportRowValidation[];
  importableIndexes: number[];
}

export function canPassImportGate({
  mappingValidation,
  quality,
  blockedRowsAcknowledged,
}: {
  mappingValidation: MappingValidation;
  quality: ImportQualitySummary | null;
  blockedRowsAcknowledged: boolean;
}): boolean {
  return Boolean(
    mappingValidation.status === 'PASS' &&
    quality &&
    quality.importableIndexes.length > 0 &&
    (!quality.blocked || blockedRowsAcknowledged),
  );
}

const normalize = (value: string) => value.trim().toLowerCase();
const normalizeHeader = (value: string) => normalize(value).replace(/[^a-z0-9]/g, '');

const exactHeaders: Partial<Record<string, ImportField>> = {
  opportunity: 'Opportunity',
  customer: 'Customer',
  stage: 'Stage',
  amount: 'Amount',
  expectedclose: 'Expected close',
  brand: 'Brand',
  seller: 'Seller',
  forecastcategory: 'Forecast category',
  ponumber: 'PO number',
  description: 'Description',
};

const synonymHeaders: Array<[RegExp, ImportField]> = [
  [/^(oppty|title|deal)$/, 'Opportunity'],
  [/^(account|client|cliente)$/, 'Customer'],
  [/^etapa$/, 'Stage'],
  [/^(value|monto|revenue)$/, 'Amount'],
  [/^(closedate|expectedclosedate|fechacierre)$/, 'Expected close'],
  [/^marca$/, 'Brand'],
  [/^(owner|vendedor)$/, 'Seller'],
  [/^(forecast|category)$/, 'Forecast category'],
  [/^(po|purchaseorder)$/, 'PO number'],
  [/^(product|item)$/, 'Description'],
];

export function detectImportMapping(header: string): MappingSuggestion {
  const normalized = normalizeHeader(header);
  const exact = exactHeaders[normalized];
  if (exact) return { target: exact, confidence: 'HIGH' };
  const synonym = synonymHeaders.find(([pattern]) => pattern.test(normalized));
  return synonym
    ? { target: synonym[1], confidence: 'MEDIUM' }
    : { target: 'Ignore', confidence: 'LOW' };
}

export function isSupportedOpportunityCsvFileName(fileName: string): boolean {
  return fileName.toLowerCase().endsWith('.csv');
}

export function parseOpportunityCsv(
  value: string,
): { ok: true; headers: string[]; rows: string[][] } | { ok: false; message: string } {
  const parsed: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    const next = value[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) parsed.push(row);
      row = [];
      cell = '';
    } else cell += char;
  }
  if (quoted) return { ok: false, message: 'The CSV contains an unclosed quoted value.' };
  row.push(cell.trim());
  if (row.some(Boolean)) parsed.push(row);

  const headers = (parsed[0] ?? []).map((header, index) =>
    index === 0 ? header.replace(/^\uFEFF/, '').trim() : header.trim(),
  );
  const rows = parsed.slice(1);
  if (!headers.length || headers.some((header) => !header)) {
    return { ok: false, message: 'The CSV must have a non-empty header for every column.' };
  }
  const uniqueHeaders = new Set(headers.map(normalize));
  if (uniqueHeaders.size !== headers.length) {
    return { ok: false, message: 'The CSV contains duplicate column headers.' };
  }
  if (!rows.length) return { ok: false, message: 'The CSV does not contain any data rows.' };
  if (rows.length > 500) {
    return { ok: false, message: 'The CSV exceeds the 500-row limit. Split it before importing.' };
  }
  if (rows.some((dataRow) => dataRow.length > headers.length)) {
    return { ok: false, message: 'At least one CSV row has more values than the header.' };
  }
  return { ok: true, headers, rows };
}

export function validateImportMappings(
  headers: string[],
  mappings: Record<string, ImportField>,
  confirmations: Record<string, boolean>,
): MappingValidation {
  const issues: string[] = [];
  const assigned = headers
    .map((header) => ({ header, target: mappings[header] ?? 'Ignore' }))
    .filter(({ target }) => target !== 'Ignore');

  for (const field of REQUIRED_IMPORT_FIELDS) {
    if (!assigned.some(({ target }) => target === field)) {
      issues.push(`Required destination "${field}" is not mapped.`);
    }
  }
  for (const field of IMPORT_FIELDS.filter((item) => item !== 'Ignore')) {
    const sources = assigned.filter(({ target }) => target === field).map(({ header }) => header);
    if (sources.length > 1) {
      issues.push(`Destination "${field}" is mapped from multiple columns: ${sources.join(', ')}.`);
    }
  }
  for (const { header, target } of assigned) {
    if (!confirmations[header]) issues.push(`Confirm mapping from "${header}" to "${target}".`);
  }
  return { status: issues.length ? 'BLOCKED' : 'PASS', issues };
}

function mappedValue(
  row: string[],
  headers: string[],
  mappings: Record<string, ImportField>,
  field: ImportField,
): string {
  const index = headers.findIndex((header) => mappings[header] === field);
  return index < 0 ? '' : (row[index]?.trim() ?? '');
}

export function validateImportRows({
  headers,
  rows,
  mappings,
  reference,
}: {
  headers: string[];
  rows: string[][];
  mappings: Record<string, ImportField>;
  reference: ImportReferenceData;
}): ImportQualitySummary {
  const customers = new Set(reference.customers.map(({ name }) => normalize(name)));
  const stages = new Set(
    reference.stages.flatMap(({ name, code }) => [normalize(name), normalize(String(code))]),
  );
  const brands = new Set(reference.brands.map(({ name }) => normalize(name)));
  const sellers = new Set(reference.users.map(({ name }) => normalize(name)));
  const signatures = rows.map((row) =>
    REQUIRED_IMPORT_FIELDS.map((field) =>
      normalize(mappedValue(row, headers, mappings, field)),
    ).join('|'),
  );
  const signatureCounts = new Map<string, number>();
  for (const signature of signatures) {
    if (!signature.split('|').every(Boolean)) continue;
    signatureCounts.set(signature, (signatureCounts.get(signature) ?? 0) + 1);
  }

  const rowResults = rows.map<ImportRowValidation>((row, sourceIndex) => {
    const blockingReasons: string[] = [];
    const warnings: string[] = [];
    for (const field of REQUIRED_IMPORT_FIELDS) {
      if (!mappedValue(row, headers, mappings, field)) blockingReasons.push(`Missing ${field}.`);
    }

    const amount = Number(mappedValue(row, headers, mappings, 'Amount').replace(/[$,\s]/g, ''));
    if (!Number.isFinite(amount) || amount <= 0) {
      blockingReasons.push('Amount must be a positive number.');
    }
    const close = mappedValue(row, headers, mappings, 'Expected close');
    if (close && Number.isNaN(new Date(close).getTime())) {
      blockingReasons.push('Expected close must be a valid date.');
    }

    const customer = normalize(mappedValue(row, headers, mappings, 'Customer'));
    const stage = normalize(mappedValue(row, headers, mappings, 'Stage').replace('%', ''));
    const brand = normalize(mappedValue(row, headers, mappings, 'Brand'));
    const seller = normalize(mappedValue(row, headers, mappings, 'Seller'));
    if (customer && !customers.has(customer)) {
      blockingReasons.push('Customer does not match tenant reference data.');
    }
    if (stage && !stages.has(stage)) {
      blockingReasons.push('Stage does not match tenant reference data.');
    }
    if (brand && !brands.has(brand)) {
      blockingReasons.push('Brand does not match tenant reference data.');
    }
    if (seller && !sellers.has(seller)) {
      blockingReasons.push('Seller does not match tenant reference data.');
    }

    const forecastCategory = mappedValue(row, headers, mappings, 'Forecast category')
      .toUpperCase()
      .replaceAll(' ', '_');
    if (
      forecastCategory &&
      !['PIPELINE', 'BEST_CASE', 'COMMIT', 'CLOSED', 'OMITTED'].includes(forecastCategory)
    ) {
      blockingReasons.push('Forecast category is not recognized.');
    }
    if (!seller) warnings.push('Seller is blank; the authenticated user will own the row.');
    if (!forecastCategory) warnings.push('Forecast category is blank; PIPELINE will be used.');
    if (!mappedValue(row, headers, mappings, 'Description')) {
      warnings.push('Description is blank; the opportunity title will be used.');
    }

    const duplicate = (signatureCounts.get(signatures[sourceIndex] ?? '') ?? 0) > 1;
    if (duplicate) blockingReasons.push('Duplicate row detected within this CSV.');
    return {
      sourceIndex,
      rowNumber: sourceIndex + 2,
      status: blockingReasons.length ? 'BLOCKED' : warnings.length ? 'WARNING' : 'READY',
      blockingReasons,
      warnings,
      duplicate,
    };
  });
  const ready = rowResults.filter(({ status }) => status === 'READY').length;
  const warning = rowResults.filter(({ status }) => status === 'WARNING').length;
  const blocked = rowResults.filter(({ status }) => status === 'BLOCKED').length;
  return {
    status: blocked ? 'BLOCKED' : warning ? 'WARNING' : 'PASS',
    ready,
    warning,
    blocked,
    duplicates: rowResults.filter(({ duplicate }) => duplicate).length,
    rows: rowResults,
    importableIndexes: rowResults
      .filter(({ status }) => status !== 'BLOCKED')
      .map(({ sourceIndex }) => sourceIndex),
  };
}
