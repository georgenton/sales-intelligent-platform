'use client';

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  Upload,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useCreateOpportunityMutation, useReferenceDataQuery } from '@/store/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setImportWizardState } from '@/store/ui-slice';
import {
  canPassImportGate,
  detectImportMapping,
  IMPORT_FIELDS,
  isSupportedOpportunityCsvFileName,
  parseOpportunityCsv,
  validateImportMappings,
  validateImportRows,
  type ImportField,
  type MappingSuggestion,
} from './import-contracts';

const steps = [
  'upload',
  'detection',
  'mapping',
  'validation',
  'quality',
  'preview',
  'import',
  'results',
] as const;

export function ImportWorkspace() {
  const t = useTranslations('import');
  const tAction = useTranslations('common.action');
  const tStatus = useTranslations('common.status');
  const tValidation = useTranslations('validation');
  const dispatch = useAppDispatch();
  const wizard = useAppSelector((state) => state.productUi.importWizardState);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mappings, setMappings] = useState<Record<string, ImportField>>({});
  const [suggestions, setSuggestions] = useState<Record<string, MappingSuggestion>>({});
  const [confirmations, setConfirmations] = useState<Record<string, boolean>>({});
  const [fileError, setFileError] = useState('');
  const [blockedRowsAcknowledged, setBlockedRowsAcknowledged] = useState(false);
  const [validationRevision, setValidationRevision] = useState(0);
  const [results, setResults] = useState<Array<{ row: number; ok: boolean; message: string }>>([]);
  const referenceState = useReferenceDataQuery();
  const { data: reference } = referenceState;
  const [createOpportunity, createState] = useCreateOpportunityMutation();
  const fieldIndex = (field: string) => headers.findIndex((header) => mappings[header] === field);
  const valueAt = (row: string[], field: string) => row[fieldIndex(field)]?.trim() ?? '';
  const mappingValidation = useMemo(
    () => validateImportMappings(headers, mappings, confirmations),
    [confirmations, headers, mappings],
  );
  const quality = useMemo(
    () => (reference ? validateImportRows({ headers, rows, mappings, reference }) : null),
    // validationRevision intentionally lets the operator explicitly rerun local validation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [headers, mappings, reference, rows, validationRevision],
  );
  const importGatePass = Boolean(
    reference && canPassImportGate({ mappingValidation, quality, blockedRowsAcknowledged }),
  );
  const fieldLabel = (field: string) => (t.has(`fields.${field}`) ? t(`fields.${field}`) : field);
  const validationMessage = (message: string) => {
    const exact: Record<string, string> = {
      'The CSV contains an unclosed quoted value.': tValidation('unclosedQuote'),
      'The CSV must have a non-empty header for every column.': tValidation('emptyHeader'),
      'The CSV contains duplicate column headers.': tValidation('duplicateHeader'),
      'The CSV does not contain any data rows.': tValidation('noRows'),
      'The CSV exceeds the 500-row limit. Split it before importing.': tValidation('rowLimit'),
      'At least one CSV row has more values than the header.': tValidation('extraValues'),
      'Amount must be a positive number.': tValidation('positiveAmount'),
      'Expected close must be a valid date.': tValidation('validDate'),
      'Customer does not match tenant reference data.': tValidation('customerReference'),
      'Stage does not match tenant reference data.': tValidation('stageReference'),
      'Brand does not match tenant reference data.': tValidation('brandReference'),
      'Seller does not match tenant reference data.': tValidation('sellerReference'),
      'Forecast category is not recognized.': tValidation('forecastUnknown'),
      'Seller is blank; the authenticated user will own the row.': tValidation('sellerBlank'),
      'Forecast category is blank; PIPELINE will be used.': tValidation('forecastBlank'),
      'Description is blank; the opportunity title will be used.': tValidation('descriptionBlank'),
      'Duplicate row detected within this CSV.': tValidation('duplicate'),
    };
    if (exact[message]) return exact[message];
    const required = message.match(/^Required destination "(.+)" is not mapped\.$/);
    if (required)
      return tValidation('requiredDestination', { field: fieldLabel(required[1] ?? '') });
    const duplicate = message.match(/^Destination "(.+)" is mapped from multiple columns: (.+)\.$/);
    if (duplicate)
      return tValidation('duplicateDestination', {
        field: fieldLabel(duplicate[1] ?? ''),
        sources: duplicate[2] ?? '',
      });
    const confirm = message.match(/^Confirm mapping from "(.+)" to "(.+)"\.$/);
    if (confirm)
      return tValidation('confirmMapping', {
        header: confirm[1] ?? '',
        field: fieldLabel(confirm[2] ?? ''),
      });
    const missing = message.match(/^Missing (.+)\.$/);
    if (missing) return tValidation('missingField', { field: fieldLabel(missing[1] ?? '') });
    return message;
  };

  const loadFile = async (file: File) => {
    setFileError('');
    if (!isSupportedOpportunityCsvFileName(file.name)) {
      setFileError('UNSUPPORTED');
      return;
    }
    try {
      const parsed = parseOpportunityCsv(await file.text());
      if (!parsed.ok) {
        setFileError(parsed.message);
        return;
      }
      const nextSuggestions = Object.fromEntries(
        parsed.headers.map((header) => [header, detectImportMapping(header)]),
      );
      setHeaders(parsed.headers);
      setRows(parsed.rows);
      setSuggestions(nextSuggestions);
      setMappings(
        Object.fromEntries(
          parsed.headers.map((header) => [header, nextSuggestions[header]?.target ?? 'Ignore']),
        ),
      );
      setConfirmations({});
      setBlockedRowsAcknowledged(false);
      setResults([]);
      dispatch(setImportWizardState({ fileName: file.name, step: 1, template: 'Opportunity CSV' }));
    } catch {
      setFileError('READ_ERROR');
    }
  };

  const importRows = async () => {
    if (!reference || !quality || !importGatePass) return;
    const nextResults: Array<{ row: number; ok: boolean; message: string }> = [];
    for (const index of quality.importableIndexes) {
      const row = rows[index];
      if (!row) continue;
      const customer = reference.customers.find(
        (item) => item.name.toLowerCase() === valueAt(row, 'Customer').toLowerCase(),
      );
      const stageValue = valueAt(row, 'Stage').toLowerCase();
      const stage = reference.stages.find(
        (item) =>
          item.name.toLowerCase() === stageValue ||
          String(item.code).toLowerCase() === stageValue.replace('%', ''),
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
          message: 'REFERENCE_MISMATCH',
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
          estimatedAmount: valueAt(row, 'Amount').replace(/[$,\s]/g, ''),
          expectedCloseDate: close.toISOString(),
          poNumber: valueAt(row, 'PO number') || undefined,
          lineItems: [
            {
              brandId: brand.id,
              description: valueAt(row, 'Description') || valueAt(row, 'Opportunity'),
              amount: valueAt(row, 'Amount').replace(/[$,\s]/g, ''),
            },
          ],
        }).unwrap();
        nextResults.push({ row: index + 2, ok: true, message: 'IMPORTED' });
      } catch {
        nextResults.push({
          row: index + 2,
          ok: false,
          message: 'REJECTED',
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
        ? mappingValidation.status === 'PASS'
        : wizard.step === 3
          ? true
          : wizard.step === 4
            ? importGatePass
            : wizard.step < 7;
  return (
    <div>
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.13em] text-primary">
          {t('eyebrow')}
        </p>
        <h1 className="mt-1 text-page-title font-semibold tracking-[-0.04em]">{t('title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('workflowDescription')}</p>
      </div>
      <ol
        className="mb-5 grid grid-cols-4 gap-1 rounded-xl border bg-card p-2 sm:grid-cols-8"
        aria-label={t('progress')}
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
            {index + 1}. {t(`steps.${step}`)}
          </li>
        ))}
      </ol>
      <Card>
        <CardHeader>
          <CardTitle>{t(`steps.${steps[wizard.step] ?? 'upload'}`)}</CardTitle>
          <p className="text-xs text-muted-foreground">{wizard.fileName || t('noFile')}</p>
        </CardHeader>
        <CardContent>
          {wizard.step === 0 && (
            <div>
              <label className="grid min-h-64 cursor-pointer place-items-center rounded-2xl border-2 border-dashed p-8 text-center hover:border-primary">
                <span>
                  <Upload className="mx-auto size-8 text-primary" />
                  <b className="mt-3 block">{t('uploadCsv')}</b>
                  <span className="mt-2 block text-sm text-muted-foreground">
                    {t('fileSupport')}
                  </span>
                  <input
                    className="sr-only"
                    type="file"
                    accept=".csv,text/csv"
                    aria-describedby={fileError ? 'import-file-error' : undefined}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void loadFile(file);
                      event.currentTarget.value = '';
                    }}
                  />
                </span>
              </label>
              {fileError ? (
                <div
                  id="import-file-error"
                  role="alert"
                  className="mt-4 rounded-xl bg-surface-danger-soft p-3 text-sm text-danger"
                >
                  <p>
                    {fileError === 'UNSUPPORTED'
                      ? t('unsupported')
                      : fileError === 'READ_ERROR'
                        ? t('readError')
                        : validationMessage(fileError)}
                  </p>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setFileError('')}>
                    {t('chooseAnother')}
                  </Button>
                </div>
              ) : null}
            </div>
          )}
          {wizard.step === 1 && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border bg-surface-brand-soft p-4">
                <FileSpreadsheet className="size-5 text-primary" />
                <p className="mt-3 font-semibold">Opportunity CSV</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('detectedFrom', { columns: headers.length, rows: rows.length })}
                </p>
              </div>
              <div className="rounded-xl border p-4">
                <p className="font-semibold">Oppty</p>
                <p className="mt-1 text-xs text-success">{t('supportedApi')}</p>
              </div>
              <div className="rounded-xl border p-4 opacity-70">
                <p className="font-semibold">{t('billingCutoff')}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t('comingNext')}</p>
              </div>
            </div>
          )}
          {wizard.step === 2 && (
            <div className="space-y-2">
              {headers.map((header, headerIndex) => (
                <div
                  key={header}
                  className="grid gap-3 rounded-xl border p-3 sm:grid-cols-[minmax(0,1fr)_24px_minmax(0,1.2fr)] sm:items-center"
                >
                  <span className="truncate text-sm font-semibold">{header}</span>
                  <ArrowRight className="hidden size-4 text-muted-foreground sm:block" />
                  <div>
                    <label className="sr-only" htmlFor={`mapping-${headerIndex}`}>
                      {t('mapSource', { header })}
                    </label>
                    <select
                      id={`mapping-${headerIndex}`}
                      className="h-9 w-full rounded-lg border bg-background px-2 text-sm"
                      value={mappings[header] ?? 'Ignore'}
                      onChange={(event) => {
                        const target = event.target.value as ImportField;
                        setMappings((current) => ({ ...current, [header]: target }));
                        setConfirmations((current) => ({ ...current, [header]: true }));
                        setBlockedRowsAcknowledged(false);
                      }}
                    >
                      {IMPORT_FIELDS.map((field) => (
                        <option key={field} value={field}>
                          {fieldLabel(field)}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <span
                        className={cn(
                          confirmations[header] ? 'text-success' : 'text-warning',
                          mappings[header] === 'Ignore' && 'text-muted-foreground',
                        )}
                      >
                        {mappings[header] === 'Ignore'
                          ? t('ignored')
                          : confirmations[header]
                            ? t('confirmed')
                            : t('suggestion', {
                                confidence: suggestions[header]?.confidence ?? 'LOW',
                              })}
                      </span>
                      {mappings[header] !== 'Ignore' && !confirmations[header] ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setConfirmations((current) => ({ ...current, [header]: true }));
                            setBlockedRowsAcknowledged(false);
                          }}
                        >
                          {t('confirmMapping')}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
              <div
                className={cn(
                  'rounded-xl p-3 text-sm',
                  mappingValidation.status === 'PASS'
                    ? 'bg-surface-success-soft text-success'
                    : 'bg-surface-danger-soft text-danger',
                )}
                role={mappingValidation.status === 'PASS' ? 'status' : 'alert'}
              >
                <b>{t('mappingValidation', { status: tStatus(mappingValidation.status) })}</b>
                {mappingValidation.issues.length ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {mappingValidation.issues.map((issue) => (
                      <li key={issue}>{validationMessage(issue)}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1">{t('mappingValid')}</p>
                )}
              </div>
            </div>
          )}
          {wizard.step === 3 && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-surface-success-soft p-4">
                <b className="text-success">{t('mappingPass')}</b>
                <p className="mt-1 text-xs text-muted-foreground">{t('mappingValid')}</p>
              </div>
              <div className="rounded-xl bg-surface-warning-soft p-4">
                <b className="text-warning">{t('rowsDetected', { count: rows.length })}</b>
                <p className="mt-1 text-xs text-muted-foreground">{t('qualityNext')}</p>
              </div>
              <div className="rounded-xl bg-muted p-4">
                <b>
                  {referenceState.isLoading
                    ? t('referenceLoading')
                    : referenceState.isError
                      ? t('referenceUnavailable')
                      : t('referenceReady')}
                </b>
                <p className="mt-1 text-xs text-muted-foreground">{t('referenceChecked')}</p>
              </div>
            </div>
          )}
          {wizard.step === 4 && (
            <div>
              {!reference && referenceState.isLoading ? (
                <div aria-busy="true" role="status" className="rounded-xl border p-6 text-sm">
                  {t('referenceLoadingDetail')}
                </div>
              ) : !reference ? (
                <div role="alert" className="rounded-xl bg-surface-danger-soft p-4 text-danger">
                  <p className="text-sm">{t('referenceLoadError')}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => void referenceState.refetch()}
                  >
                    {t('retryReference')}
                  </Button>
                </div>
              ) : quality ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        quality.status === 'PASS'
                          ? 'text-success'
                          : quality.status === 'WARNING'
                            ? 'text-warning'
                            : 'text-danger',
                      )}
                      role="status"
                    >
                      {t('dataQuality', { status: tStatus(quality.status) })}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBlockedRowsAcknowledged(false);
                        setValidationRevision((revision) => revision + 1);
                      }}
                    >
                      {t('revalidate')}
                    </Button>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-4">
                    <Metric label={t('ready')} value={quality.ready} tone="success" />
                    <Metric label={t('warnings')} value={quality.warning} tone="warning" />
                    <Metric label={t('blocked')} value={quality.blocked} tone="danger" />
                    <Metric label={t('duplicates')} value={quality.duplicates} tone="danger" />
                  </div>
                  <div className="mt-4 max-h-72 overflow-auto divide-y rounded-xl border">
                    {quality.rows
                      .filter(({ status }) => status !== 'READY')
                      .slice(0, 50)
                      .map((row) => (
                        <div key={row.rowNumber} className="p-3 text-sm">
                          <b className={row.status === 'BLOCKED' ? 'text-danger' : 'text-warning'}>
                            {t('row', {
                              number: row.rowNumber,
                              status: tStatus(row.status),
                            })}
                          </b>
                          <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                            {[...row.blockingReasons, ...row.warnings].map((message) => (
                              <li key={message}>{validationMessage(message)}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    {quality.rows.every(({ status }) => status === 'READY') ? (
                      <p className="p-6 text-center text-sm text-success">{t('allRowsPass')}</p>
                    ) : null}
                  </div>
                  {quality.blocked > 0 && quality.importableIndexes.length > 0 ? (
                    <label className="mt-4 flex items-start gap-3 rounded-xl border border-warning/40 bg-surface-warning-soft p-4 text-sm">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={blockedRowsAcknowledged}
                        onChange={(event) => setBlockedRowsAcknowledged(event.target.checked)}
                      />
                      <span>
                        {t('importValidRows', {
                          ready: quality.importableIndexes.length,
                          blocked: quality.blocked,
                        })}
                      </span>
                    </label>
                  ) : null}
                  {quality.blocked > 0 && quality.importableIndexes.length === 0 ? (
                    <p role="alert" className="mt-4 text-sm text-danger">
                      {t('everyRowBlocked')}
                    </p>
                  ) : null}
                </>
              ) : null}
            </div>
          )}
          {wizard.step === 5 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead className="border-b uppercase text-muted-foreground">
                  <tr>
                    <th className="h-density-row p-2">{t('status')}</th>
                    {headers.map((header) => (
                      <th key={header} className="p-2">
                        {mappings[header] === 'Ignore'
                          ? header
                          : fieldLabel(mappings[header] ?? 'Ignore')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.slice(0, 10).map((row, index) => (
                    <tr key={index}>
                      <td className="p-2 font-semibold">
                        {tStatus(quality?.rows[index]?.status ?? 'BLOCKED')}
                      </td>
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
                {t('showingRows', { visible: Math.min(10, rows.length), total: rows.length })}
              </p>
            </div>
          )}
          {wizard.step === 6 && (
            <div className="rounded-2xl border p-6">
              <h2 className="font-semibold">
                {t('readyCreate', { count: quality?.importableIndexes.length ?? 0 })}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('securityCopy')}</p>
              {quality?.blocked ? (
                <p className="mt-3 text-sm text-warning">
                  {t('blockedSkip', { count: quality.blocked })}
                </p>
              ) : null}
              <p
                role="status"
                className={cn(
                  'mt-3 text-sm font-semibold',
                  importGatePass ? 'text-success' : 'text-danger',
                )}
              >
                {t('gate', { status: tStatus(importGatePass ? 'PASS' : 'BLOCKED') })}
              </p>
              {importGatePass ? (
                <Button className="mt-4" disabled={createState.isLoading} onClick={importRows}>
                  {createState.isLoading ? t('importing') : t('importNow')}
                </Button>
              ) : (
                <p role="alert" className="mt-2 text-sm text-danger">
                  {t('gateBlocked')}
                </p>
              )}
            </div>
          )}
          {wizard.step === 7 && (
            <div>
              <div className="grid gap-3 sm:grid-cols-4">
                <Metric
                  label={t('imported')}
                  value={results.filter((result) => result.ok).length}
                  tone="success"
                />
                <Metric
                  label={t('rejected')}
                  value={results.filter((result) => !result.ok).length}
                  tone="danger"
                />
                <Metric label={t('skipped')} value={quality?.blocked ?? 0} tone="warning" />
                <Metric label={t('attempted')} value={results.length} />
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
                    <b>{t('rowResult', { number: result.row })}</b> ·{' '}
                    {result.message === 'IMPORTED'
                      ? t('rowImported')
                      : result.message === 'REJECTED'
                        ? t('rowRejected')
                        : tValidation('referenceMismatch')}
                  </p>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <Button
              variant="ghost"
              disabled={wizard.step === 0 || createState.isLoading}
              onClick={() => dispatch(setImportWizardState({ step: Math.max(0, wizard.step - 1) }))}
            >
              <ArrowLeft className="size-4" />
              {tAction('back')}
            </Button>
            {wizard.step > 0 && wizard.step < 6 && (
              <Button
                disabled={!canContinue || createState.isLoading}
                onClick={() => dispatch(setImportWizardState({ step: wizard.step + 1 }))}
              >
                {tAction('continue')} <ArrowRight className="size-4" />
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
