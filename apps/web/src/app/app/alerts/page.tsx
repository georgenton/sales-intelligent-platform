import { AlertList } from '@/components/alerts/alert-list';
import { getTranslations } from 'next-intl/server';
import { apiFetch } from '@/lib/api';
import type { AlertData } from '@/lib/types';

export default async function AlertsPage() {
  const t = await getTranslations('alerts');
  const alerts = await apiFetch<AlertData[]>('/alerts');
  return (
    <div className="space-y-density-section">
      <div>
        <p className="text-sm font-semibold text-primary">{t('eyebrow')}</p>
        <h1 className="mt-1 text-page-title font-semibold tracking-[-0.035em]">{t('title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('summary', { count: alerts.length })}
        </p>
      </div>
      <AlertList alerts={alerts} />
    </div>
  );
}
