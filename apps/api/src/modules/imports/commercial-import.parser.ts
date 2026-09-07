import { createHash } from 'node:crypto';
import path from 'node:path';
import { Readable } from 'node:stream';
import ExcelJS from 'exceljs';
import {
  calculateFinancials,
  defaultForecastCategory,
  defaultOpportunityStatus,
} from '../opportunities/commercial-domain';
import { normalizeDate, normalizeMoney, normalizeStage, normalizeText } from './excel-normalizers';

export interface ImportIssue {
  sheet: string;
  row: number;
  code: string;
  severity: 'WARNING' | 'BLOCKED';
}

export interface OpportunityImportRow {
  sheet: string;
  rowNumber: number;
  title: string;
  sellerEmail: string;
  brand: string;
  customer: string;
  partner: string;
  amount: number;
  grossProfit: number | null;
  grossMarginPercent: number | null;
  stageCode: string;
  status: ReturnType<typeof defaultOpportunityStatus>;
  forecastCategory: ReturnType<typeof defaultForecastCategory>;
  expectedCloseDate: Date;
  expectedBillingDate: Date | null;
  poNumber: string;
  externalReference: string;
}

export interface BillingImportRow {
  sheet: string;
  rowNumber: number;
  brand: string;
  invoiceNumber: string;
  amount: number;
  grossProfit: number | null;
  currency: string;
  billedAt: Date;
  opportunityExternalReference: string | null;
  externalReference: string;
}

export type ImportMappingConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export interface ConfirmedImportMapping {
  sheet: string;
  sourceColumn: string;
  destinationField: string | null;
  confirmed: boolean;
}

export interface CommercialImportContext {
  mappings: ConfirmedImportMapping[];
  asOfDate: Date | null;
}

export interface CommercialImportAnalysis {
  fileType: 'CSV' | 'XLSX';
  sheets: Array<{
    name: string;
    kind: 'OPPORTUNITY' | 'BILLING' | 'OTHER';
    disposition: 'IMPORT' | 'RECOGNIZED_NOT_IMPORTED' | 'UNSUPPORTED';
    rowCount: number;
    sourceHeaders: string[];
    destinations: Array<{ field: string; required: boolean }>;
    suggestedMappings: Array<{
      sourceColumn: string;
      destinationField: string | null;
      confidence: ImportMappingConfidence;
      required: boolean;
    }>;
  }>;
  issues: ImportIssue[];
}

export interface CommercialImportPlan {
  fileType: 'CSV' | 'XLSX';
  sheets: Array<{
    name: string;
    disposition: 'IMPORT' | 'RECOGNIZED_NOT_IMPORTED' | 'UNSUPPORTED';
  }>;
  opportunities: OpportunityImportRow[];
  billing: BillingImportRow[];
  issues: ImportIssue[];
  summary: {
    status: 'READY' | 'WARNING' | 'BLOCKED';
    rowsRead: number;
    ready: number;
    warnings: number;
    blocked: number;
    duplicates: number;
  };
}

const opportunityAliases = {
  title: ['opportunity', 'oppty', 'oportunidad', 'title'],
  sellerEmail: ['seller email', 'email vendedor', 'vendedor email', 'seller'],
  brand: ['brand', 'marca', 'fabricante', 'vendor'],
  customer: ['customer', 'cliente', 'cliente final', 'end customer'],
  partner: ['partner', 'reseller', 'canal'],
  amount: ['amount', 'monto', 'valor', 'revenue usd'],
  grossProfit: ['gross profit', 'gross profit usd', 'gp usd', 'utilidad bruta'],
  grossMarginPercent: ['gm %', 'gp%', 'gross margin %', 'margen %'],
  stage: ['stage', 'sales stage', 'etapa'],
  close: ['expected close', 'closing date', 'fecha cierre', 'closing month'],
  billing: ['expected billing', 'billing date', 'fecha facturación', 'billing month'],
  po: ['po', 'purchase order', 'orden de compra', 'oc'],
  reference: ['id', 'external id', 'opportunity id', 'oppty id'],
} as const;

