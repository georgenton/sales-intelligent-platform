import ExcelJS from 'exceljs';
import { describe, expect, it } from 'vitest';
import { parseCommercialWorkbook } from './commercial-import.parser';

describe('commercial CSV/XLSX parsing', () => {
  it('parses a canonical opportunity CSV and maps legacy stages', async () => {
    const csv = Buffer.from(
      'Opportunity,Seller Email,Brand,Customer,Amount,Stage,Expected Close,GM %\n' +
        'Deal A,seller@example.com,Nutanix,Customer A,1000,75%,2026-10-15,12.5%\n',
    );
    const plan = await parseCommercialWorkbook('opportunities.csv', csv);
    expect(plan.summary.status).toBe('READY');
    expect(plan.opportunities[0]).toMatchObject({
      stageCode: '80',
      forecastCategory: 'COMMIT',
      grossProfit: 125,
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
    const plan = await parseCommercialWorkbook('commercial.xlsx', buffer);
    expect(plan.opportunities).toHaveLength(1);
    expect(plan.billing).toHaveLength(1);
    expect(
      plan.sheets.filter((sheet) => sheet.disposition === 'RECOGNIZED_NOT_IMPORTED'),
    ).toHaveLength(2);
  });

  it('blocks a workbook with only invalid source rows', async () => {
    const csv = Buffer.from(
      'Opportunity,Seller Email,Brand,Customer,Amount,Stage,Expected Close\nMissing,,,,,,\n',
    );
    const plan = await parseCommercialWorkbook('opportunities.csv', csv);
    expect(plan.summary.status).toBe('BLOCKED');
    expect(plan.issues[0]).toMatchObject({
      code: 'OPPORTUNITY_REQUIRED_FIELD',
      severity: 'BLOCKED',
    });
  });
});
