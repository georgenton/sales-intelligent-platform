'use client';

import { AlertTriangle, CheckCircle2, FileSpreadsheet, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { csrfToken } from '@/lib/utils';

interface ImportReport {
  fileType: 'CSV' | 'XLSX';
  sheets: Array<{
    name: string;
    disposition: 'IMPORT' | 'RECOGNIZED_NOT_IMPORTED' | 'UNSUPPORTED';
  }>;
  issues?: Array<{
    sheet: string;
    row: number;
    code: string;
    severity: 'WARNING' | 'BLOCKED';
  }>;
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

async function upload(path: 'validate' | 'execute', file: File): Promise<ImportReport> {
  const body = new FormData();
  body.append('file', file);
  const response = await fetch(`/backend/imports/${path}`, {
    method: 'POST',
    headers: { 'x-csrf-token': csrfToken() },
    body,
  });
  if (!response.ok) throw new Error(`IMPORT_${path.toUpperCase()}_${response.status}`);
  return (await response.json()) as ImportReport;
}

export function ImportWorkspace() {
  const t = useTranslations('importServer');
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [result, setResult] = useState<ImportReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const validate = async (selected: File) => {
    setFile(selected);
    setReport(null);
    setResult(null);
    setError('');
    setBusy(true);
    try {
      setReport(await upload('validate', selected));
    } catch {
      setError(t('validationError'));
    } finally {
      setBusy(false);
    }
  };

  const execute = async () => {
    if (!file || !report || report.summary.status === 'BLOCKED') return;
    setBusy(true);
    setError('');
    try {
      setResult(await upload('execute', file));
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
              <b className="mt-3 block">{busy ? t('validating') : t('choose')}</b>
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
                  if (selected) void validate(selected);
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