const billingAliases = {
  brand: ['vendor', 'brand', 'marca', 'fabricante'],
  amount: ['revenue usd', 'revenue', 'facturado usd', 'amount', 'monto'],
  grossProfit: ['gp usd', 'gross profit usd', 'gross profit', 'utilidad bruta'],
  grossMarginPercent: ['gp%', 'gm %', 'gross margin %', 'margen %'],
  invoice: ['invoice', 'invoice number', 'invoice id', 'factura', 'número de factura'],
  date: ['date', 'billing date', 'billed at', 'fecha', 'fecha facturación', 'period'],
  currency: ['currency', 'moneda'],
  opportunityReference: [
    'opportunity external id',
    'opportunity id',
    'oppty id',
    'external opportunity id',
  ],
} as const;

const requiredOpportunityFields = [
  'title',
  'sellerEmail',
  'brand',
  'customer',
  'amount',
  'stage',
  'close',
] as const;
const requiredBillingFields = ['brand', 'amount'] as const;

function cellValue(value: ExcelJS.CellValue): unknown {
  if (value && typeof value === 'object' && 'result' in value) return value.result;
  if (value && typeof value === 'object' && 'text' in value) return value.text;
  return value;
}

function sourceHeadersFor(sheet: ExcelJS.Worksheet): string[] {
  const headers: string[] = [];
  sheet.getRow(1).eachCell({ includeEmpty: true }, (cell) => {
    headers.push(normalizeText(cellValue(cell.value)));
  });
  while (headers.length && !headers.at(-1)) headers.pop();
  return headers;
}

function headersFor(sheet: ExcelJS.Worksheet): Map<string, number> {
  const headers = new Map<string, number>();
  sheet.getRow(1).eachCell((cell, column) => {
    headers.set(normalizeText(cellValue(cell.value)).toLowerCase(), column);
  });
  return headers;
}

function sheetContract(sheet: ExcelJS.Worksheet, fileType: 'CSV' | 'XLSX') {
  const lower = sheet.name.toLowerCase();
  if (fileType === 'CSV' || lower === 'oppty') {
    return {
      kind: 'OPPORTUNITY' as const,
      disposition: 'IMPORT' as const,
      aliases: opportunityAliases,
      required: requiredOpportunityFields as readonly string[],
    };
  }
  if (lower === 'facturado daily') {
    return {
      kind: 'BILLING' as const,
      disposition: 'IMPORT' as const,
      aliases: billingAliases,
      required: requiredBillingFields as readonly string[],
    };
  }
  if (['resumen', 'canales proceso'].includes(lower)) {
    return {
      kind: 'OTHER' as const,
      disposition: 'RECOGNIZED_NOT_IMPORTED' as const,
      aliases: null,
      required: [] as readonly string[],
    };
  }
  return {
    kind: 'OTHER' as const,
    disposition: 'UNSUPPORTED' as const,
    aliases: null,
    required: [] as readonly string[],
  };
}

function suggestedMapping(
  sourceColumn: string,
  aliases: Record<string, readonly string[]>,
  required: readonly string[],
) {
  const normalized = normalizeText(sourceColumn).toLowerCase();
  const matches = Object.entries(aliases).filter(([, names]) => names.includes(normalized));
  const destinationField = matches.length === 1 ? matches[0]![0] : null;
  return {
    sourceColumn,
    destinationField,
    confidence: (destinationField ? 'HIGH' : matches.length > 1 ? 'LOW' : 'NONE') as
      'HIGH' | 'LOW' | 'NONE',
    required: destinationField ? required.includes(destinationField) : false,
  };
}

