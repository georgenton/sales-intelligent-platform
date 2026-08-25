import { createHash } from 'node:crypto';
import 'dotenv/config';
import path from 'node:path';
import { ForecastCategory, OpportunityStatus, Prisma, PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';
import { normalizeDate, normalizeMoney, normalizeStage, normalizeText } from './excel-normalizers';

interface ImportRow {
  rowNumber: number;
  title: string;
  sellerEmail: string;
  brand: string;
  customer: string;
  partner: string;
  amount: number;
  stage: number;
  expectedCloseDate: Date;
  expectedBillingDate: Date | null;
  poNumber: string;
  externalReference: string;
}

interface Summary {
  rowsRead: number;
  imported: number;
  skipped: number;
  warnings: number;
  errors: number;
  duplicates: number;
}

const aliases = {
  title: ['opportunity', 'oppty', 'oportunidad', 'title'],
  sellerEmail: ['seller email', 'email vendedor', 'vendedor email', 'seller'],
  brand: ['brand', 'marca', 'fabricante'],
  customer: ['customer', 'cliente', 'cliente final', 'end customer'],
  partner: ['partner', 'reseller', 'canal'],
  amount: ['amount', 'monto', 'valor'],
  stage: ['stage', 'sales stage', 'etapa'],
  close: ['expected close', 'closing date', 'fecha cierre', 'closing month'],
  billing: ['expected billing', 'billing date', 'fecha facturación', 'billing month'],
  po: ['po', 'purchase order', 'orden de compra'],
  reference: ['id', 'external id', 'opportunity id', 'oppty id'],
} as const;

const prisma = new PrismaClient();

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function cellValue(value: ExcelJS.CellValue): unknown {
  if (value && typeof value === 'object' && 'result' in value) return value.result;
  if (value && typeof value === 'object' && 'text' in value) return value.text;
  return value;
}

function findColumn(headers: Map<string, number>, names: readonly string[]): number | undefined {
  return names.map((name) => headers.get(name)).find((value) => value !== undefined);
}

async function readWorkbook(file: string, summary: Summary): Promise<ImportRow[]> {
  const workbook = new ExcelJS.Workbook();
  const isCsv = path.extname(file).toLowerCase() === '.csv';
  if (isCsv) await workbook.csv.readFile(file);
  else await workbook.xlsx.readFile(file);
  const expectedSheets = ['Oppty', 'Facturado Daily', 'Resumen', 'Canales Proceso'];
  if (!isCsv) {
    for (const name of expectedSheets) {
      if (!workbook.worksheets.some((sheet) => sheet.name.toLowerCase() === name.toLowerCase())) {
        summary.warnings += 1;
      }
    }
  }
  const sheet =
    workbook.worksheets.find((item) => item.name.toLowerCase() === 'oppty') ??
    workbook.worksheets[0];
  if (!sheet) throw new Error('Workbook has no readable worksheets');
  const headers = new Map<string, number>();
  sheet
    .getRow(1)
    .eachCell((cell, column) =>
      headers.set(normalizeText(cellValue(cell.value)).toLowerCase(), column),
    );
  const column = Object.fromEntries(
    Object.entries(aliases).map(([key, names]) => [key, findColumn(headers, names)]),
  ) as Record<keyof typeof aliases, number | undefined>;
  const rows: ImportRow[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    summary.rowsRead += 1;
    const value = (key: keyof typeof aliases): unknown =>
      column[key] ? cellValue(row.getCell(column[key]!).value) : undefined;
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
      stage === null ||
      !expectedCloseDate
    ) {
      summary.errors += 1;
      summary.skipped += 1;
      return;
    }
    const suppliedReference = normalizeText(value('reference'));
    const fingerprint = createHash('sha256')
      .update(
        [title, sellerEmail, customer, String(amount), expectedCloseDate.toISOString()].join('|'),
      )
      .digest('hex')
      .slice(0, 24);
    rows.push({
      rowNumber,
      title,
      sellerEmail,
      brand,
      customer,
      partner: normalizeText(value('partner')),
      amount,
      stage,
      expectedCloseDate,
      expectedBillingDate: normalizeDate(value('billing')),
      poNumber: normalizeText(value('po')),
      externalReference: `EXCEL-${suppliedReference || fingerprint}`,
    });
  });
  return rows;
}

