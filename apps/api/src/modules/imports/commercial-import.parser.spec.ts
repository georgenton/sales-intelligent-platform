import ExcelJS from 'exceljs';
import { describe, expect, it } from 'vitest';
import {
  analyzeCommercialWorkbook,
  parseCommercialWorkbook,
  type CommercialImportContext,
} from './commercial-import.parser';

async function confirmedContext(
  fileName: string,
  buffer: Buffer,
  asOfDate: Date | null = null,
): Promise<CommercialImportContext> {
  const analysis = await analyzeCommercialWorkbook(fileName, buffer);
  return {
    mappings: analysis.sheets.flatMap((sheet) =>
      sheet.suggestedMappings
        .filter((mapping) => mapping.destinationField)
        .map((mapping) => ({
          sheet: sheet.name,
          sourceColumn: mapping.sourceColumn,
          destinationField: mapping.destinationField,
          confirmed: true,
        })),
    ),
    asOfDate,
  };
}

describe('commercial CSV/XLSX parsing', () => {
  it('parses a canonical opportunity CSV and maps legacy stages', async () => {
    const csv = Buffer.from(
      'Opportunity,Seller Email,Brand,Customer,Amount,Stage,Expected Close,GM %\n' +
        'Deal A,seller@example.com,Nutanix,Customer A,1000,75%,2026-10-15,12.5%\n' +
        'Deal B,seller@example.com,Nutanix,Customer B,2000,40%,2026-10-20,10%\n',
    );
    const plan = await parseCommercialWorkbook(
      'opportunities.csv',
      csv,
      await confirmedContext('opportunities.csv', csv),
    );
    expect(plan.summary.status).toBe('READY');
    expect(plan.opportunities[0]).toMatchObject({
      stageCode: '80',
      forecastCategory: 'COMMIT',
      grossProfit: 125,
    });
    expect(plan.opportunities[1]).toMatchObject({
      stageCode: '40',
      forecastCategory: 'PIPELINE',
      grossProfit: 200,
    });
  });

  it('imports source sheets and recognizes derived or Phase 2 sheets without duplicating facts', async () => {
    const workbook = new ExcelJS.Workbook();
    const opportunities = workbook.addWorksheet('Oppty');
    opportunities.addRow([
      'Opportunity',
      'Seller Email',
      'Brand',
      'Customer',
      'Amount',
      'Stage',
      'Expected Close',
    ]);
    opportunities.addRow([
      'Deal A',
      'seller@example.com',
      'Nutanix',
      'Customer A',
      1000,
      '20%',
      new Date('2026-10-15T00:00:00Z'),
    ]);
    const billing = workbook.addWorksheet('Facturado Daily');
    billing.addRow(['Vendor', 'Revenue USD', 'GP USD', 'Orders', 'Date']);
    billing.addRow(['Nutanix', 500, 50, 'INV-1', new Date('2026-10-20T00:00:00Z')]);
    workbook.addWorksheet('Resumen');
    workbook.addWorksheet('Canales Proceso');
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    const analysis = await analyzeCommercialWorkbook('commercial.xlsx', buffer);
    const orders = analysis.sheets
      .find((sheet) => sheet.name === 'Facturado Daily')
      ?.suggestedMappings.find((mapping) => mapping.sourceColumn === 'Orders');
    expect(orders).toMatchObject({ destinationField: null, confidence: 'NONE' });
    const plan = await parseCommercialWorkbook(
      'commercial.xlsx',
      buffer,
      await confirmedContext('commercial.xlsx', buffer),
    );
    expect(plan.opportunities).toHaveLength(1);
    expect(plan.billing).toHaveLength(1);
    expect(plan.billing[0]?.invoiceNumber).toBe('');
    expect(
      plan.sheets.filter((sheet) => sheet.disposition === 'RECOGNIZED_NOT_IMPORTED'),
    ).toHaveLength(2);
  });

  it('blocks a workbook with only invalid source rows', async () => {
    const csv = Buffer.from(
      'Opportunity,Seller Email,Brand,Customer,Amount,Stage,Expected Close\nMissing,,,,,,\n',
    );
    const plan = await parseCommercialWorkbook(
      'opportunities.csv',
      csv,
      await confirmedContext('opportunities.csv', csv),
    );
    expect(plan.summary.status).toBe('BLOCKED');
    expect(plan.issues[0]).toMatchObject({
      code: 'OPPORTUNITY_REQUIRED_FIELD',
      severity: 'BLOCKED',
    });
  });

  it('blocks an opportunity import from declaring billed stage without a billing fact', async () => {
    const csv = Buffer.from(
      'Opportunity,Seller Email,Brand,Customer,Amount,Stage,Expected Close\n' +
        'Unsupported billed deal,seller@example.com,Nutanix,Customer A,1000,100%,2026-10-15\n',
    );
    const plan = await parseCommercialWorkbook(
      'opportunities.csv',
      csv,
      await confirmedContext('opportunities.csv', csv),
    );
    expect(plan.summary.status).toBe('BLOCKED');
    expect(plan.issues).toContainEqual(
      expect.objectContaining({
        code: 'OPPORTUNITY_BILLING_FACT_REQUIRED',
        severity: 'BLOCKED',
      }),
    );
  });

  it('blocks unconfirmed mappings and accepts an explicit aggregate billing as-of date', async () => {
    const workbook = new ExcelJS.Workbook();
    const billing = workbook.addWorksheet('Facturado Daily');
    billing.addRow(['Vendor', 'Revenue USD', 'GP USD']);
    billing.addRow(['Nutanix', 500, 50]);
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    const unconfirmed = await confirmedContext('billing.xlsx', buffer);
    unconfirmed.mappings[0]!.confirmed = false;
    const blocked = await parseCommercialWorkbook('billing.xlsx', buffer, unconfirmed);
    expect(blocked.summary.status).toBe('BLOCKED');
    expect(blocked.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'MAPPING_CONFIRMATION_REQUIRED' }),
        expect.objectContaining({ code: 'MAPPING_BILLING_DATE_OR_AS_OF_REQUIRED' }),
      ]),
    );

    const asOfDate = new Date('2026-08-27T00:00:00.000Z');
    const confirmed = await confirmedContext('billing.xlsx', buffer, asOfDate);
    const plan = await parseCommercialWorkbook('billing.xlsx', buffer, confirmed);
    expect(plan.summary.status).toBe('READY');
    expect(plan.billing[0]?.billedAt).toEqual(asOfDate);
  });

  it('blocks one source column from being confirmed for multiple destinations', async () => {
    const csv = Buffer.from(
      'Opportunity,Seller Email,Brand,Customer,Amount,Stage,Expected Close\n' +
        'Deal A,seller@example.com,Nutanix,Customer A,1000,20%,2026-10-15\n',
    );
    const context = await confirmedContext('opportunities.csv', csv);
    context.mappings.push({
      sheet: context.mappings[0]!.sheet,
      sourceColumn: 'Opportunity',
      destinationField: 'partner',
      confirmed: true,
    });
    const plan = await parseCommercialWorkbook('opportunities.csv', csv, context);
    expect(plan.summary.status).toBe('BLOCKED');
    expect(plan.issues).toContainEqual(
      expect.objectContaining({ code: 'MAPPING_DUPLICATE_SOURCE', severity: 'BLOCKED' }),
    );
  });

  it('does not replace an invalid mapped row date with an aggregate as-of date', async () => {
    const workbook = new ExcelJS.Workbook();
    const billing = workbook.addWorksheet('Facturado Daily');
    billing.addRow(['Vendor', 'Revenue USD', 'Date']);
    billing.addRow(['Nutanix', 500, 'not-a-date']);
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    const context = await confirmedContext(
      'billing.xlsx',
      buffer,
      new Date('2026-08-27T00:00:00.000Z'),
    );
    const plan = await parseCommercialWorkbook('billing.xlsx', buffer, context);
    expect(plan.summary.status).toBe('BLOCKED');
    expect(plan.issues).toContainEqual(
      expect.objectContaining({ code: 'BILLING_REQUIRED_FIELD', severity: 'BLOCKED' }),
    );
  });
});