function mappingColumns<T extends Record<string, readonly string[]>>(
  sheet: ExcelJS.Worksheet,
  aliases: T,
  required: readonly string[],
  context: CommercialImportContext,
  requireBillingDate: boolean,
  plan: CommercialImportPlan,
): Record<keyof T, number | undefined> | null {
  const headers = headersFor(sheet);
  const sourceHeaders = sourceHeadersFor(sheet);
  const normalizedHeaders = sourceHeaders.map((header) => normalizeText(header).toLowerCase());
  const mappingIssues: string[] = [];
  if (normalizedHeaders.some((header) => !header))
    mappingIssues.push('MAPPING_EMPTY_SOURCE_HEADER');
  if (new Set(normalizedHeaders).size !== normalizedHeaders.length) {
    mappingIssues.push('MAPPING_DUPLICATE_SOURCE_HEADER');
  }

  const validDestinations = new Set(Object.keys(aliases));
  const selected = context.mappings.filter(
    (mapping) => mapping.sheet === sheet.name && mapping.destinationField,
  );
  const selectedSources = new Set<string>();
  const destinations = new Map<string, number>();
  for (const mapping of selected) {
    if (!mapping.confirmed) mappingIssues.push('MAPPING_CONFIRMATION_REQUIRED');
    if (!mapping.destinationField || !validDestinations.has(mapping.destinationField)) {
      mappingIssues.push('MAPPING_DESTINATION_INVALID');
      continue;
    }
    const column = headers.get(normalizeText(mapping.sourceColumn).toLowerCase());
    if (!column) {
      mappingIssues.push('MAPPING_SOURCE_NOT_FOUND');
      continue;
    }
    const normalizedSource = normalizeText(mapping.sourceColumn).toLowerCase();
    if (selectedSources.has(normalizedSource)) {
      mappingIssues.push('MAPPING_DUPLICATE_SOURCE');
      continue;
    }
    selectedSources.add(normalizedSource);
    if (destinations.has(mapping.destinationField)) {
      mappingIssues.push('MAPPING_DUPLICATE_DESTINATION');
      continue;
    }
    destinations.set(mapping.destinationField, column);
  }
  for (const field of required) {
    if (!destinations.has(field)) mappingIssues.push(`MAPPING_REQUIRED_${field.toUpperCase()}`);
  }
  if (requireBillingDate && !destinations.has('date') && !context.asOfDate) {
    mappingIssues.push('MAPPING_BILLING_DATE_OR_AS_OF_REQUIRED');
  }
  for (const code of [...new Set(mappingIssues)]) {
    plan.issues.push({ sheet: sheet.name, row: 0, code, severity: 'BLOCKED' });
  }
  if (mappingIssues.length) return null;
  return Object.fromEntries(
    Object.keys(aliases).map((key) => [key, destinations.get(key)]),
  ) as Record<keyof T, number | undefined>;
}

function fingerprint(values: Array<string | number>): string {
  return createHash('sha256').update(values.join('|')).digest('hex').slice(0, 32);
}

function parseOpportunitySheet(
  sheet: ExcelJS.Worksheet,
  plan: CommercialImportPlan,
  context: CommercialImportContext,
): void {
  const columns = mappingColumns(
    sheet,
    opportunityAliases,
    requiredOpportunityFields,
    context,
    false,
    plan,
  );
  if (!columns) return;
  const seen = new Set<string>();
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    plan.summary.rowsRead += 1;
    const value = (key: keyof typeof opportunityAliases): unknown =>
      columns[key] ? cellValue(row.getCell(columns[key]!).value) : undefined;
    const title = normalizeText(value('title'));
    const sellerEmail = normalizeText(value('sellerEmail')).toLowerCase();
    const brand = normalizeText(value('brand'));
    const customer = normalizeText(value('customer'));
    const amount = normalizeMoney(value('amount'));
    const stage = normalizeStage(value('stage'));
    const expectedCloseDate = normalizeDate(value('close'));
    if (
      !title ||
      !sellerEmail ||
      !brand ||
      !customer ||
      amount === null ||
      amount <= 0 ||
      stage === null ||
      !expectedCloseDate
    ) {
      plan.issues.push({
        sheet: sheet.name,
        row: rowNumber,
        code: 'OPPORTUNITY_REQUIRED_FIELD',
        severity: 'BLOCKED',
      });
      return;
    }
    const rawGrossProfit = normalizeMoney(value('grossProfit'));
    const rawMargin = normalizeMoney(normalizeText(value('grossMarginPercent')).replace('%', ''));
    let financials: ReturnType<typeof calculateFinancials>;
    try {
      financials = calculateFinancials({
        estimatedAmount: amount,
        grossProfit: rawGrossProfit,
        grossMarginPercent: rawMargin,
      });
    } catch {
      plan.issues.push({
        sheet: sheet.name,
        row: rowNumber,
        code: 'OPPORTUNITY_FINANCIAL_CONFLICT',
        severity: 'BLOCKED',
      });
      return;
    }
    const suppliedReference = normalizeText(value('reference'));
    const externalReference = `OPPTY-${
      suppliedReference ||
      fingerprint([title, sellerEmail, customer, amount, expectedCloseDate.toISOString()])
    }`;
    if (seen.has(externalReference)) {
      plan.summary.duplicates += 1;
      plan.issues.push({
        sheet: sheet.name,
        row: rowNumber,
        code: 'DUPLICATE_IN_FILE',
        severity: 'WARNING',
      });
      return;
    }
    seen.add(externalReference);
    const stageCode = String(stage);
    if (stageCode === '100') {
      plan.issues.push({
        sheet: sheet.name,
        row: rowNumber,
        code: 'OPPORTUNITY_BILLING_FACT_REQUIRED',
        severity: 'BLOCKED',
      });
      return;
    }
    plan.opportunities.push({
      sheet: sheet.name,
      rowNumber,
      title,
      sellerEmail,
      brand,
      customer,
      partner: normalizeText(value('partner')),
      amount,
      grossProfit: financials.grossProfit,
      grossMarginPercent: financials.grossMarginPercent,
      stageCode,
      status: defaultOpportunityStatus(stageCode),
      forecastCategory: defaultForecastCategory(stageCode),
      expectedCloseDate,
      expectedBillingDate: normalizeDate(value('billing')),
      poNumber: normalizeText(value('po')),
      externalReference,
    });
  });
}

