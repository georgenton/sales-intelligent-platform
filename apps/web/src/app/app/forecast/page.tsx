import { Camera, History } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { CreateSnapshotButton } from '@/components/forecast/create-snapshot-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import { formatDateOnly, formatDateTime } from '@/lib/utils';
import type { AppLocale } from '@/i18n/config';

interface Snapshot {
  id: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  _count: { items: number };
}

export default async function ForecastPage() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations('forecast');
  const snapshots = await apiFetch<Snapshot[]>('/forecast/snapshots');
  return (
    <div className="space-y-density-section">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">{t('eyebrow')}</p>
          <h1 className="mt-1 text-page-title font-semibold tracking-[-0.035em]">{t('title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('description')}</p>
        </div>
        <CreateSnapshotButton />
      </div>
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
