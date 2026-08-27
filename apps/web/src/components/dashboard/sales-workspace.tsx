'use client';

import {
  Bot,
  CalendarCheck2,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Filter,
  Gauge,
  MessageSquare,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { CreateSnapshotButton } from '@/components/forecast/create-snapshot-button';
import {
  ForecastConfidence,
  QuotaGap,
  QuotaProgress,
  RevenueKPI,
  RiskBadge,
  SalesFunnel,
  SellerPerformance,
  type FunnelStageDatum,
} from '@/components/sales/sales-components';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { AppLocale } from '@/i18n/config';
import type { AlertData, DashboardData, OpportunityData } from '@/lib/types';
import { cn, formatCurrency, formatDateOnly, formatNumber } from '@/lib/utils';
import { useUpdateOpportunityMutation } from '@/store/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  recordForecastDecision,
  recordGuidedDecision,
  selectOpportunity,
  setCopilotContext,
  setCopilotPanelOpen,
  setDashboardFilter,
  setExpandedFunnelStage,
  setExperienceMode,
  togglePriority,
} from '@/store/ui-slice';

interface ProfileSummary {
  user: { id: string; name: string };
  tenant: { name: string };
  role: string;
}

function ScreenHeader({
  eyebrow,
  title,
  meta,
  actions,
}: {
  eyebrow: string;
  title: string;
  meta: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.13em] text-primary">{eyebrow}</p>
        <h1 className="mt-1 text-balance text-page-title font-semibold tracking-[-0.04em]">
          {title}
        </h1>
        <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{meta}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

function FilterBar({ data }: { data: DashboardData }) {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const search = useAppSelector((state) => state.productUi.dashboardFilters.search);
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border bg-card p-2 shadow-[var(--shadow-card)]">
      <label className="flex h-8 items-center gap-2 rounded-lg bg-muted px-3 text-xs">
        <CalendarCheck2 className="size-3.5 text-primary" />
        <span className="sr-only">{t('accessibility.activeFiscalPeriod')}</span>
        <select className="bg-transparent font-semibold outline-none">
          <option>{data.period.label}</option>
        </select>
      </label>
      <label className="relative min-w-[180px] flex-1 sm:max-w-xs">
        <Filter className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) =>
            dispatch(setDashboardFilter({ key: 'search', value: event.target.value }))
          }
          className="h-8 border-0 bg-muted pl-8 text-xs"
          placeholder={t('accessibility.filterView')}
        />
      </label>
      <Badge className="ml-auto bg-secondary text-secondary-foreground">
        {t('common.liveTenantData')}
      </Badge>
    </div>
  );
}

function OpportunityRow({ opportunity }: { opportunity: OpportunityData }) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('opportunities');
  const tSales = useTranslations('sales');
  const dispatch = useAppDispatch();
  return (
    <button
      onClick={() => dispatch(selectOpportunity(opportunity.id))}
      className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-xl border p-3 text-left transition-colors hover:border-primary/35 hover:bg-muted/50"
    >
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <b className="truncate text-sm">
            {opportunity.customer.name} · {opportunity.title}
          </b>
          {opportunity.alerts[0] && (
            <RiskBadge
              severity={opportunity.alerts[0].severity}
              code={opportunity.alerts[0].code}
            />
          )}
        </span>
        <span className="mt-1 block text-xs text-muted-foreground">
          {opportunity.stage.name} · {opportunity.seller.name} · {t('expectedClose')}{' '}
          {formatDateOnly(opportunity.expectedCloseDate, locale)}
        </span>
      </span>
      <span className="text-right">
        <b className="tnum block text-sm">
          {formatCurrency(opportunity.estimatedAmount, opportunity.currency, locale)}
        </b>
        <span className="text-[11px] text-muted-foreground">
          {tSales('health')} {opportunity.health.score}
        </span>
      </span>
    </button>
  );
}

