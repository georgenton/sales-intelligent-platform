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
  externalReference: string;
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
  invoice: ['orders', 'order', 'invoice', 'invoice number', 'factura', 'orden'],
  date: ['date', 'billing date', 'billed at', 'fecha', 'fecha facturación', 'period'],
  currency: ['currency', 'moneda'],
} as const;

function cellValue(value: ExcelJS.CellValue): unknown {
  if (value && typeof value === 'object' && 'result' in value) return value.result;
  if (value && typeof value === 'object' && 'text' in value) return value.text;
  return value;
}

function headersFor(sheet: ExcelJS.Worksheet): Map<string, number> {
  const headers = new Map<string, number>();
  sheet.getRow(1).eachCell((cell, column) => {
    headers.set(normalizeText(cellValue(cell.value)).toLowerCase(), column);
  });
  return headers;
}

function findColumn(headers: Map<string, number>, names: readonly string[]): number | undefined {
  return names.map((name) => headers.get(name)).find((value) => value !== undefined);
}

function columnsFor<T extends Record<string, readonly string[]>>(
  headers: Map<string, number>,
  aliases: T,
): Record<keyof T, number | undefined> {
  return Object.fromEntries(
    Object.entries(aliases).map(([key, names]) => [key, findColumn(headers, names)]),
  ) as Record<keyof T, number | undefined>;
}

function fingerprint(values: Array<string | number>): string {
  return createHash('sha256').update(values.join('|')).digest('hex').slice(0, 32);
}

function parseOpportunitySheet(sheet: ExcelJS.Worksheet, plan: CommercialImportPlan): void {
  const columns = columnsFor(headersFor(sheet), opportunityAliases);
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

function parseBillingSheet(sheet: ExcelJS.Worksheet, plan: CommercialImportPlan): void {
  const columns = columnsFor(headersFor(sheet), billingAliases);
  const seen = new Set<string>();
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    plan.summary.rowsRead += 1;
    const value = (key: keyof typeof billingAliases): unknown =>
      columns[key] ? cellValue(row.getCell(columns[key]!).value) : undefined;
    const brand = normalizeText(value('brand'));
    const amount = normalizeMoney(value('amount'));
    const billedAt = normalizeDate(value('date'));
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
      externalReference: reference,
    });
  });
}

export async function parseCommercialWorkbook(
  fileName: string,
  buffer: Buffer,
): Promise<CommercialImportPlan> {
  const extension = path.extname(fileName).toLowerCase();
  if (!['.csv', '.xlsx'].includes(extension)) throw new Error('Only .csv and .xlsx are supported');
  const workbook = new ExcelJS.Workbook();
  if (extension === '.csv') await workbook.csv.read(Readable.from(buffer));
  else await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
  const plan: CommercialImportPlan = {
    fileType: extension === '.csv' ? 'CSV' : 'XLSX',
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
    const lower = sheet.name.toLowerCase();
    if (extension === '.csv' || lower === 'oppty') {
      plan.sheets.push({ name: sheet.name, disposition: 'IMPORT' });
      parseOpportunitySheet(sheet, plan);
    } else if (lower === 'facturado daily') {
      plan.sheets.push({ name: sheet.name, disposition: 'IMPORT' });
      parseBillingSheet(sheet, plan);
    } else if (['resumen', 'canales proceso'].includes(lower)) {
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
  if (!workbook.worksheets.length) throw new Error('Workbook has no readable worksheets');
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
