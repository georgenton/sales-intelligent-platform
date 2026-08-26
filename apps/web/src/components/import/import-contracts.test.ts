import { describe, expect, it } from 'vitest';
import {
  canPassImportGate,
  detectImportMapping,
  isSupportedOpportunityCsvFileName,
  parseOpportunityCsv,
  validateImportMappings,
  validateImportRows,
  type ImportField,
} from './import-contracts';

const headers = ['Opportunity', 'Customer', 'Stage', 'Amount', 'Expected close', 'Brand'];
const mappings = Object.fromEntries(headers.map((header) => [header, header])) as Record<
  string,
  ImportField
>;
const reference = {
  customers: [{ name: 'Acme' }],
  stages: [{ name: 'Commit', code: '80' }],
  brands: [{ name: 'Contoso' }],
  users: [{ name: 'Alex Seller' }],
};

describe('safe import contract', () => {
  it('accepts CSV only and rejects malformed or oversized input', () => {
    expect(isSupportedOpportunityCsvFileName('pipeline.csv')).toBe(true);
    expect(isSupportedOpportunityCsvFileName('pipeline.xlsx')).toBe(false);
    expect(parseOpportunityCsv('Opportunity,Customer\n"Open,Acme')).toEqual({
      ok: false,
      message: 'The CSV contains an unclosed quoted value.',
    });
  });

  it('separates suggested mappings from explicit confirmation', () => {
    expect(detectImportMapping('client')).toEqual({ target: 'Customer', confidence: 'MEDIUM' });
    const blocked = validateImportMappings(headers, mappings, {});
    expect(blocked.status).toBe('BLOCKED');
    expect(blocked.issues).toContain('Confirm mapping from "Customer" to "Customer".');
    expect(
      validateImportMappings(
        headers,
        mappings,
        Object.fromEntries(headers.map((header) => [header, true])),
      ).status,
    ).toBe('PASS');
  });

  it('rejects duplicate destination mappings', () => {
    const duplicateMappings = { ...mappings, Customer: 'Opportunity' as const };
    const validation = validateImportMappings(
      headers,
      duplicateMappings,
      Object.fromEntries(headers.map((header) => [header, true])),
    );
    expect(validation.status).toBe('BLOCKED');
    expect(validation.issues.join(' ')).toContain('mapped from multiple columns');
  });

  it('separates ready, warning, blocked and duplicate rows', () => {
    const quality = validateImportRows({
      headers,
      mappings,
      reference,
      rows: [
        ['Renewal', 'Acme', 'Commit', '1000', '2026-09-30', 'Contoso'],
        ['New logo', 'Acme', 'Commit', '2000', '2026-10-15', 'Contoso'],
        ['New logo', 'Acme', 'Commit', '2000', '2026-10-15', 'Contoso'],
        ['Bad amount', 'Acme', 'Commit', 'not-a-number', '2026-10-15', 'Contoso'],
      ],
    });

    expect(quality).toMatchObject({
      status: 'BLOCKED',
      ready: 0,
      warning: 1,
      blocked: 3,
      duplicates: 2,
      importableIndexes: [0],
    });
    expect(quality.rows[1]?.blockingReasons).toContain('Duplicate row detected within this CSV.');
    expect(quality.rows[3]?.blockingReasons).toContain('Amount must be a positive number.');

    const validMappings = validateImportMappings(
      headers,
      mappings,
      Object.fromEntries(headers.map((header) => [header, true])),
    );
    expect(
      canPassImportGate({
        mappingValidation: validMappings,
        quality,
        blockedRowsAcknowledged: false,
      }),
    ).toBe(false);
    expect(
      canPassImportGate({
        mappingValidation: validMappings,
        quality,
        blockedRowsAcknowledged: true,
      }),
    ).toBe(true);
  });
});
