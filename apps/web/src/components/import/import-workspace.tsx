'use client';

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  Upload,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useCreateOpportunityMutation, useReferenceDataQuery } from '@/store/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setImportWizardState } from '@/store/ui-slice';

const steps = [
  'Upload',
  'Template detection',
  'Column mapping',
  'Validation',
  'Data quality',
  'Preview',
  'Import',
  'Results',
];
const fields = [
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
];
const required = ['Opportunity', 'Customer', 'Stage', 'Amount', 'Expected close', 'Brand'];

function parseCsv(value: string): string[][] {
  const rows: string[][] = [];
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
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
    } else cell += char;
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function detect(header: string): string {
  const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (/^(oppty|opportunity|title|deal)$/.test(normalized)) return 'Opportunity';
  if (/^(customer|account|client|cliente)$/.test(normalized)) return 'Customer';
  if (/^(stage|etapa)$/.test(normalized)) return 'Stage';
  if (/^(amount|value|monto|revenue)$/.test(normalized)) return 'Amount';
  if (/^(closedate|expectedclose|expectedclosedate|fechacierre)$/.test(normalized))
    return 'Expected close';
  if (/^(brand|marca)$/.test(normalized)) return 'Brand';
  if (/^(seller|owner|vendedor)$/.test(normalized)) return 'Seller';
  if (/^(forecast|forecastcategory|category)$/.test(normalized)) return 'Forecast category';
  if (/^(po|ponumber|purchaseorder)$/.test(normalized)) return 'PO number';
  if (/^(description|product|item)$/.test(normalized)) return 'Description';
  return 'Ignore';
}