function FunnelCard({
  data,
  opportunities,
}: {
  data: DashboardData;
  opportunities: OpportunityData[];
}) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('sales');
  const tCommon = useTranslations('common');
  const dispatch = useAppDispatch();
  const selectedStage = useAppSelector((state) => state.productUi.expandedFunnelStage);
  const stages = useMemo<FunnelStageDatum[]>(
    () =>
      data.funnel.map((stage) => {
        const rows = opportunities.filter((opportunity) => opportunity.stage.name === stage.stage);
        const risky = rows.filter((opportunity) => opportunity.alerts.length > 0);
        return {
          ...stage,
          atRisk: risky.length,
          atRiskAmount: risky.reduce(
            (total, opportunity) => total + opportunity.estimatedAmount,
            0,
          ),
          // The list DTO does not expose stage-entered time or a slippage prediction.
          // Keep these metrics unavailable instead of fabricating them from updatedAt.
          avgDaysInStage: undefined,
          likelyToSlip: undefined,
        };
      }),
    [data.funnel, opportunities],
  );
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle>{t('salesFunnel')}</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">{t('funnelHint')}</p>
        </div>
        <RiskBadge severity="HIGH" label={t('atRisk', { count: data.kpis.atRisk })} />
      </CardHeader>
      <CardContent>
        <SalesFunnel
          stages={stages}
          currency={data.currency}
          selectedStage={selectedStage}
          onSelectStage={(stage) => dispatch(setExpandedFunnelStage(stage))}
          renderDetail={(stage) => {
            const rows = opportunities.filter(
              (opportunity) => opportunity.stage.name === stage?.stage,
            );
            return (
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold">
                    {stage?.stage} · {tCommon('opportunityCount', { count: stage?.count ?? 0 })}
                  </h3>
                  <Badge>{formatCurrency(stage?.amount ?? 0, data.currency, locale)}</Badge>
                  <RiskBadge severity="HIGH" label={t('atRisk', { count: stage?.atRisk ?? 0 })} />
                </div>
                <div className="grid gap-2 lg:grid-cols-2">
                  {rows.slice(0, 6).map((opportunity) => (
                    <OpportunityRow key={opportunity.id} opportunity={opportunity} />
                  ))}
                </div>
                {!rows.length && (
                  <p className="text-xs text-muted-foreground">{t('drilldownEmpty')}</p>
                )}
              </div>
            );
          }}
        />
      </CardContent>
    </Card>
  );
}