function parseBillingSheet(
  sheet: ExcelJS.Worksheet,
  plan: CommercialImportPlan,
  context: CommercialImportContext,
): void {
  const columns = mappingColumns(sheet, billingAliases, requiredBillingFields, context, true, plan);
  if (!columns) return;
  const seen = new Set<string>();
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    plan.summary.rowsRead += 1;
    const value = (key: keyof typeof billingAliases): unknown =>
      columns[key] ? cellValue(row.getCell(columns[key]!).value) : undefined;
    const brand = normalizeText(value('brand'));
    const amount = normalizeMoney(value('amount'));
    const billedAt = columns.date ? normalizeDate(value('date')) : context.asOfDate;
    if (!brand || amount === null || amount <= 0 || !billedAt) {
      plan.issues.push({
        sheet: sheet.name,
        row: rowNumber,
        code: 'BILLING_REQUIRED_FIELD',
        severity: 'BLOCKED',
      });
      return;
    }
    const rawGrossProfit = normalizeMoney(value('grossProfit'));
    const rawMargin = normalizeMoney(normalizeText(value('grossMarginPercent')).replace('%', ''));
    let financials: ReturnType<typeof calculateFinancials>;
    try {
      financials = calculateFinancials({
        estimatedAmount: amount,
        grossProfit: rawGrossProfit,
        grossMarginPercent: rawMargin,
      });
    } catch {
      plan.issues.push({
        sheet: sheet.name,
        row: rowNumber,
        code: 'BILLING_FINANCIAL_CONFLICT',
        severity: 'BLOCKED',
      });
      return;
    }
    const invoiceNumber = normalizeText(value('invoice'));
    const reference = `BILLING-${
      invoiceNumber ||
      fingerprint([brand, amount, financials.grossProfit ?? '', billedAt.toISOString()])
    }`;
    if (seen.has(reference)) {
      plan.summary.duplicates += 1;
      plan.issues.push({
        sheet: sheet.name,
        row: rowNumber,
        code: 'DUPLICATE_IN_FILE',
        severity: 'WARNING',
      });
      return;
    }
    seen.add(reference);
    plan.billing.push({
      sheet: sheet.name,
      rowNumber,
      brand,
      invoiceNumber,
      amount,
      grossProfit: financials.grossProfit,
      currency: normalizeText(value('currency')).toUpperCase() || 'USD',
      billedAt,
      opportunityExternalReference: normalizeText(value('opportunityReference'))
        ? `OPPTY-${normalizeText(value('opportunityReference')).replace(/^OPPTY-/i, '')}`
        : null,
      externalReference: reference,
    });
  });
}

async function loadCommercialWorkbook(
  fileName: string,
  buffer: Buffer,
): Promise<{ workbook: ExcelJS.Workbook; fileType: 'CSV' | 'XLSX' }> {
  const extension = path.extname(fileName).toLowerCase();
  if (!['.csv', '.xlsx'].includes(extension)) throw new Error('Only .csv and .xlsx are supported');
  const workbook = new ExcelJS.Workbook();
  if (extension === '.csv') await workbook.csv.read(Readable.from(buffer));
  else await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
  if (!workbook.worksheets.length) throw new Error('Workbook has no readable worksheets');
  return { workbook, fileType: extension === '.csv' ? 'CSV' : 'XLSX' };
}

