import { Camera, History } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { CreateSnapshotButton } from '@/components/forecast/create-snapshot-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import { formatCurrency, formatDateOnly, formatDateTime } from '@/lib/utils';
import type { AppLocale } from '@/i18n/config';
import { canManageForecast } from '@/lib/permissions';

interface Snapshot {
  id: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  _count: { items: number };
}

interface LatestDiff {
  currentSnapshotId: string | null;
  previousSnapshotId: string | null;
  diff: null | {
    added: unknown[];
    removed: unknown[];
    amountChanges: unknown[];
    stageChanges: unknown[];
    categoryChanges: unknown[];
    expectedCloseChanges: unknown[];
    billingDateChanges: unknown[];
    previousForecast: number;
    currentForecast: number;
    totalForecastDelta: number;
  };
}

interface Profile {
  permissions: string[];
}

export default async function ForecastPage() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations('forecast');
  const [snapshots, latest, profile] = await Promise.all([
    apiFetch<Snapshot[]>('/forecast/snapshots'),
    apiFetch<LatestDiff>('/forecast/snapshots/latest-diff'),
    apiFetch<Profile>('/auth/me'),
  ]);
  return (
    <div className="space-y-density-section">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">{t('eyebrow')}</p>
          <h1 className="mt-1 text-page-title font-semibold tracking-[-0.035em]">{t('title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('description')}</p>
        </div>
        {canManageForecast(profile.permissions) && <CreateSnapshotButton />}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('latestChanges')}</CardTitle>
        </CardHeader>
        <CardContent>
          {latest.diff && latest.previousSnapshotId ? (
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <div className="rounded-xl bg-muted p-3 sm:col-span-2 lg:col-span-1">
                <p className="text-xs text-muted-foreground">{t('forecastDelta')}</p>
                <p className="mt-1 font-semibold">
                  {formatCurrency(latest.diff.totalForecastDelta, 'USD', locale)}
                </p>
              </div>
              {(
                [
                  ['added', latest.diff.added.length],
                  ['removed', latest.diff.removed.length],
                  ['amountChanges', latest.diff.amountChanges.length],
                  ['stageChanges', latest.diff.stageChanges.length],
                  ['categoryChanges', latest.diff.categoryChanges.length],
                ] as const
              ).map(([key, count]) => (
                <div key={key} className="rounded-xl border p-3">
                  <p className="text-xs text-muted-foreground">{t(key)}</p>
                  <p className="tnum mt-1 text-xl font-semibold">{count}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t('diffEmpty')}</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('history')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {snapshots.map((snapshot) => (
            <div key={snapshot.id} className="flex items-center gap-4 rounded-xl border p-4">
              <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
                <Camera className="size-5" />
              </span>
              <div className="flex-1">
                <p className="font-semibold">
                  {formatDateOnly(snapshot.periodStart, locale)} –{' '}
                  {formatDateOnly(snapshot.periodEnd, locale)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('captured', {
                    date: formatDateTime(snapshot.createdAt, locale),
                  })}
                </p>
              </div>
              <Badge>{t('items', { count: snapshot._count.items })}</Badge>
            </div>
          ))}
          {!snapshots.length && (
            <div className="py-16 text-center">
              <History className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">{t('empty')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