function ManagerStandard({
  data,
  opportunities,
}: {
  data: DashboardData;
  opportunities: OpportunityData[];
}) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('manager');
  const dispatch = useAppDispatch();
  const [expandedSeller, setExpandedSeller] = useState<string | null>(null);
  const risky = opportunities
    .filter((opportunity) => opportunity.alerts.length > 0)
    .sort((a, b) => b.estimatedAmount - a.estimatedAmount);
  const attainment = data.kpis.quota ? (data.kpis.forecast / data.kpis.quota) * 100 : 0;
  return (
    <>
      <ScreenHeader
        eyebrow={t('eyebrow')}
        title={t('question')}
        meta={t('periodMeta', { period: data.period.label })}
        actions={
          <>
            <CreateSnapshotButton />
            <Button size="sm" onClick={() => dispatch(setExperienceMode('REVIEW'))}>
              <ClipboardCheck className="size-4" />
              {t('forecastReview')}
            </Button>
          </>
        }
      />
      <div className="grid gap-density-grid xl:grid-cols-[minmax(0,1.7fr)_minmax(260px,0.82fr)]">
        <div className="space-y-density-grid">
          <div className="grid gap-density-grid sm:grid-cols-[1.35fr_1fr_1fr]">
            <RevenueKPI
              hero
              label={t('forecast')}
              value={data.kpis.forecast}
              currency={data.currency}
              detail={t('likelyAttainment', {
                value: formatNumber(attainment, locale, { maximumFractionDigits: 1 }),
              })}
              icon={<TrendingUp className="size-4" />}
            />
            <RevenueKPI
              label={t('quota')}
              value={data.kpis.quota}
              currency={data.currency}
              detail={data.period.label}
            />
            <RevenueKPI
              label={t('gap')}
              value={data.kpis.gap}
              currency={data.currency}
              tone="risk"
              detail={t('remainingToQuota')}
              icon={<Target className="size-4" />}
            />
          </div>
          <Card>
            <CardContent className="p-density-card">
              {data.kpis.quota > 0 ? (
                <QuotaProgress
                  state="AVAILABLE"
                  quota={data.kpis.quota}
                  billed={data.kpis.billed}
                  forecast={Math.max(0, data.kpis.forecast - data.kpis.billed)}
                  currency={data.currency}
                  label={t('teamQuotaAttainment')}
                />
              ) : (
                <QuotaProgress
                  state="NOT_CONFIGURED"
                  currency={data.currency}
                  label={t('teamQuotaAttainment')}
                />
              )}
            </CardContent>
          </Card>
          <div className="grid gap-density-grid sm:grid-cols-3">
            <RevenueKPI
              label={t('billed')}
              value={data.kpis.billed}
              currency={data.currency}
              tone="positive"
              detail={t('ofQuota', {
                value: formatNumber(data.kpis.billingAttainment, locale, {
                  maximumFractionDigits: 1,
                }),
              })}
            />
            <RevenueKPI
              label={t('commit')}
              value={data.kpis.commit}
              currency={data.currency}
              detail={t('currentQuarter')}
            />
            <RevenueKPI
              label={t('coverage')}
              value={data.kpis.pipelineCoverage}
              format="multiple"
              detail={t('pipelineGap')}
            />
          </div>
        </div>
        <div className="space-y-density-grid">
          <Card className="border-primary/25 bg-copilot text-sidebar-foreground">
            <CardContent className="p-density-card">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-copilot-accent">
                <Sparkles className="size-4" />
                {t('commandInsight')}
              </p>
              <p className="mt-3 text-lg font-semibold">
                {data.kpis.gap > 0
                  ? t('gapRemains', {
                      amount: formatCurrency(data.kpis.gap, data.currency, locale),
                    })
                  : t('forecastCovers')}
              </p>
              <p className="mt-2 text-sm leading-6 text-sidebar-muted">
                {t('openSignals', { count: data.kpis.atRisk })}
              </p>
              <Button
                size="sm"
                className="mt-4"
                onClick={() => dispatch(setCopilotPanelOpen(true))}
              >
                <Bot className="size-4" />
                {t('explainPosition')}
              </Button>
            </CardContent>
          </Card>
          <QuotaGap
            gap={data.kpis.gap}
            currency={data.currency}
            interpretation={t('riskEvidence', { count: risky.length })}
            drivers={risky.slice(0, 3).map((opportunity) => ({
              label: opportunity.customer.name,
              amount: opportunity.estimatedAmount,
            }))}
          />
        </div>
      </div>
      <div className="mt-4">
        <FunnelCard data={data} opportunities={opportunities} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
        <Card>
          <CardHeader>
            <CardTitle>{t('highRisk')}</CardTitle>
            <p className="text-xs text-muted-foreground">{t('evidenceSignals')}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {risky.slice(0, 6).map((opportunity) => (
              <OpportunityRow key={opportunity.id} opportunity={opportunity} />
            ))}
            {!risky.length && <p className="text-sm text-muted-foreground">{t('noRisk')}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('brands')}</CardTitle>
            <p className="text-xs text-muted-foreground">{t('pipelineContribution')}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.byBrand.slice(0, 6).map((brand) => (
              <div
                key={brand.brand}
                className="grid grid-cols-[80px_minmax(0,1fr)_auto] items-center gap-3 text-xs"
              >
                <span className="truncate font-semibold">{brand.brand}</span>
                <span className="h-2 overflow-hidden rounded-full bg-surface-sunken">
                  <span
                    className="block h-full bg-chart-2"
                    style={{
                      width: `${Math.max(8, (brand.amount / (data.byBrand[0]?.amount || 1)) * 100)}%`,
                    }}
                  />
                </span>
                <b className="tnum">{formatCurrency(brand.amount, data.currency, locale)}</b>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{t('sellerPerformance')}</CardTitle>
          <p className="text-xs text-muted-foreground">{t('sellerDataNote')}</p>
        </CardHeader>
        <CardContent>
          <SellerPerformance
            sellers={data.sellerPerformance}
            currency={data.currency}
            onSelect={(seller) =>
              setExpandedSeller(expandedSeller === seller.seller ? null : seller.seller)
            }
          />
          {expandedSeller && (
            <div className="mt-4 rounded-xl bg-muted p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{expandedSeller}</p>
                  <p className="text-xs text-muted-foreground">{t('expandedInline')}</p>
                </div>
                <Button size="sm" variant="outline" disabled title={t('messagingUnavailable')}>
                  <MessageSquare className="size-4" />
                  {t('askSeller')}
                </Button>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-2">
                {opportunities
                  .filter(
                    (opportunity) =>
                      opportunity.seller.name === expandedSeller && opportunity.alerts.length,
                  )
                  .map((opportunity) => (
                    <OpportunityRow key={opportunity.id} opportunity={opportunity} />
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function SellerStandard({
  data,
  opportunities,
  profile,
}: {
  data: DashboardData;
  opportunities: OpportunityData[];
  profile: ProfileSummary;
}) {
  const t = useTranslations('seller');
  const tCommon = useTranslations('common');
  const tValue = useTranslations('common.value');
  const dispatch = useAppDispatch();
  const pipeline = opportunities.reduce(
    (total, opportunity) => total + opportunity.estimatedAmount,
    0,
  );
  const commit = opportunities
    .filter((opportunity) => opportunity.forecastCategory === 'COMMIT')
    .reduce((total, opportunity) => total + opportunity.estimatedAmount, 0);
  const risky = opportunities
    .filter((opportunity) => opportunity.alerts.length)
    .sort((a, b) => b.estimatedAmount - a.estimatedAmount);
  const personalFunnel = Object.values(
    opportunities.reduce<Record<string, DashboardData['funnel'][number]>>(
      (current, opportunity) => {
        const existing = current[opportunity.stage.id] ?? {
          stage: opportunity.stage.name,
          probability: opportunity.stage.probability,
          count: 0,
          amount: 0,
        };
        existing.count += 1;
        existing.amount += opportunity.estimatedAmount;
        current[opportunity.stage.id] = existing;
        return current;
      },
      {},
    ),
  ).sort((left, right) => left.probability - right.probability);
  return (
    <>
      <ScreenHeader
        eyebrow={t('eyebrow')}
        title={t('todayQuestion', { name: profile.user.name.split(' ')[0] ?? profile.user.name })}
        meta={t('periodMeta', { period: data.period.label })}
        actions={
          <Button size="sm" onClick={() => dispatch(setExperienceMode('FOCUS'))}>
            <Target className="size-4" />
            {t('startFocus')}
          </Button>
        }
      />
      <div className="grid gap-density-grid lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.8fr)]">
        <div className="space-y-density-grid">
          <div className="grid gap-density-grid sm:grid-cols-3">
            <RevenueKPI
              hero
              label={t('likelyAttainment')}
              value={tValue('notAvailable')}
              format="raw"
              detail={t('quotaUnavailable')}
              icon={<Gauge className="size-4" />}
            />
            <RevenueKPI
              label={t('myPipeline')}
              value={pipeline}
              currency={data.currency}
              detail={tCommon('opportunityCount', { count: opportunities.length })}
            />
            <RevenueKPI
              label={t('myCommit')}
              value={commit}
              currency={data.currency}
              detail={t('explicitCategory')}
            />
          </div>
          <FunnelCard
            data={{ ...data, funnel: personalFunnel, kpis: { ...data.kpis, atRisk: risky.length } }}
            opportunities={opportunities}
          />
        </div>
        <div className="space-y-density-grid">
          <QuotaGap
            gap={null}
            currency={data.currency}
            interpretation={t('personalQuotaRequired')}
          />
          <Card>
            <CardHeader>
              <CardTitle>{t('focusToday')}</CardTitle>
              <p className="text-xs text-muted-foreground">{t('highestValueGaps')}</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {risky.slice(0, 3).map((opportunity) => (
                <OpportunityRow key={opportunity.id} opportunity={opportunity} />
              ))}
              {!risky.length && <p className="text-sm text-muted-foreground">{t('noRisk')}</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function SellerFocus({
  data,
  opportunities,
}: {
  data: DashboardData;
  opportunities: OpportunityData[];
}) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('seller.focus');
  const tAlertMessages = useTranslations('alerts.messages');
  const dispatch = useAppDispatch();
  const completed = useAppSelector((state) => state.productUi.completedPriorities);
  const priorities = opportunities.filter((opportunity) => opportunity.alerts.length).slice(0, 3);
  const impacted = priorities
    .filter((opportunity) => completed.includes(opportunity.id))
    .reduce((total, opportunity) => total + opportunity.estimatedAmount, 0);
  return (
    <>
      <ScreenHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        meta={t('meta', {
          completed: completed.length,
          amount: formatCurrency(impacted, data.currency, locale),
        })}
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(setExperienceMode('STANDARD'))}
            >
              {t('leave')}
            </Button>
            <Button size="sm" onClick={() => dispatch(setExperienceMode('GUIDED'))}>
              {t('startGuided')} <ChevronRight className="size-4" />
            </Button>
          </>
        }
      />
      <div className="mx-auto max-w-4xl space-y-3">
        {priorities.map((opportunity, index) => {
          const done = completed.includes(opportunity.id);
          return (
            <Card
              key={opportunity.id}
              className={cn(done && 'border-success/30 bg-surface-success-soft')}
            >
              <CardContent className="flex flex-col gap-3 p-density-card sm:flex-row sm:items-center">
                <button
                  aria-label={t(done ? 'reopenPriority' : 'completePriority', {
                    number: index + 1,
                  })}
                  aria-pressed={done}
                  onClick={() => dispatch(togglePriority(opportunity.id))}
                  className={cn(
                    'grid size-10 shrink-0 place-items-center rounded-full border-2',
                    done
                      ? 'border-success bg-success text-on-strong'
                      : 'border-primary text-primary',
                  )}
                >
                  {done ? <Check className="size-5" /> : index + 1}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className={cn('font-semibold', done && 'line-through')}>
                      {opportunity.customer.name} · {opportunity.title}
                    </h2>
                    {opportunity.alerts[0] && (
                      <RiskBadge
                        severity={opportunity.alerts[0].severity}
                        code={opportunity.alerts[0].code}
                      />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {opportunity.alerts[0] && tAlertMessages.has(opportunity.alerts[0].code)
                      ? tAlertMessages(opportunity.alerts[0].code)
                      : opportunity.alerts[0]?.message}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <b className="tnum block">
                    {formatCurrency(opportunity.estimatedAmount, opportunity.currency, locale)}
                  </b>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dispatch(selectOpportunity(opportunity.id))}
                  >
                    {t('openContext')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {priorities.length < 3 && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              <CheckCircle2 className="mx-auto mb-2 size-6 text-success" />
              {t('available', { count: priorities.length })}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

function SellerGuided({ opportunities }: { opportunities: OpportunityData[] }) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('guided');
  const tAlertMessages = useTranslations('alerts.messages');
  const dispatch = useAppDispatch();
  const decisions = useAppSelector((state) => state.productUi.guidedReviewProgress);
  const [index, setIndex] = useState(0);
  const [other, setOther] = useState('');
  const queue = opportunities.filter((opportunity) => opportunity.alerts.length);
  const opportunity = queue[index];
  const decide = (action: string) => {
    if (!opportunity) return;
    dispatch(recordGuidedDecision({ opportunityId: opportunity.id, action }));
    setOther('');
    setIndex((value) => Math.min(queue.length - 1, value + 1));
  };
  if (!opportunity)
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <CheckCircle2 className="mx-auto size-8 text-success" />
          <h1 className="mt-3 text-xl font-semibold">{t('clear')}</h1>
        </CardContent>
      </Card>
    );
  const alert = opportunity.alerts[0];
  const recommendedId = alert?.code.includes('PO')
    ? 'REQUEST_PO'
    : alert?.code.includes('MARGIN')
      ? 'REVIEW_MARGIN'
      : 'CONTACT_CUSTOMER';
  const actions = [
    {
      id: recommendedId,
      label:
        recommendedId === 'REQUEST_PO'
          ? t('requestPo')
          : recommendedId === 'REVIEW_MARGIN'
            ? t('reviewMargin')
            : t('contactCustomer'),
    },
    { id: 'UPDATE_NEXT_STEP', label: t('updateNextStep') },
    { id: 'SCHEDULE_REVIEW', label: t('scheduleReview') },
    { id: 'ASK_MANAGER', label: t('askManager') },
  ];
  return (
    <>
      <ScreenHeader
        eyebrow={t('title')}
        title={t('position', { current: index + 1, total: queue.length })}
        meta={t('meta', { count: Object.keys(decisions).length })}
        actions={
          <Button variant="ghost" size="sm" onClick={() => dispatch(setExperienceMode('STANDARD'))}>
            {t('leave')}
          </Button>
        }
      />
      <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle className="text-lg">
                {opportunity.customer.name} · {opportunity.title}
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {opportunity.stage.name} ·{' '}
                {t('closes', { date: formatDateOnly(opportunity.expectedCloseDate, locale) })}
              </p>
            </div>
            <b className="tnum text-xl">
              {formatCurrency(opportunity.estimatedAmount, opportunity.currency, locale)}
            </b>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl bg-surface-warning-soft p-4">
              <RiskBadge
                severity={alert?.severity ?? 'WARNING'}
                code={alert?.code ?? 'EVIDENCE_CHECK'}
              />
              <p className="mt-2 text-sm text-muted-foreground">
                {alert && tAlertMessages.has(alert.code)
                  ? tAlertMessages(alert.code)
                  : (alert?.message ?? t('evidenceReview'))}
              </p>
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              {t('chooseAction')}
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => decide(action.id)}
                  className={cn(
                    'rounded-xl border p-3 text-left text-sm font-semibold hover:border-primary',
                    action.id === recommendedId &&
                      'border-primary bg-surface-brand-soft text-primary',
                  )}
                >
                  <span className="block">{action.label}</span>
                  {action.id === recommendedId && (
                    <span className="mt-1 block text-[10px] uppercase tracking-[0.1em]">
                      {t('recommended')}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Input
                value={other}
                onChange={(event) => setOther(event.target.value)}
                placeholder={t('other')}
              />
              <Button
                variant="outline"
                disabled={!other.trim()}
                onClick={() => decide(`CUSTOM:${other}`)}
              >
                {t('record')}
              </Button>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIndex((value) => Math.min(queue.length - 1, value + 1))}
              >
                {t('skip')}
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    dispatch(setCopilotContext({ page: 'guided', opportunityId: opportunity.id }));
                    dispatch(setCopilotPanelOpen(true));
                  }}
                >
                  <Bot className="size-4" />
                  {t('askCopilot')}
                </Button>
                <Button size="sm" onClick={() => decide(recommendedId)}>
                  {t('chooseRecommendation')} <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{t('coachingContext')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-6">{t('coachingCopy')}</p>
            <ForecastConfidence
              sellerCategory={opportunity.forecastCategory}
              state="INSUFFICIENT_DATA"
              rationale={
                alert && tAlertMessages.has(alert.code)
                  ? tAlertMessages(alert.code)
                  : opportunity.health.factors[0]?.message
              }
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => dispatch(selectOpportunity(opportunity.id))}
            >
              {t('openOpportunity')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function ForecastReview({
  data,
  opportunities,
}: {
  data: DashboardData;
  opportunities: OpportunityData[];
}) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('review');
  const tAction = useTranslations('common.action');
  const tMode = useTranslations('common.mode');
  const tAlertMessages = useTranslations('alerts.messages');
  const dispatch = useAppDispatch();
  const decisions = useAppSelector((state) => state.productUi.forecastReviewProgress);
  const [updateOpportunity, mutation] = useUpdateOpportunityMutation();
  const [index, setIndex] = useState(0);
  const [note, setNote] = useState('');
  const queue = opportunities
    .filter((opportunity) => opportunity.forecastCategory === 'COMMIT' || opportunity.alerts.length)
    .sort((a, b) => b.estimatedAmount - a.estimatedAmount);
  const opportunity = queue[index];
  const decide = async (action: 'KEEP_COMMIT' | 'MOVE_UPSIDE' | 'ASK_SELLER' | 'ADD_NOTE') => {
    if (!opportunity) return;
    if (action === 'MOVE_UPSIDE')
      await updateOpportunity({
        id: opportunity.id,
        changes: { forecastCategory: 'BEST_CASE' },
      }).unwrap();
    if (action === 'ADD_NOTE' && note.trim())
      await updateOpportunity({ id: opportunity.id, changes: { notes: note.trim() } }).unwrap();
    dispatch(recordForecastDecision({ opportunityId: opportunity.id, action }));
    setNote('');
    setIndex((value) => Math.min(queue.length - 1, value + 1));
  };
  if (!opportunity)
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <CheckCircle2 className="mx-auto size-8 text-success" />
          <h1 className="mt-3 text-xl font-semibold">{t('clear')}</h1>
        </CardContent>
      </Card>
    );
  return (
    <>
      <ScreenHeader
        eyebrow={t('title')}
        title={t('position', {
          period: data.period.label,
          current: index + 1,
          total: queue.length,
        })}
        meta={t('meta', { count: Object.keys(decisions).length })}
        actions={
          <Button variant="ghost" size="sm" onClick={() => dispatch(setExperienceMode('STANDARD'))}>
            {t('leave')}
          </Button>
        }
      />
      <div className="mb-4 rounded-xl border border-primary/25 bg-surface-brand-soft px-4 py-3 text-sm">
        <b>{tMode('REVIEW')}</b> · {t('guard')}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle className="text-lg">
                {opportunity.customer.name} · {opportunity.title}
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {opportunity.seller.name} · {opportunity.stage.name}
              </p>
            </div>
            <b className="tnum text-2xl">
              {formatCurrency(opportunity.estimatedAmount, opportunity.currency, locale)}
            </b>
          </CardHeader>
          <CardContent className="space-y-4">
            <ForecastConfidence
              sellerCategory={opportunity.forecastCategory}
              state="INSUFFICIENT_DATA"
              rationale={opportunity.alerts
                .map((alert) =>
                  tAlertMessages.has(alert.code) ? tAlertMessages(alert.code) : alert.message,
                )
                .join(' ')}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border p-3">
                <p className="text-xs font-semibold text-success">{t('evidence')}</p>
                <p className="mt-2 text-sm">
                  {opportunity.poNumber
                    ? t('poRecorded', { po: opportunity.poNumber })
                    : t('stageRecorded')}
                </p>
              </div>
              <div className="rounded-xl border p-3">
                <p className="text-xs font-semibold text-warning">{t('missingEvidence')}</p>
                <p className="mt-2 text-sm">
                  {opportunity.poNumber ? t('validateActivity') : t('poMissing')}
                </p>
              </div>
            </div>
            {opportunity.alerts.map((alert) => (
              <div key={alert.id} className="rounded-xl bg-surface-danger-soft p-3">
                <RiskBadge severity={alert.severity} code={alert.code} />
                <p className="mt-2 text-xs text-muted-foreground">
                  {tAlertMessages.has(alert.code) ? tAlertMessages(alert.code) : alert.message}
                </p>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={mutation.isLoading} onClick={() => decide('KEEP_COMMIT')}>
                {t('keepCommit')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={mutation.isLoading}
                onClick={() => decide('MOVE_UPSIDE')}
              >
                {t('moveUpside')}
              </Button>
              <Button variant="outline" size="sm" onClick={() => decide('ASK_SELLER')}>
                <MessageSquare className="size-4" />
                {t('askSeller')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIndex((value) => Math.min(queue.length - 1, value + 1))}
              >
                {tAction('next')}
              </Button>
            </div>
            {mutation.isError && (
              <p role="alert" className="text-sm text-danger">
                {t('saveError')}
              </p>
            )}
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('managerNote')}</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="min-h-28 w-full rounded-xl border bg-background p-3 text-sm"
                placeholder={t('notePlaceholder')}
              />
              <Button
                className="mt-2 w-full"
                variant="outline"
                disabled={!note.trim() || mutation.isLoading}
                onClick={() => decide('ADD_NOTE')}
              >
                {t('addNote')}
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('stageHistory')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t('historyHint')}</p>
              <Button
                variant="outline"
                className="mt-3 w-full"
                onClick={() => dispatch(selectOpportunity(opportunity.id))}
              >
                {t('openDrawer')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export function SalesWorkspace({
  data,
  opportunities,
  alerts,
  profile,
}: {
  data: DashboardData;
  opportunities: OpportunityData[];
  alerts: AlertData[];
  profile: ProfileSummary;
}) {
  const mode = useAppSelector((state) => state.productUi.experienceMode);
  const search = useAppSelector((state) => state.productUi.dashboardFilters.search);
  const visible = useMemo(
    () =>
      opportunities.filter(
        (opportunity) =>
          !search ||
          `${opportunity.title} ${opportunity.customer.name} ${opportunity.seller.name}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [opportunities, search],
  );
  const seller = profile.role === 'SELLER';
  return (
    <div data-experience-mode={mode.toLowerCase()}>
      <FilterBar data={data} />
      {seller && mode === 'FOCUS' ? (
        <SellerFocus data={data} opportunities={visible} />
      ) : seller && mode === 'GUIDED' ? (
        <SellerGuided opportunities={visible} />
      ) : seller ? (
        <SellerStandard data={data} opportunities={visible} profile={profile} />
      ) : mode === 'REVIEW' ? (
        <ForecastReview data={data} opportunities={visible} />
      ) : (
        <ManagerStandard
          data={{ ...data, kpis: { ...data.kpis, atRisk: alerts.length } }}
          opportunities={visible}
        />
      )}
    </div>
  );
}
