'use client';

import { AlertTriangle, CheckCircle2, FileSpreadsheet, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { csrfToken } from '@/lib/utils';

interface ImportIssue {
  sheet: string;
  row: number;
  code: string;
  severity: 'WARNING' | 'BLOCKED';
}

interface ImportAnalysis {
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
      confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
      required: boolean;
    }>;
  }>;
  issues: ImportIssue[];
}

interface ImportReport {
  fileType: 'CSV' | 'XLSX';
  sheets: Array<{
    name: string;
    disposition: 'IMPORT' | 'RECOGNIZED_NOT_IMPORTED' | 'UNSUPPORTED';
  }>;
  issues?: ImportIssue[];
  summary: {
    status: 'READY' | 'WARNING' | 'BLOCKED';
    rowsRead: number;
    ready: number;
    warnings: number;
    blocked: number;
    duplicates: number;
    imported?: number;
    opportunityImported?: number;
    billingImported?: number;
  };
}

interface MappingSelection {
  destinationField: string | null;
  confirmed: boolean;
}

const mappingKey = (sheet: string, sourceColumn: string) => `${sheet}\u0000${sourceColumn}`;

async function upload<T>(
  path: 'analyze' | 'validate' | 'execute',
  file: File,
  options?: { mapping: string; asOfDate: string },
): Promise<T> {
  const body = new FormData();
  body.append('file', file);
  if (options) {
    body.append('mapping', options.mapping);
    if (options.asOfDate) body.append('asOfDate', options.asOfDate);
  }
  const response = await fetch(`/backend/imports/${path}`, {
    method: 'POST',
    headers: { 'x-csrf-token': csrfToken() },
    body,
  });
  if (!response.ok) throw new Error(`IMPORT_${path.toUpperCase()}_${response.status}`);
  return (await response.json()) as T;
}

