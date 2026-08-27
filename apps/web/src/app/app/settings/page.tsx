import { Badge } from '@/components/ui/badge';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import type { ReferenceData } from '@/components/opportunities/opportunity-form';

export default async function SettingsPage() {
  const t = await getTranslations('settings');
  const reference = await apiFetch<ReferenceData>('/opportunities/reference-data');
  const settings = reference.settings as ReferenceData['settings'] & {
    timezone?: string;
    fiscalYearStartMonth?: number;
    fiscalYearEndMonth?: number;
    defaultMarginThreshold?: string;
  };
  const rows = [
    [t('currency'), settings.currency],
    [t('timezone'), settings.timezone ?? '—'],
    [
      t('fiscalYear'),
      `${settings.fiscalYearStartMonth ?? '—'} → ${settings.fiscalYearEndMonth ?? '—'}`,
    ],
    [t('minimumMargin'), `${settings.defaultMarginThreshold ?? '—'}%`],
  ];
  return (
    <div className="space-y-density-section">
      <div>
        <p className="text-sm font-semibold text-primary">{t('eyebrow')}</p>
        <h1 className="mt-1 text-page-title font-semibold tracking-[-0.035em]">{t('title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t('description')}</p>
      </div>
      <Card className="max-w-2xl">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{t('commercialDefaults')}</CardTitle>
          <Badge>{t('tenantScoped')}</Badge>
        </CardHeader>
        <CardContent className="divide-y">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-4 text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-semibold">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