async function importRow(tenantId: string, row: ImportRow, summary: Summary): Promise<void> {
  await prisma.$transaction(async (transaction) => {
    await transaction.$executeRawUnsafe('SET LOCAL ROLE app_runtime');
    await transaction.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
    const duplicate = await transaction.opportunity.findFirst({
      where: { tenantId, externalReference: row.externalReference },
      select: { id: true },
    });
    if (duplicate) {
      summary.duplicates += 1;
      summary.skipped += 1;
      return;
    }
    const membership = await transaction.tenantMembership.findFirst({
      where: { tenantId, status: 'ACTIVE', user: { email: row.sellerEmail } },
      select: { userId: true },
    });
    const stage = await transaction.stage.findFirst({
      where: { tenantId, code: String(row.stage) },
    });
    if (!membership || !stage) {
      summary.errors += 1;
      summary.skipped += 1;
      return;
    }
    const customer = await transaction.customer.upsert({
      where: { tenantId_name: { tenantId, name: row.customer } },
      update: {},
      create: { tenantId, name: row.customer },
    });
    const brand = await transaction.brand.upsert({
      where: { tenantId_name: { tenantId, name: row.brand } },
      update: {},
      create: { tenantId, name: row.brand },
    });
    const partner = row.partner
      ? await transaction.partner.upsert({
          where: { tenantId_name: { tenantId, name: row.partner } },
          update: {},
          create: { tenantId, name: row.partner },
        })
      : null;
    const status = row.stage >= 90 ? OpportunityStatus.WON : OpportunityStatus.OPEN;
    const forecastCategory =
      row.stage >= 90
        ? ForecastCategory.CLOSED
        : row.stage >= 75
          ? ForecastCategory.COMMIT
          : row.stage >= 50
            ? ForecastCategory.BEST_CASE
            : ForecastCategory.PIPELINE;
    await transaction.opportunity.create({
      data: {
        tenantId,
        sellerId: membership.userId,
        customerId: customer.id,
        partnerId: partner?.id,
        title: row.title,
        status,
        stageId: stage.id,
        forecastCategory,
        currency: 'USD',
        estimatedAmount: new Prisma.Decimal(row.amount),
        probability: stage.probability,
        expectedCloseDate: row.expectedCloseDate,
        expectedBillingDate: row.expectedBillingDate,
        poNumber: row.poNumber || null,
        source: 'EXCEL_IMPORT',
        externalReference: row.externalReference,
        lineItems: {
          create: {
            tenantId,
            brandId: brand.id,
            description: `${row.brand} imported line`,
            amount: new Prisma.Decimal(row.amount),
          },
        },
        stageHistory: {
          create: {
            tenantId,
            toStageId: stage.id,
            changedById: membership.userId,
            reason: `Excel import row ${row.rowNumber}`,
          },
        },
      },
    });
    summary.imported += 1;
  });
}

async function main(): Promise<void> {
  const file = argument('--file');
  const tenantSlug = argument('--tenant');
  const dryRun = process.argv.includes('--dry-run');
  if (!file || !tenantSlug)
    throw new Error('Usage: import:excel -- --file <path> --tenant <slug> [--dry-run]');
  const summary: Summary = {
    rowsRead: 0,
    imported: 0,
    skipped: 0,
    warnings: 0,
    errors: 0,
    duplicates: 0,
  };
  const invocationDirectory = process.env.INIT_CWD ?? process.cwd();
  const rows = await readWorkbook(path.resolve(invocationDirectory, file), summary);
  if (!dryRun) {
    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) throw new Error('Tenant not found');
    for (const row of rows) await importRow(tenant.id, row, summary);
    await prisma.$transaction(async (transaction) => {
      await transaction.$executeRawUnsafe('SET LOCAL ROLE app_runtime');
      await transaction.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenant.id}, true)`;
      await transaction.auditEvent.create({
        data: {
          tenantId: tenant.id,
          action: 'EXCEL_IMPORT_EXECUTED',
          entity: 'ExcelImport',
          metadata: { ...summary, dryRun: false },
        },
      });
    });
  }
  console.log(`Rows read: ${summary.rowsRead}`);
  console.log(`Imported: ${summary.imported}`);
  console.log(`Skipped: ${summary.skipped}`);
  console.log(`Warnings: ${summary.warnings}`);
  console.log(`Errors: ${summary.errors}`);
  console.log(`Duplicates: ${summary.duplicates}`);
  if (dryRun) console.log(`Dry run valid rows: ${rows.length}`);
  if (summary.errors > 0) process.exitCode = 2;
}

void main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Import failed');
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