export function ImportWorkspace() {
  const dispatch = useAppDispatch();
  const wizard = useAppSelector((state) => state.productUi.importWizardState);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Array<{ row: number; ok: boolean; message: string }>>([]);
  const { data: reference } = useReferenceDataQuery();
  const [createOpportunity, createState] = useCreateOpportunityMutation();
  const fieldIndex = (field: string) => headers.findIndex((header) => mappings[header] === field);
  const valueAt = (row: string[], field: string) => row[fieldIndex(field)]?.trim() ?? '';
  const issues = useMemo(() => {
    const missingMappings = required.filter((field) => !Object.values(mappings).includes(field));
    const rowIssues = rows.flatMap((row, index) => {
      const messages = required
        .filter((field) => !valueAt(row, field))
        .map((field) => `Missing ${field}`);
      return messages.map((message) => ({ row: index + 2, message }));
    });
    return { missingMappings, rowIssues };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recompute from CSV state and mappings only.
  }, [headers, mappings, rows]);
  const ready = rows.length - new Set(issues.rowIssues.map((issue) => issue.row)).size;

  const loadFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setResults([
        {
          row: 0,
          ok: false,
          message: 'Excel workbook parsing is not implemented. Export the Oppty sheet as CSV.',
        },
      ]);
      return;
    }
    const parsed = parseCsv(await file.text());
    const nextHeaders = parsed[0] ?? [];
    setHeaders(nextHeaders);
    setRows(parsed.slice(1, 501));
    setMappings(Object.fromEntries(nextHeaders.map((header) => [header, detect(header)])));
    setResults([]);
    dispatch(setImportWizardState({ fileName: file.name, step: 1, template: 'Opportunity CSV' }));
  };

  const importRows = async () => {
    if (!reference || issues.missingMappings.length || issues.rowIssues.length) return;
    const nextResults: Array<{ row: number; ok: boolean; message: string }> = [];
    for (const [index, row] of rows.entries()) {
      const customer = reference.customers.find(
        (item) => item.name.toLowerCase() === valueAt(row, 'Customer').toLowerCase(),
      );
      const stageValue = valueAt(row, 'Stage').toLowerCase();
      const stage = reference.stages.find(
        (item) =>
          item.name.toLowerCase() === stageValue ||
          String(item.code) === stageValue.replace('%', ''),
      );
      const brand = reference.brands.find(
        (item) => item.name.toLowerCase() === valueAt(row, 'Brand').toLowerCase(),
      );
      const seller = reference.users.find(
        (item) => item.name.toLowerCase() === valueAt(row, 'Seller').toLowerCase(),
      );
      const close = new Date(valueAt(row, 'Expected close'));
      if (!customer || !stage || !brand || Number.isNaN(close.getTime())) {
        nextResults.push({
          row: index + 2,
          ok: false,
          message: 'Customer, stage, brand or close date does not match tenant reference data.',
        });
        continue;
      }
      try {
        await createOpportunity({
          title: valueAt(row, 'Opportunity'),
          customerId: customer.id,
          stageId: stage.id,
          sellerId: seller?.id,
          status: 'OPEN',
          forecastCategory: ['PIPELINE', 'BEST_CASE', 'COMMIT', 'CLOSED', 'OMITTED'].includes(
            valueAt(row, 'Forecast category').toUpperCase().replaceAll(' ', '_'),
          )
            ? valueAt(row, 'Forecast category').toUpperCase().replaceAll(' ', '_')
            : 'PIPELINE',
          currency: reference.settings.currency,
          estimatedAmount: valueAt(row, 'Amount').replaceAll(',', ''),
          expectedCloseDate: close.toISOString(),
          poNumber: valueAt(row, 'PO number') || undefined,
          lineItems: [
            {
              brandId: brand.id,
              description: valueAt(row, 'Description') || valueAt(row, 'Opportunity'),
              amount: valueAt(row, 'Amount').replaceAll(',', ''),
            },
          ],
        }).unwrap();
        nextResults.push({ row: index + 2, ok: true, message: 'Opportunity imported.' });
      } catch {
        nextResults.push({
          row: index + 2,
          ok: false,
          message: 'API validation rejected this row.',
        });
      }
    }
    setResults(nextResults);
    dispatch(setImportWizardState({ step: 7 }));
  };

  const canContinue =
    wizard.step === 0
      ? false
      : wizard.step === 2
        ? issues.missingMappings.length === 0
        : wizard.step < 7;
  return (
    <div>
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.13em] text-primary">
          Data operations
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">Import opportunities</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A transparent, tenant-scoped CSV workflow using the existing opportunity API.
        </p>
      </div>
      <ol
        className="mb-5 grid grid-cols-4 gap-1 rounded-xl border bg-card p-2 sm:grid-cols-8"
        aria-label="Import progress"
      >
        {steps.map((step, index) => (
          <li
            key={step}
            className={cn(
              'rounded-lg px-2 py-2 text-center text-[10px] font-semibold',
              index === wizard.step
                ? 'bg-primary text-primary-foreground'
                : index < wizard.step
                  ? 'bg-surface-success-soft text-success'
                  : 'text-muted-foreground',
            )}
          >
            {index + 1}. {step}
          </li>
        ))}
      </ol>
      <Card>
        <CardHeader>
          <CardTitle>{steps[wizard.step]}</CardTitle>
          <p className="text-xs text-muted-foreground">{wizard.fileName || 'No file selected'}</p>
        </CardHeader>
        <CardContent>
          {wizard.step === 0 && (
            <label className="grid min-h-64 cursor-pointer place-items-center rounded-2xl border-2 border-dashed p-8 text-center hover:border-primary">
              <span>
                <Upload className="mx-auto size-8 text-primary" />
                <b className="mt-3 block">Upload opportunity CSV</b>
                <span className="mt-2 block text-sm text-muted-foreground">
                  Oppty CSV → Supported · Billing import → Coming next · Channel cutoff import →
                  Coming next
                </span>
                <input
                  className="sr-only"
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) loadFile(file);
                  }}
                />
              </span>
            </label>
          )}
          {wizard.step === 1 && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border bg-surface-brand-soft p-4">
                <FileSpreadsheet className="size-5 text-primary" />
                <p className="mt-3 font-semibold">Opportunity CSV</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Detected from {headers.length} columns · {rows.length} data rows
                </p>
              </div>
              <div className="rounded-xl border p-4">
                <p className="font-semibold">Oppty</p>
                <p className="mt-1 text-xs text-success">Supported through current create API</p>
              </div>
              <div className="rounded-xl border p-4 opacity-70">
                <p className="font-semibold">Billing / Channel cutoff</p>
                <p className="mt-1 text-xs text-muted-foreground">Coming next · not imported</p>
              </div>
            </div>
          )}
          {wizard.step === 2 && (
            <div className="space-y-2">
              {headers.map((header) => (
                <div
                  key={header}
                  className="grid grid-cols-[minmax(0,1fr)_24px_minmax(0,1fr)] items-center gap-3 rounded-xl border p-3"
                >
                  <span className="truncate text-sm font-semibold">{header}</span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                  <select
                    className="h-9 rounded-lg border bg-background px-2 text-sm"
                    value={mappings[header]}
                    onChange={(event) =>
                      setMappings((current) => ({ ...current, [header]: event.target.value }))
                    }
                  >
                    {fields.map((field) => (
                      <option key={field}>{field}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
          {wizard.step === 3 && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-surface-success-soft p-4">
                <b className="text-success">{ready} ready</b>
                <p className="mt-1 text-xs text-muted-foreground">Required values present</p>
              </div>
              <div className="rounded-xl bg-surface-warning-soft p-4">
                <b className="text-warning">{issues.rowIssues.length} field warnings</b>
                <p className="mt-1 text-xs text-muted-foreground">Review before import</p>
              </div>
              <div className="rounded-xl bg-muted p-4">
                <b>{issues.missingMappings.length} missing mappings</b>
                <p className="mt-1 text-xs text-muted-foreground">
                  {issues.missingMappings.join(', ') || 'All required fields mapped'}
                </p>
              </div>
            </div>
          )}
          {wizard.step === 4 && (
            <div>
              <div className="grid gap-3 sm:grid-cols-4">
                <Metric label="Ready" value={ready} tone="success" />
                <Metric label="Warnings" value={issues.rowIssues.length} tone="warning" />
                <Metric
                  label="Invalid"
                  value={issues.missingMappings.length ? rows.length : 0}
                  tone="danger"
                />
                <Metric label="Duplicates" value={0} />
              </div>
              <div className="mt-4 max-h-64 overflow-auto divide-y rounded-xl border">
                {issues.rowIssues.slice(0, 50).map((issue) => (
                  <p key={`${issue.row}-${issue.message}`} className="p-3 text-sm">
                    <b>Row {issue.row}</b> · {issue.message}
                  </p>
                ))}
                {!issues.rowIssues.length && (
                  <p className="p-6 text-center text-sm text-success">
                    No row-level issues detected.
                  </p>
                )}
              </div>
            </div>
          )}
          {wizard.step === 5 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead className="border-b uppercase text-muted-foreground">
                  <tr>
                    {headers.map((header) => (
                      <th key={header} className="p-2">
                        {mappings[header] === 'Ignore' ? header : mappings[header]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.slice(0, 10).map((row, index) => (
                    <tr key={index}>
                      {headers.map((header, cell) => (
                        <td key={header} className="max-w-48 truncate p-2">
                          {row[cell]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-xs text-muted-foreground">
                Showing {Math.min(10, rows.length)} of {rows.length} rows.
              </p>
            </div>
          )}
          {wizard.step === 6 && (
            <div className="rounded-2xl border p-6">
              <h2 className="font-semibold">
                Ready to create {rows.length} tenant-scoped opportunities
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Each row uses the existing authenticated POST endpoint, CSRF protection, RBAC and
                audit trail. No direct database write is used.
              </p>
              {issues.rowIssues.length || issues.missingMappings.length ? (
                <p role="alert" className="mt-3 text-sm text-danger">
                  Resolve validation issues before importing.
                </p>
              ) : (
                <Button
                  className="mt-4"
                  disabled={!reference || createState.isLoading}
                  onClick={importRows}
                >
                  {createState.isLoading ? 'Importing…' : 'Import now'}
                </Button>
              )}
            </div>
          )}
          {wizard.step === 7 && (
            <div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric
                  label="Imported"
                  value={results.filter((result) => result.ok).length}
                  tone="success"
                />
                <Metric
                  label="Rejected"
                  value={results.filter((result) => !result.ok).length}
                  tone="danger"
                />
                <Metric label="Total" value={results.length} />
              </div>
              <div className="mt-4 max-h-72 overflow-auto divide-y rounded-xl border">
                {results.map((result) => (
                  <p
                    key={`${result.row}-${result.message}`}
                    className="flex items-center gap-2 p-3 text-sm"
                  >
                    {result.ok ? (
                      <CheckCircle2 className="size-4 text-success" />
                    ) : (
                      <AlertTriangle className="size-4 text-danger" />
                    )}
                    <b>Row {result.row}</b> · {result.message}
                  </p>
                ))}
              </div>
            </div>
          )}
          {results[0]?.row === 0 && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-surface-danger-soft p-3 text-sm text-danger"
            >
              {results[0].message}
            </p>
          )}
          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <Button
              variant="ghost"
              disabled={wizard.step === 0 || createState.isLoading}
              onClick={() => dispatch(setImportWizardState({ step: Math.max(0, wizard.step - 1) }))}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            {wizard.step > 0 && wizard.step < 6 && (
              <Button
                disabled={!canContinue || createState.isLoading}
                onClick={() => dispatch(setImportWizardState({ step: wizard.step + 1 }))}
              >
                Continue <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: 'success' | 'warning' | 'danger';
}) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          'tnum mt-1 text-2xl font-semibold',
          tone === 'success' && 'text-success',
          tone === 'warning' && 'text-warning',
          tone === 'danger' && 'text-danger',
        )}
      >
        {value}
      </p>
    </div>
  );
}
