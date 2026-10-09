'use client';

import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CircleHelp,
  Plus,
  RefreshCw,
  Target,
  TrendingDown,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { AppLocale } from '@/i18n/config';
import type { ManagerDashboardData, OpportunityData } from '@/lib/types';
import { formatCurrency, formatDateOnly, formatNumber } from '@/lib/utils';
import {
  useCreateCustomerVisitMutation,
  useLinkCustomerVisitMutation,
  useManagerDashboardQuery,
  useOpportunitiesQuery,
  useReferenceDataQuery,
} from '@/store/api';
import { useAppDispatch } from '@/store/hooks';
import { selectOpportunity } from '@/store/ui-slice';

interface ProfileSummary {
  user: { id: string; name: string };
  role: string;
  permissions: string[];
}

type Filters = {
  period: 'current' | 'next';
  brandId?: string;
  line?: string;
  sellerId?: string;
  weekStart?: string;
};

function Metric({
  label,
  value,
  detail,
  tone = 'default',
}: {
  label: string;
  value: string;
  detail: string;
  tone?: 'default' | 'warning' | 'positive';
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        tone === 'warning'
          ? 'border-warning/35 bg-surface-warning-soft'
          : tone === 'positive'
            ? 'border-success/30 bg-surface-success-soft'
            : 'bg-card'
      }`}
    >
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="tnum mt-1 text-kpi-secondary font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function LoadingDashboard() {
  return (
    <div aria-busy="true" className="space-y-4">
      <div className="h-24 animate-pulse rounded-xl bg-muted" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

function OpportunityLinks({
  ids,
  opportunities,
}: {
  ids: string[];
  opportunities: Map<string, OpportunityData>;
}) {
  const t = useTranslations('managerEdgar');
  const dispatch = useAppDispatch();
  if (!ids.length) return <p className="text-xs text-muted-foreground">{t('noDetail')}</p>;
  return (
    <ul className="mt-2 grid gap-2 sm:grid-cols-2">
      {ids.map((id) => {
        const opportunity = opportunities.get(id);
        return (
          <li key={id}>
            <button
              type="button"
              className="w-full rounded-lg border p-2 text-left text-xs hover:border-primary"
              onClick={() => dispatch(selectOpportunity(id))}
            >
              <b>{opportunity?.title ?? t('authorizedRecord')}</b>
              {opportunity ? (
                <span className="mt-1 block text-muted-foreground">
                  {opportunity.customer.name} · {opportunity.seller.name}
                </span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function VisitForm({ data, profile }: { data: ManagerDashboardData; profile: ProfileSummary }) {
  const t = useTranslations('managerEdgar');
  const canRecord = profile.permissions.includes('opportunities.create');
  const { data: reference } = useReferenceDataQuery(undefined, { skip: !canRecord });
  const { data: opportunityList } = useOpportunitiesQuery(undefined, { skip: !canRecord });
  const [createVisit, mutation] = useCreateCustomerVisitMutation();
  const [sellerId, setSellerId] = useState(profile.role === 'SELLER' ? profile.user.id : '');
  const [customerId, setCustomerId] = useState('');
  const [visitedAt, setVisitedAt] = useState(new Date().toISOString().slice(0, 10));
  const [foundOpportunity, setFoundOpportunity] = useState(false);
  const [opportunityId, setOpportunityId] = useState('');
  if (!canRecord) return null;
  const compatibleOpportunities = (opportunityList?.items ?? []).filter(
    (item) =>
      (!sellerId || item.seller.id === sellerId) &&
      (!customerId || item.customer.id === customerId),
  );
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!sellerId || !customerId || !visitedAt) return;
    await createVisit({
      sellerId,
      customerId,
      visitedAt,
      foundOpportunity,
      opportunityId: foundOpportunity && opportunityId ? opportunityId : undefined,
      idempotencyKey: crypto.randomUUID(),
    }).unwrap();
    setCustomerId('');
    setFoundOpportunity(false);
    setOpportunityId('');
  };
  return (
    <details className="rounded-xl border bg-card p-4">
      <summary className="cursor-pointer font-semibold">
        <Plus className="mr-2 inline size-4" aria-hidden />
        {t('recordVisit')}
      </summary>
      <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={(event) => void submit(event)}>
        <label className="text-xs font-semibold">
          {t('seller')}
          <select
            className="mt-1 h-10 w-full rounded-lg border bg-background px-3"
            value={sellerId}
            onChange={(event) => setSellerId(event.target.value)}
            required
          >
            <option value="">{t('select')}</option>
            {data.filters.sellers.map((seller) => (
              <option key={seller.id} value={seller.id}>
                {seller.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold">
          {t('customer')}
          <select
            className="mt-1 h-10 w-full rounded-lg border bg-background px-3"
            value={customerId}
            onChange={(event) => setCustomerId(event.target.value)}
            required
          >
            <option value="">{t('select')}</option>
            {reference?.customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold">
          {t('visitDate')}
          <Input
            className="mt-1"
            type="date"
            value={visitedAt}
            onChange={(event) => setVisitedAt(event.target.value)}
            required
          />
        </label>
        <label className="flex items-center gap-2 self-end rounded-lg border px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={foundOpportunity}
            onChange={(event) => {
              setFoundOpportunity(event.target.checked);
              if (!event.target.checked) setOpportunityId('');
            }}
          />
          {t('foundOpportunity')}
        </label>
        {foundOpportunity ? (
          <label className="text-xs font-semibold sm:col-span-2">
            {t('linkedOpportunityOptional')}
            <select
              className="mt-1 h-10 w-full rounded-lg border bg-background px-3"
              value={opportunityId}
              onChange={(event) => setOpportunityId(event.target.value)}
            >
              <option value="">{t('pendingLink')}</option>
              {compatibleOpportunities.map((opportunity) => (
                <option key={opportunity.id} value={opportunity.id}>
                  {opportunity.customer.name} · {opportunity.title}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <div className="sm:col-span-2">
          <Button disabled={mutation.isLoading} type="submit">
            {mutation.isLoading ? t('saving') : t('saveVisit')}
          </Button>
          {mutation.isSuccess ? (
            <p className="mt-2 text-sm text-success" role="status">
              {t('visitSaved')}
            </p>
          ) : null}
          {mutation.isError ? (
            <p className="mt-2 text-sm text-danger" role="alert">
              {t('visitError')}
            </p>
          ) : null}
        </div>
      </form>
    </details>
  );
}

function PendingVisitLink({
  visit,
  opportunities,
}: {
  visit: ManagerDashboardData['visits'][number];
  opportunities: OpportunityData[];
}) {
  const t = useTranslations('managerEdgar');
  const [opportunityId, setOpportunityId] = useState('');
  const [linkVisit, mutation] = useLinkCustomerVisitMutation();
  const compatible = opportunities.filter(
    (opportunity) =>
      opportunity.seller.id === visit.sellerId && opportunity.customer.id === visit.customerId,
  );
  if (!compatible.length) {
    return <p className="mt-2 text-xs text-warning">{t('linkAfterImport')}</p>;
  }
  return (
    <form
      className="mt-2 flex flex-col gap-2 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        if (opportunityId) void linkVisit({ visitId: visit.id, opportunityId });
      }}
    >
      <label className="min-w-0 flex-1 text-xs font-semibold">
        <span className="sr-only">{t('linkOpportunity')}</span>
        <select
          className="h-9 w-full rounded-lg border bg-background px-2"
          value={opportunityId}
          onChange={(event) => setOpportunityId(event.target.value)}
          required
        >
          <option value="">{t('selectOpportunity')}</option>
          {compatible.map((opportunity) => (
            <option key={opportunity.id} value={opportunity.id}>
              {opportunity.title}
            </option>
          ))}
        </select>
      </label>
      <Button size="sm" type="submit" disabled={!opportunityId || mutation.isLoading}>
        {mutation.isLoading ? t('linking') : t('linkOpportunity')}
      </Button>
      {mutation.isError ? (
        <p className="text-xs text-danger" role="alert">
          {t('linkError')}
        </p>
      ) : null}
    </form>
  );
}

export function ManagerDashboardEdgar({ profile }: { profile: ProfileSummary }) {
  const t = useTranslations('managerEdgar');
  const locale = useLocale() as AppLocale;
  const dispatch = useAppDispatch();
  const [filters, setFilters] = useState<Filters>({ period: 'current' });
  const { data, isLoading, isFetching, isError, refetch } = useManagerDashboardQuery(filters);
  const { data: opportunityList } = useOpportunitiesQuery();
  const canRecordVisits = profile.permissions.includes('opportunities.create');
  const opportunityMap = useMemo(
    () => new Map((opportunityList?.items ?? []).map((item) => [item.id, item])),
    [opportunityList],
  );
  if (isLoading) return <LoadingDashboard />;
  if (isError || !data) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="mx-auto size-6 text-danger" aria-hidden />
          <p className="mt-3 text-sm">{t('loadError')}</p>
          <Button className="mt-3" variant="outline" onClick={() => void refetch()}>
            <RefreshCw className="size-4" aria-hidden /> {t('retry')}
          </Button>
        </CardContent>
      </Card>
    );
  }
  const currency = (value: number | null) =>
    value === null ? t('notAvailable') : formatCurrency(value, data.currency, locale);
  const updateFilter = (key: keyof Filters, value: string) =>
    setFilters((current) => ({ ...current, [key]: value || undefined }));
  const dealsAlerts = data.alerts.filter((alert) => alert.group === 'DEALS');
  const teamAlerts = data.alerts.filter((alert) => alert.group === 'SELLERS_BRANDS');
  const alertObserved = (alert: ManagerDashboardData['alerts'][number]) => {
    const observed =
      alert.observed && typeof alert.observed === 'object'
        ? (alert.observed as Record<string, unknown>)
        : {};
    const number = (key: string) =>
      typeof observed[key] === 'number' ? (observed[key] as number) : null;
    const date = (key: string) =>
      typeof observed[key] === 'string'
        ? formatDateOnly(observed[key] as string, locale)
        : t('notAvailable');
    switch (alert.code) {
      case 'A01':
        return t('alertObserved.A01', {
          previous: currency(number('previous')),
          current: currency(number('current')),
          change:
            number('changePercent') === null
              ? t('notAvailable')
              : `${formatNumber(number('changePercent')!, locale, { maximumFractionDigits: 1 })}%`,
        });
      case 'A02':
        return t('alertObserved.A02', {
          available: currency(number('availablePipeline')),
          required: currency(number('requiredPipeline')),
          difference: currency(number('difference')),
        });
      case 'A03':
        return t('alertObserved.A03', {
          visited: number('visitedCustomers') ?? 0,
          target: number('target') ?? 0,
        });
      case 'A04':
        return t('alertObserved.A04', { date: date('visitedAt') });
      case 'A05':
        return number('daysWithoutProgress') === null
          ? t('alertObserved.A05Missing')
          : t('alertObserved.A05', {
              days: number('daysWithoutProgress')!,
              threshold: number('thresholdDays') ?? 0,
            });
      case 'A06':
        return t('alertObserved.A06', {
          date: date('expectedBillingDate'),
          outstanding: currency(number('outstanding')),
        });
      case 'A07':
        return t('alertObserved.A07', {
          margin:
            number('marginPercent') === null
              ? t('notAvailable')
              : `${formatNumber(number('marginPercent')!, locale, { maximumFractionDigits: 1 })}%`,
          grossProfit: currency(number('grossProfit')),
        });
    }
  };
  return (
    <div className="space-y-4" aria-busy={isFetching}>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-primary">
            {t('eyebrow')}
          </p>
          <h1 className="mt-1 text-page-title font-semibold tracking-[-0.04em]">{t('title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {data.period.label} ·{' '}
            {t('generatedAt', { date: formatDateOnly(data.generatedAt, locale) })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {['TENANT_ADMIN', 'PLATFORM_ADMIN', 'MANAGER'].includes(profile.role) ? (
            <Link
              className={buttonVariants({ variant: 'outline' })}
              href="/app/dashboard?view=review"
            >
              {t('openForecastReview')}
            </Link>
          ) : null}
          {isFetching ? (
            <RefreshCw className="size-5 animate-spin text-primary" aria-label={t('updating')} />
          ) : null}
        </div>
      </header>

      <section
        aria-label={t('filters')}
        className="grid gap-2 rounded-xl border bg-card p-3 sm:grid-cols-2 xl:grid-cols-5"
      >
        <label className="text-xs font-semibold">
          {t('quarter')}
          <select
            className="mt-1 h-10 w-full rounded-lg border bg-background px-3"
            value={filters.period}
            onChange={(event) => updateFilter('period', event.target.value)}
          >
            {data.periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold">
          {t('brand')}
          <select
            className="mt-1 h-10 w-full rounded-lg border bg-background px-3"
            value={filters.brandId ?? ''}
            onChange={(event) => updateFilter('brandId', event.target.value)}
          >
            <option value="">{t('allBrands')}</option>
            {data.filters.brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold">
          {t('line')}
          <select
            className="mt-1 h-10 w-full rounded-lg border bg-background px-3"
            value={filters.line ?? ''}
            onChange={(event) => updateFilter('line', event.target.value)}
          >
            <option value="">{t('allLines')}</option>
            {data.filters.lines.map((line) => (
              <option key={line} value={line}>
                {line}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold">
          {t('seller')}
          <select
            className="mt-1 h-10 w-full rounded-lg border bg-background px-3"
            value={filters.sellerId ?? ''}
            onChange={(event) => updateFilter('sellerId', event.target.value)}
          >
            <option value="">{t('allSellers')}</option>
            {data.filters.sellers.map((seller) => (
              <option key={seller.id} value={seller.id}>
                {seller.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold">
          {t('week')}
          <Input
            className="mt-1"
            type="date"
            value={filters.weekStart ?? data.week.start}
            onChange={(event) => updateFilter('weekStart', event.target.value)}
          />
        </label>
      </section>

      <div
        className={`rounded-xl border p-3 text-sm ${data.importState.partial || data.importState.status === 'NO_PUBLISHED_BATCH' ? 'border-warning/35 bg-surface-warning-soft' : 'border-success/30 bg-surface-success-soft'}`}
        role="status"
      >
        <b>{t('sourceState')}:</b>{' '}
        {data.importState.status === 'NO_PUBLISHED_BATCH'
          ? t('noPublishedBatch')
          : data.importState.partial
            ? t('partialSource')
            : t('publishedSource')}
        {data.importState.sourceCutoff ? ` · ${t('cutoff')} ${data.importState.sourceCutoff}` : ''}
      </div>

      <section aria-labelledby="summary-title">
        <div className="mb-2 flex items-center gap-2">
          <Target className="size-4 text-primary" aria-hidden />
          <h2 id="summary-title" className="text-section-title font-semibold">
            {t('generalSummary')}
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label={t('quota')}
            value={currency(data.summary.quota)}
            detail={data.period.label}
          />
          <Metric
            label={t('billed')}
            value={currency(data.summary.billed)}
            detail={t('authoritativeBilling')}
            tone="positive"
          />
          <Metric
            label={t('forecast')}
            value={currency(data.summary.forecast)}
            detail={t('forecastRule')}
          />
          <Metric
            label={t('backlog')}
            value={currency(data.summary.backlog)}
            detail={t('backlogRule')}
          />
          <Metric
            label={t('closeProjection')}
            value={currency(data.summary.closeProjection)}
            detail={t('projectionRule')}
          />
          <Metric
            label={t('compliance')}
            value={t('inValidation')}
            detail={t('d01Pending')}
            tone="warning"
          />
          <Metric
            label={t('pipeline')}
            value={currency(data.summary.pipeline)}
            detail={t('pipelineRule')}
          />
          <Metric
            label={t('margin')}
            value={
              data.summary.marginPercent === null
                ? t('notAvailable')
                : `${formatNumber(data.summary.marginPercent, locale, { maximumFractionDigits: 1 })}%`
            }
            detail={t('marginDetail', {
              amount: currency(data.summary.marginAmount),
              target: data.summary.marginTarget,
            })}
          />
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <Card>
          <CardHeader>
            <CardTitle>{t('forecastByBrand')}</CardTitle>
            <p className="text-xs text-muted-foreground">{t('brandAliasPending')}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.brandHierarchy.brands.map((brand) => (
              <details key={brand.brandId} className="rounded-xl border p-3">
                <summary className="cursor-pointer font-semibold">
                  {brand.brand} · {currency(brand.forecastAndBacklog)}
                </summary>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
                  <div>
                    <dt className="text-muted-foreground">{t('quota')}</dt>
                    <dd className="tnum font-semibold">{currency(brand.quota)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t('billed')}</dt>
                    <dd className="tnum font-semibold">{currency(brand.billed)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t('pipeline')}</dt>
                    <dd className="tnum font-semibold">{currency(brand.pipeline)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t('forecast')}</dt>
                    <dd className="tnum font-semibold">{currency(brand.forecast)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t('backlog')}</dt>
                    <dd className="tnum font-semibold">{currency(brand.backlog)}</dd>
                  </div>
                </dl>
                <div className="mt-3 space-y-2">
                  {brand.lines.map((line) => (
                    <details key={line.line} className="rounded-lg bg-muted p-2">
                      <summary className="cursor-pointer text-xs font-semibold">
                        {line.line} · {currency(line.forecastAndBacklog)}
                      </summary>
                      <dl className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
                        <div>
                          <dt className="text-muted-foreground">{t('quota')}</dt>
                          <dd className="tnum font-semibold">{currency(line.quota)}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">{t('billed')}</dt>
                          <dd className="tnum font-semibold">{currency(line.billed)}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">{t('pipeline')}</dt>
                          <dd className="tnum font-semibold">{currency(line.pipeline)}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">{t('forecast')}</dt>
                          <dd className="tnum font-semibold">{currency(line.forecast)}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">{t('backlog')}</dt>
                          <dd className="tnum font-semibold">{currency(line.backlog)}</dd>
                        </div>
                      </dl>
                      <OpportunityLinks ids={line.opportunityIds} opportunities={opportunityMap} />
                    </details>
                  ))}
                </div>
              </details>
            ))}
            {!data.brandHierarchy.brands.length ? (
              <p className="text-sm text-muted-foreground">{t('noBrandData')}</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('fourToOne')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`rounded-xl p-4 ${data.coverage.status === 'INSUFFICIENT' ? 'bg-surface-warning-soft' : data.coverage.status === 'SUFFICIENT' ? 'bg-surface-success-soft' : 'bg-muted'}`}
            >
              <p className="font-semibold">{t(`coverage.${data.coverage.status}`)}</p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <dt>{t('explicitBase')}</dt>
                  <dd className="tnum">{currency(data.coverage.baseAmount)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>{t('requiredPipeline')}</dt>
                  <dd className="tnum">{currency(data.coverage.requiredPipeline)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>{t('availablePipeline')}</dt>
                  <dd className="tnum">{currency(data.coverage.availablePipeline)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">{t('fourToOneExplanation')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('weeklyPipeline')}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.weeklyPipeline.status === 'NO_COMPARISON' ? (
              <p className="rounded-xl bg-muted p-4 text-sm">
                <CircleHelp className="mr-2 inline size-4" aria-hidden />
                {t('noComparison')}
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Metric
                    label={t('previousCut')}
                    value={currency(data.weeklyPipeline.previous)}
                    detail={
                      data.weeklyPipeline.previousCutoff
                        ? formatDateOnly(data.weeklyPipeline.previousCutoff, locale)
                        : t('notAvailable')
                    }
                  />
                  <Metric
                    label={t('currentCut')}
                    value={currency(data.weeklyPipeline.current)}
                    detail={
                      data.weeklyPipeline.currentCutoff
                        ? formatDateOnly(data.weeklyPipeline.currentCutoff, locale)
                        : t('notAvailable')
                    }
                    tone={data.weeklyPipeline.droppedMoreThanTenPercent ? 'warning' : 'default'}
                  />
                </div>
                <p className="mt-3 text-sm font-semibold">
                  <TrendingDown className="mr-2 inline size-4" aria-hidden />
                  {data.weeklyPipeline.changePercent === null
                    ? t('notAvailable')
                    : `${data.weeklyPipeline.changePercent.toFixed(1)}%`}
                </p>
                <ul className="mt-2 space-y-2">
                  {data.weeklyPipeline.movements.map((movement) => (
                    <li key={`${movement.opportunityId}-${movement.kind}`}>
                      <button
                        className="w-full rounded-lg border p-2 text-left text-xs hover:border-primary"
                        onClick={() => dispatch(selectOpportunity(movement.opportunityId))}
                      >
                        <b>{t(`movements.${movement.kind}`)}</b> · {currency(movement.delta)}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('stageSegmentation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.stages.map((stage) => (
              <details key={stage.stageCode} className="rounded-xl border p-3">
                <summary className="cursor-pointer text-sm font-semibold">
                  {t(`stages.${stage.stageCode}`)} · {stage.count} · {currency(stage.amount)}
                </summary>
                <OpportunityLinks ids={stage.opportunityIds} opportunities={opportunityMap} />
              </details>
            ))}
            <p className="text-xs text-muted-foreground">{t('billedStageNote')}</p>
          </CardContent>
        </Card>
      </div>

      <section aria-labelledby="team-title" className="space-y-3">
        <h2 id="team-title" className="text-section-title font-semibold">
          {t('sellerPerformance')}
        </h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.sellerPerformance.map((seller) => (
            <Card key={seller.sellerId}>
              <CardHeader>
                <CardTitle>{seller.seller}</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt>{t('pipeline')}</dt>
                    <dd className="tnum">{currency(seller.pipeline)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>{t('forecast')}</dt>
                    <dd className="tnum">{currency(seller.forecast)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>{t('backlog')}</dt>
                    <dd className="tnum">{currency(seller.backlog)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>{t('visitedCustomers')}</dt>
                    <dd>
                      {seller.visitedCustomers}/{seller.visitTarget} ·{' '}
                      {seller.visitStatus === 'IN_PROGRESS' ? t('inProgress') : t('closed')}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>{t('margin')}</dt>
                    <dd>
                      {seller.grossMarginPercent === null
                        ? t('notAvailable')
                        : `${seller.grossMarginPercent.toFixed(1)}%`}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('visitedCustomers')}</CardTitle>
            <p className="text-xs text-muted-foreground">
              <CalendarDays className="mr-1 inline size-4" aria-hidden />
              {data.week.start} — {data.week.end} ·{' '}
              {data.week.closed ? t('closed') : t('inProgress')}
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.visits.map((visit) => (
              <div key={visit.id} className="rounded-xl border p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <b>{visit.customer}</b>
                  <span>{visit.visitedAt}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {visit.seller} ·{' '}
                  {visit.foundOpportunity ? t('yesOpportunity') : t('noOpportunity')}
                </p>
                {visit.opportunity ? (
                  <button
                    className="mt-2 text-xs font-semibold text-primary"
                    onClick={() => dispatch(selectOpportunity(visit.opportunity!.id))}
                  >
                    {visit.opportunity.title}
                  </button>
                ) : visit.linkStatus === 'PENDING_LINK' ? (
                  <>
                    <p className="mt-2 text-xs text-warning">{t('pendingLink')}</p>
                    {canRecordVisits ? (
                      <PendingVisitLink
                        visit={visit}
                        opportunities={opportunityList?.items ?? []}
                      />
                    ) : null}
                  </>
                ) : null}
              </div>
            ))}
            {!data.visits.length ? (
              <p className="text-sm text-muted-foreground">{t('noVisits')}</p>
            ) : null}
            <VisitForm data={data} profile={profile} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('stalled')}</CardTitle>
            <p className="text-xs text-muted-foreground">{t('stalledRule')}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.stalled.map((item) => (
              <button
                key={item.opportunityId}
                className="w-full rounded-xl border p-3 text-left text-sm hover:border-primary"
                onClick={() => dispatch(selectOpportunity(item.opportunityId))}
              >
                <b>{item.title}</b>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {item.seller} · {t(`stages.${item.stageCode}`)} ·{' '}
                  {t('daysWithoutProgress', { count: item.daysWithoutProgress })}
                </span>
              </button>
            ))}
            {!data.stalled.length ? (
              <p className="text-sm text-muted-foreground">{t('noStalled')}</p>
            ) : null}
            <div className="rounded-xl bg-muted p-3 text-xs">
              <b>{t('salesCycle')}:</b> {t('salesCyclePending')}
            </div>
          </CardContent>
        </Card>
      </div>

      <section aria-labelledby="alerts-title">
        <h2 id="alerts-title" className="text-section-title font-semibold">
          {t('alertsTitle')}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">{t('alertsDescription')}</p>
        <div className="mt-3 grid gap-4 xl:grid-cols-2">
          {[
            { title: t('dealAlerts'), rows: dealsAlerts },
            { title: t('teamAlerts'), rows: teamAlerts },
          ].map((group) => (
            <Card key={group.title}>
              <CardHeader>
                <CardTitle>{group.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {group.rows.map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-xl border p-3 ${alert.kind === 'SIGNAL' ? 'border-warning/40 bg-surface-warning-soft' : 'bg-muted'}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <b>
                        {alert.code} · {t(`alerts.${alert.code}.title`)}
                      </b>
                      <span className="text-xs font-semibold">{t(`kinds.${alert.kind}`)}</span>
                    </div>
                    {alert.entity ? <p className="mt-1 text-sm">{alert.entity.label}</p> : null}
                    <p className="mt-2 text-xs font-medium">
                      {t('observed')}: {alertObserved(alert)}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t(`alerts.${alert.code}.rule`)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t('cutoff')}:{' '}
                      {alert.cutoff ? formatDateOnly(alert.cutoff, locale) : t('notAvailable')}
                      {alert.affectedAmount !== null ? ` · ${currency(alert.affectedAmount)}` : ''}
                    </p>
                    {alert.opportunityId ? (
                      <Button
                        className="mt-2"
                        size="sm"
                        variant="outline"
                        onClick={() => dispatch(selectOpportunity(alert.opportunityId!))}
                      >
                        {t('review')}
                      </Button>
                    ) : null}
                  </div>
                ))}
                {!group.rows.length ? (
                  <p className="text-sm text-muted-foreground">
                    <CheckCircle2 className="mr-2 inline size-4 text-success" aria-hidden />
                    {t('noEvaluatedSignals')}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
