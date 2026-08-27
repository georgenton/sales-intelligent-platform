import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getLocale, getTranslations } from 'next-intl/server';
import type { AppLocale } from '@/i18n/config';
import { apiFetch } from '@/lib/api';
import type { DashboardData } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export default async function AnalyticsPage() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations('analytics');
  const tSales = await getTranslations('sales');
  const tRole = await getTranslations('common.role');
  const dashboard = await apiFetch<DashboardData>('/analytics/dashboard');
  return (
    <div className="space-y-density-section">
      <div>
        <p className="text-sm font-semibold text-primary">{t('eyebrow')}</p>
        <h1 className="mt-1 text-page-title font-semibold tracking-[-0.035em]">{t('title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('description', { period: dashboard.period.label })}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('sellerPerformance')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="h-density-row py-2">{tRole('SELLER')}</th>
                  <th>{tSales('opportunities')}</th>
                  <th>{tSales('pipeline')}</th>
                  <th>{tSales('commit')}</th>
                  <th>{tSales('commitMix')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dashboard.sellerPerformance.map((seller) => (
                  <tr key={seller.seller}>
                    <td className="h-density-row py-2 font-semibold">{seller.seller}</td>
                    <td>{seller.opportunities}</td>
                    <td>{formatCurrency(seller.pipeline, dashboard.currency, locale)}</td>
                    <td>{formatCurrency(seller.commit, dashboard.currency, locale)}</td>
                    <td>
                      {seller.pipeline
                        ? `${((seller.commit / seller.pipeline) * 100).toFixed(1)}%`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
