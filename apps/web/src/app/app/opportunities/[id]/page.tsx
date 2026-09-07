import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  CircleGauge,
  Landmark,
  PackageOpen,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { UpdateOpportunityPanel } from '@/components/opportunities/update-opportunity-panel';
import { QualificationPanel } from '@/components/opportunities/qualification-panel';
import type { ReferenceData } from '@/components/opportunities/opportunity-form';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import type { OpportunityData } from '@/lib/types';
import type { AppLocale } from '@/i18n/config';
import { cn, formatCurrency, formatDateOnly, formatDateTime } from '@/lib/utils';
import { commercialStageLabel } from '@/lib/commercial';

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations('opportunities');
  const tStatus = await getTranslations('common.status');
  const tCategory = await getTranslations('common.forecastCategory');
  const tValue = await getTranslations('common.value');
  const tAlertCodes = await getTranslations('alerts.codes');
  const tAlertMessages = await getTranslations('alerts.messages');
  const [opportunity, reference] = await Promise.all([
    apiFetch<OpportunityData>(`/opportunities/${id}`),
    apiFetch<ReferenceData>('/opportunities/reference-data'),
  ]);
  return (
    <div className="space-y-density-section">
      <div>
        <Link
          href="/app/opportunities"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t('back')}
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{tStatus(opportunity.status)}</Badge>
              <Badge className="bg-secondary text-secondary-foreground">
                {opportunity.stage.code}% · {commercialStageLabel(opportunity.stage, locale)}
              </Badge>
              <Badge>{tCategory(opportunity.forecastCategory)}</Badge>
            </div>
            <h1 className="mt-3 text-page-title font-semibold tracking-[-0.035em]">
              {opportunity.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {opportunity.customer.name}
              {opportunity.partner
                ? ` · ${t('viaPartner', { partner: opportunity.partner.name })}`
                : ''}
            </p>
          </div>
          <div className="rounded-2xl border bg-card px-5 py-4 text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('estimatedValue')}
            </p>
            <p className="mt-1 text-3xl font-semibold">
              {formatCurrency(opportunity.estimatedAmount, opportunity.currency, locale)}
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CircleGauge className="size-4" />
              {t('forecastHealth')}
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span
                className={cn(
                  'text-3xl font-semibold',
                  opportunity.health.status === 'HEALTHY'
                    ? 'text-success'
                    : opportunity.health.status === 'AT_RISK'
                      ? 'text-warning'
                      : 'text-danger',
                )}
              >
                {opportunity.health.score}
              </span>
              <span className="pb-1 text-xs text-muted-foreground">/ 100</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CircleDollarSign className="size-4" />
              {t('margin')}
            </div>
            <p className="mt-3 text-2xl font-semibold">
              {opportunity.grossMarginPercent?.toFixed(1) ?? '—'}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <UserRound className="size-4" />
              {t('seller')}
            </div>
            <p className="mt-3 text-base font-semibold">{opportunity.seller.name}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="size-4" />
              {t('expectedClose')}
            </div>
            <p className="mt-3 text-base font-semibold">
              {formatDateOnly(opportunity.expectedCloseDate, locale)}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <QualificationPanel opportunityId={opportunity.id} />
          <Card>
            <CardHeader>
              <CardTitle>{t('products')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {opportunity.lineItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl border p-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
                    <PackageOpen className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{item.brand.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <p className="font-semibold tabular-nums">
                    {formatCurrency(item.amount, opportunity.currency, locale)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
          {opportunity.alerts.length > 0 && (
            <Card className="border-danger/25">
              <CardHeader>
                <CardTitle>{t('activeRisk')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {opportunity.alerts.map((alert) => (
                  <div key={alert.id} className="rounded-xl bg-surface-danger-soft p-3">
                    <div className="flex items-center gap-2">
                      <Badge className="border-danger/25 bg-card text-danger">
                        {tStatus(alert.severity)}
                      </Badge>
                      <p className="text-sm font-semibold">
                        {tAlertCodes.has(alert.code)
                          ? tAlertCodes(alert.code)
                          : alert.code.replaceAll('_', ' ')}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-danger">
                      {tAlertMessages.has(alert.code) ? tAlertMessages(alert.code) : alert.message}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle>{t('stageHistory')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {opportunity.stageHistory?.map((entry) => (
                  <li key={entry.id} className="relative border-l-2 border-secondary pl-5">
                    <span className="absolute top-1 -left-[5px] size-2 rounded-full bg-primary" />
                    <p className="text-sm font-semibold">
                      {entry.fromStage ? `${commercialStageLabel(entry.fromStage, locale)} → ` : ''}
                      {commercialStageLabel(entry.toStage, locale)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {entry.changedBy.name} · {formatDateTime(entry.changedAt, locale)}
                    </p>
                    {entry.reason && (
                      <p className="mt-1 text-xs text-muted-foreground">{entry.reason}</p>
                    )}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('auditTrail')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {opportunity.auditTrail?.map((event) => (
                <div key={event.id} className="flex items-center gap-3 border-b pb-3 last:border-0">
                  <Landmark className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold">{event.action.replaceAll('_', ' ')}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.actor?.name ?? tValue('system')} ·{' '}
                      {formatDateTime(event.occurredAt, locale)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <UpdateOpportunityPanel opportunity={opportunity} reference={reference} />
      </div>
    </div>
  );
}