export function ImportWorkspace() {
  const t = useTranslations('importServer');
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<ImportAnalysis | null>(null);
  const [mappings, setMappings] = useState<Record<string, MappingSelection>>({});
  const [asOfDate, setAsOfDate] = useState('');
  const [report, setReport] = useState<ImportReport | null>(null);
  const [result, setResult] = useState<ImportReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const importableSheets = useMemo(
    () => analysis?.sheets.filter((sheet) => sheet.disposition === 'IMPORT') ?? [],
    [analysis],
  );

  const mappingIssues = useMemo(() => {
    const issues: string[] = [];
    if (analysis?.issues.some((issue) => issue.severity === 'BLOCKED')) {
      issues.push(t('mappingIssues.sourceHeaders'));
    }
    for (const sheet of importableSheets) {
      const selected = sheet.sourceHeaders
        .map((sourceColumn) => ({
          sourceColumn,
          selection: mappings[mappingKey(sheet.name, sourceColumn)],
        }))
        .filter(({ selection }) => selection?.destinationField);
      for (const destination of sheet.destinations.filter((item) => item.required)) {
        if (!selected.some(({ selection }) => selection?.destinationField === destination.field)) {
          issues.push(
            t('mappingIssues.required', {
              field: t(`fields.${destination.field}`),
              sheet: sheet.name,
            }),
          );
        }
      }
      const destinationCounts = new Map<string, number>();
      for (const { selection } of selected) {
        const destination = selection?.destinationField;
        if (!destination) continue;
        destinationCounts.set(destination, (destinationCounts.get(destination) ?? 0) + 1);
        if (!selection.confirmed) {
          issues.push(t('mappingIssues.unconfirmed', { field: t(`fields.${destination}`) }));
        }
      }
      for (const [destination, count] of destinationCounts) {
        if (count > 1) {
          issues.push(t('mappingIssues.duplicate', { field: t(`fields.${destination}`) }));
        }
      }
      if (
        sheet.kind === 'BILLING' &&
        !selected.some(({ selection }) => selection?.destinationField === 'date') &&
        !asOfDate
      ) {
        issues.push(t('mappingIssues.billingDate'));
      }
    }
    return [...new Set(issues)];
  }, [analysis, asOfDate, importableSheets, mappings, t]);

  const mappingContract = useMemo(
    () =>
      importableSheets.flatMap((sheet) =>
        sheet.sourceHeaders.map((sourceColumn) => ({
          sheet: sheet.name,
          sourceColumn,
          destinationField:
            mappings[mappingKey(sheet.name, sourceColumn)]?.destinationField ?? null,
          confirmed: mappings[mappingKey(sheet.name, sourceColumn)]?.confirmed ?? false,
        })),
      ),
    [importableSheets, mappings],
  );

  const analyze = async (selected: File) => {
    setFile(selected);
    setAnalysis(null);
    setMappings({});
    setAsOfDate('');
    setReport(null);
    setResult(null);
    setError('');
    setBusy(true);
    try {
      const next = await upload<ImportAnalysis>('analyze', selected);
      setAnalysis(next);
      setMappings(
        Object.fromEntries(
          next.sheets.flatMap((sheet) =>
            sheet.suggestedMappings.map((mapping) => [
              mappingKey(sheet.name, mapping.sourceColumn),
              { destinationField: mapping.destinationField, confirmed: false },
            ]),
          ),
        ),
      );
    } catch {
      setError(t('analysisError'));
    } finally {
      setBusy(false);
    }
  };

  const validate = async () => {
    if (!file || mappingIssues.length) return;
    setReport(null);
    setResult(null);
    setError('');
    setBusy(true);
    try {
      setReport(
        await upload<ImportReport>('validate', file, {
          mapping: JSON.stringify(mappingContract),
          asOfDate,
        }),
      );
    } catch {
      setError(t('validationError'));
    } finally {
      setBusy(false);
    }
  };

  const execute = async () => {
    if (!file || !report || report.summary.status === 'BLOCKED' || mappingIssues.length) return;
    setBusy(true);
    setError('');
    try {
      setResult(
        await upload<ImportReport>('execute', file, {
          mapping: JSON.stringify(mappingContract),
          asOfDate,
        }),
      );
    } catch {
      setError(t('executionError'));
    } finally {
      setBusy(false);
    }
  };

  const active = result ?? report;
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.13em] text-primary">
          {t('eyebrow')}
        </p>
        <h1 className="mt-1 text-page-title font-semibold tracking-[-0.04em]">{t('title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('selectFile')}</CardTitle>
          <p className="text-xs text-muted-foreground">{t('limits')}</p>
        </CardHeader>
        <CardContent>
          <label className="grid min-h-44 cursor-pointer place-items-center rounded-2xl border-2 border-dashed p-8 text-center hover:border-primary">
            <span>
              <Upload className="mx-auto size-8 text-primary" />
              <b className="mt-3 block">{busy ? t('analyzing') : t('choose')}</b>
              <span className="mt-2 block text-sm text-muted-foreground">
                {file?.name ?? t('formats')}
              </span>
              <input
                className="sr-only"
                type="file"
                accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                disabled={busy}
                onChange={(event) => {
                  const selected = event.target.files?.[0];
                  if (selected) void analyze(selected);
                  event.currentTarget.value = '';
                }}
              />
            </span>
          </label>
          {error ? (
            <p
              role="alert"
              className="mt-3 rounded-xl bg-surface-danger-soft p-3 text-sm text-danger"
            >
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {analysis ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('mappingTitle')}</CardTitle>
            <p className="text-xs text-muted-foreground">{t('mappingDescription')}</p>
          </CardHeader>
          <CardContent className="space-y-5">
            {importableSheets.map((sheet) => {
              const sheetHeadingId = `mapping-${sheet.name.replace(/[^a-z0-9_-]/gi, '-')}`;
              return (
                <section key={sheet.name} aria-labelledby={sheetHeadingId}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 id={sheetHeadingId} className="text-sm font-semibold">
                      {sheet.name}
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      {t('rowsDetected', { count: sheet.rowCount })}
                    </span>
                  </div>
                  <div className="mt-2 overflow-x-auto rounded-xl border">
                    <table className="w-full min-w-[680px] text-left text-xs">
                      <thead className="bg-muted text-muted-foreground">
                        <tr>
                          <th scope="col" className="px-3 py-2">
                            {t('sourceColumn')}
                          </th>
                          <th scope="col" className="px-3 py-2">
                            {t('destinationField')}
                          </th>
                          <th scope="col" className="px-3 py-2">
                            {t('confidence')}
                          </th>
                          <th scope="col" className="px-3 py-2">
                            {t('confirm')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sheet.suggestedMappings.map((suggestion) => {
                          const key = mappingKey(sheet.name, suggestion.sourceColumn);
                          const selection = mappings[key] ?? {
                            destinationField: null,
                            confirmed: false,
                          };
                          return (
                            <tr key={suggestion.sourceColumn} className="border-t">
                              <th scope="row" className="px-3 py-2 font-semibold">
                                {suggestion.sourceColumn}
                              </th>
                              <td className="px-3 py-2">
                                <select
                                  aria-label={t('mapColumn', { column: suggestion.sourceColumn })}
                                  className="h-9 w-full rounded-lg border bg-background px-2"
                                  value={selection.destinationField ?? ''}
                                  onChange={(event) => {
                                    setReport(null);
                                    setResult(null);
                                    setMappings((current) => ({
                                      ...current,
                                      [key]: {
                                        destinationField: event.target.value || null,
                                        confirmed: false,
                                      },
                                    }));
                                  }}
                                >
                                  <option value="">{t('ignore')}</option>
                                  {sheet.destinations.map((destination) => (
                                    <option key={destination.field} value={destination.field}>
                                      {t(`fields.${destination.field}`)}
                                      {destination.required ? ` · ${t('required')}` : ''}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-2">
                                {t(`confidenceValues.${suggestion.confidence}`)}
                              </td>
                              <td className="px-3 py-2">
                                <label className="inline-flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    aria-label={t('confirmColumn', {
                                      column: suggestion.sourceColumn,
                                    })}
                                    disabled={!selection.destinationField}
                                    checked={Boolean(
                                      selection.destinationField && selection.confirmed,
                                    )}
                                    onChange={(event) => {
                                      setReport(null);
                                      setResult(null);
                                      setMappings((current) => ({
                                        ...current,
                                        [key]: { ...selection, confirmed: event.target.checked },
                                      }));
                                    }}
                                  />
                                  <span>{t('confirmed')}</span>
                                </label>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {sheet.kind === 'BILLING' ? (
                    <label className="mt-3 block max-w-sm text-xs font-semibold">
                      {t('asOfDate')}
                      <Input
                        className="mt-1"
                        type="date"
                        value={asOfDate}
                        onChange={(event) => {
                          setReport(null);
                          setResult(null);
                          setAsOfDate(event.target.value);
                        }}
                      />
                      <span className="mt-1 block font-normal text-muted-foreground">
                        {t('asOfDateHelp')}
                      </span>
                    </label>
                  ) : null}
                </section>
              );
            })}

            {mappingIssues.length ? (
              <div
                role="alert"
                className="rounded-xl bg-surface-danger-soft p-3 text-sm text-danger"
              >
                <p className="font-semibold">{t('mappingBlocked')}</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {mappingIssues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p
                role="status"
                className="rounded-xl bg-surface-success-soft p-3 text-sm text-success"
              >
                {t('mappingReady')}
              </p>
            )}
            <div className="flex justify-end">
              <Button disabled={busy || mappingIssues.length > 0} onClick={() => void validate()}>
                {busy ? t('validating') : t('validateMapping')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {active ? (
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>{result ? t('resultTitle') : t('validationTitle')}</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {active.fileType} · {t('rowsRead', { count: active.summary.rowsRead })}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                active.summary.status === 'READY'
                  ? 'bg-surface-success-soft text-success'
                  : active.summary.status === 'WARNING'
                    ? 'bg-surface-warning-soft text-warning'
                    : 'bg-surface-danger-soft text-danger'
              }`}
            >
              {active.summary.status === 'READY' ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <AlertTriangle className="size-4" />
              )}
              {active.summary.status}
            </span>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {(['ready', 'warnings', 'blocked', 'duplicates'] as const).map((key) => (
                <div key={key} className="rounded-xl border p-3">
                  <p className="text-xs text-muted-foreground">{t(key)}</p>
                  <p className="tnum mt-1 text-xl font-semibold">{active.summary[key]}</p>
                </div>
              ))}
              <div className="rounded-xl border p-3">
                <p className="text-xs text-muted-foreground">{t('imported')}</p>
                <p className="tnum mt-1 text-xl font-semibold">{active.summary.imported ?? 0}</p>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold">{t('sheets')}</h2>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {active.sheets.map((sheet) => (
                  <div key={sheet.name} className="flex items-center gap-3 rounded-xl border p-3">
                    <FileSpreadsheet className="size-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">{sheet.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t(`disposition.${sheet.disposition}`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {active.issues?.length ? (
              <div>
                <h2 className="text-sm font-semibold">{t('issues')}</h2>
                <ul className="mt-2 max-h-52 space-y-1 overflow-auto rounded-xl bg-muted p-3 text-xs">
                  {active.issues.slice(0, 100).map((issue, index) => (
                    <li key={`${issue.sheet}-${issue.row}-${issue.code}-${index}`}>
                      {issue.severity} · {issue.sheet} · {t('row', { row: issue.row })} ·{' '}
                      {issue.code}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {!result ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">{t('dryRunComplete')}</p>
                <Button
                  disabled={busy || report?.summary.status === 'BLOCKED'}
                  onClick={() => void execute()}
                >
                  {busy ? t('importing') : t('execute')}
                </Button>
              </div>
            ) : (
              <p
                role="status"
                className="rounded-xl bg-surface-success-soft p-3 text-sm text-success"
              >
                {t('complete', {
                  opportunities: result.summary.opportunityImported ?? 0,
                  billing: result.summary.billingImported ?? 0,
                })}
              </p>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