export async function analyzeCommercialWorkbook(
  fileName: string,
  buffer: Buffer,
): Promise<CommercialImportAnalysis> {
  const { workbook, fileType } = await loadCommercialWorkbook(fileName, buffer);
  const analysis: CommercialImportAnalysis = { fileType, sheets: [], issues: [] };
  for (const sheet of workbook.worksheets) {
    const contract = sheetContract(sheet, fileType);
    const sourceHeaders = sourceHeadersFor(sheet);
    const normalizedHeaders = sourceHeaders.map((header) => normalizeText(header).toLowerCase());
    if (normalizedHeaders.some((header) => !header)) {
      analysis.issues.push({
        sheet: sheet.name,
        row: 1,
        code: 'MAPPING_EMPTY_SOURCE_HEADER',
        severity: 'BLOCKED',
      });
    }
    if (new Set(normalizedHeaders).size !== normalizedHeaders.length) {
      analysis.issues.push({
        sheet: sheet.name,
        row: 1,
        code: 'MAPPING_DUPLICATE_SOURCE_HEADER',
        severity: 'BLOCKED',
      });
    }
    if (contract.disposition === 'UNSUPPORTED') {
      analysis.issues.push({
        sheet: sheet.name,
        row: 0,
        code: 'UNSUPPORTED_SHEET',
        severity: 'WARNING',
      });
    }
    analysis.sheets.push({
      name: sheet.name,
      kind: contract.kind,
      disposition: contract.disposition,
      rowCount: Math.max(0, sheet.actualRowCount - 1),
      sourceHeaders,
      destinations: contract.aliases
        ? Object.keys(contract.aliases).map((field) => ({
            field,
            required: contract.required.includes(field),
          }))
        : [],
      suggestedMappings: contract.aliases
        ? sourceHeaders.map((header) =>
            suggestedMapping(header, contract.aliases!, contract.required),
          )
        : [],
    });
  }
  return analysis;
}

export async function parseCommercialWorkbook(
  fileName: string,
  buffer: Buffer,
  context: CommercialImportContext,
): Promise<CommercialImportPlan> {
  const { workbook, fileType } = await loadCommercialWorkbook(fileName, buffer);
  const plan: CommercialImportPlan = {
    fileType,
    sheets: [],
    opportunities: [],
    billing: [],
    issues: [],
    summary: {
      status: 'READY',
      rowsRead: 0,
      ready: 0,
      warnings: 0,
      blocked: 0,
      duplicates: 0,
    },
  };
  for (const sheet of workbook.worksheets) {
    const contract = sheetContract(sheet, fileType);
    if (contract.kind === 'OPPORTUNITY') {
      plan.sheets.push({ name: sheet.name, disposition: 'IMPORT' });
      parseOpportunitySheet(sheet, plan, context);
    } else if (contract.kind === 'BILLING') {
      plan.sheets.push({ name: sheet.name, disposition: 'IMPORT' });
      parseBillingSheet(sheet, plan, context);
    } else if (contract.disposition === 'RECOGNIZED_NOT_IMPORTED') {
      plan.sheets.push({ name: sheet.name, disposition: 'RECOGNIZED_NOT_IMPORTED' });
    } else {
      plan.sheets.push({ name: sheet.name, disposition: 'UNSUPPORTED' });
      plan.issues.push({
        sheet: sheet.name,
        row: 0,
        code: 'UNSUPPORTED_SHEET',
        severity: 'WARNING',
      });
    }
  }
  plan.summary.ready = plan.opportunities.length + plan.billing.length;
  plan.summary.warnings = plan.issues.filter((issue) => issue.severity === 'WARNING').length;
  plan.summary.blocked = plan.issues.filter((issue) => issue.severity === 'BLOCKED').length;
  plan.summary.status =
    plan.summary.ready === 0 && plan.summary.blocked > 0
      ? 'BLOCKED'
      : plan.summary.warnings > 0 || plan.summary.blocked > 0
        ? 'WARNING'
        : 'READY';
  return plan;
}

export function publicImportPlan(plan: CommercialImportPlan) {
  return {
    fileType: plan.fileType,
    sheets: plan.sheets,
    issues: plan.issues,
    summary: plan.summary,
  };
}
