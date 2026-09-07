'use client';

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  CircleAlert,
  Gauge,
  Minus,
  OctagonAlert,
  ShieldAlert,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { AppLocale } from '@/i18n/config';
import { cn, formatCurrency } from '@/lib/utils';
import {
  resolveForecastConfidence,
  resolveQuotaProgress,
  type ForecastConfidenceState,
  type QuotaProgressState,
} from './sales-component-contracts';

export function RevenueKPI({
  label,
  value,
  currency = 'USD',
  format = 'currency',
  detail,
  delta,
  deltaLabel,
  tone = 'default',
  hero,
  icon,
  className,
}: HTMLAttributes<HTMLDivElement> & {
  label: string;
  value: number | string;
  currency?: string;
  format?: 'currency' | 'percent' | 'multiple' | 'raw';
  detail?: string;
  delta?: number;
  deltaLabel?: string;
  tone?: 'default' | 'positive' | 'warning' | 'risk';
  hero?: boolean;
  icon?: ReactNode;
}) {
  const locale = useLocale() as AppLocale;
  const rendered =
    typeof value === 'string' || format === 'raw'
      ? value
      : format === 'percent'
        ? `${value.toFixed(1)}%`
        : format === 'multiple'
          ? `${value.toFixed(1)}×`
          : formatCurrency(value, currency, locale);
  return (
    <Card className={cn(hero && 'border-primary/30 bg-surface-brand-soft', className)}>
      <CardContent className="p-density-card">
        <div className="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <span>{label}</span>
          {icon && <span className="text-primary">{icon}</span>}
        </div>
        <p
          className={cn(
            'tnum mt-1.5 text-kpi-secondary font-semibold tracking-[-0.035em]',
            hero && 'text-kpi-primary',
            tone === 'positive' && 'text-success',
            tone === 'warning' && 'text-warning',
            tone === 'risk' && 'text-danger',
          )}
        >
          {rendered}
        </p>
        {(detail || delta !== undefined) && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {delta !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 font-semibold',
                  delta > 0 ? 'text-success' : delta < 0 ? 'text-danger' : 'text-muted-foreground',
                )}
              >
                {delta > 0 ? (
                  <ArrowUp className="size-3" />
                ) : delta < 0 ? (
                  <ArrowDown className="size-3" />
                ) : (
                  <Minus className="size-3" />
                )}
                {formatCurrency(Math.abs(delta), currency, locale)}
              </span>
            )}
            <span>{deltaLabel ?? detail}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type QuotaProgressProps = {
  currency?: string;
  label?: string;
  compact?: boolean;
  onRetry?: () => void;
} & QuotaProgressState;

export function QuotaProgress(props: QuotaProgressProps) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('sales');
  const { currency = 'USD', label = t('quotaAttainment'), compact, onRetry } = props;

  const resolved = resolveQuotaProgress(props);
  if (resolved.state === 'LOADING') {
    return (
      <div className="space-y-2" aria-busy="true" aria-label={`${label} is loading`}>
        <span className="sr-only">{t('loadingQuota')}</span>
        <div className="flex items-end justify-between gap-4">
          <span className="h-4 w-32 animate-pulse rounded bg-surface-sunken" />
          <span className="h-4 w-40 animate-pulse rounded bg-surface-sunken" />
        </div>
        <div
          className={cn('animate-pulse rounded-full bg-surface-sunken', compact ? 'h-2' : 'h-3')}
        />
      </div>
    );
  }

  if (resolved.state !== 'AVAILABLE') {
    const message =
      resolved.state === 'NOT_CONFIGURED'
        ? t('quotaNotConfigured')
        : resolved.state === 'ERROR'
          ? t('quotaError')
          : t('quotaUnavailable');
    return (
      <div
        className="rounded-xl border border-dashed p-3"
        role={resolved.state === 'ERROR' ? 'alert' : 'status'}
        aria-label={`${label}: ${message}`}
      >
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        {resolved.state === 'ERROR' && onRetry ? (
          <button
            type="button"
            className="mt-2 text-xs font-semibold text-primary"
            onClick={onRetry}
          >
            {t('retryQuota')}
          </button>
        ) : null}
      </div>
    );
  }

  const { quota, billed, openForecast, billedPct, forecastPct, projectedPct } = resolved;
  return (
    <div
      className="space-y-2"
      aria-label={`${label}: ${billedPct.toFixed(1)}%, ${forecastPct.toFixed(1)}%, ${projectedPct.toFixed(1)}%, ${formatCurrency(quota, currency, locale)}`}
    >
      <div className="flex items-end justify-between gap-4">
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        <span className="tnum text-xs font-semibold">
          {formatCurrency(billed + openForecast, currency, locale)} /{' '}
          {formatCurrency(quota, currency, locale)}
        </span>
      </div>
      <div
        className={cn(
          'flex overflow-hidden rounded-full bg-surface-sunken',
          compact ? 'h-2' : 'h-3',
        )}
        aria-hidden="true"
      >
        <span className="bg-success" style={{ width: `${billedPct}%` }} title={t('billed')} />
        <span
          className="bg-primary/45"
          style={{ width: `${forecastPct}%` }}
          title={t('forecast')}
        />
      </div>
      {!compact && (
        <div className="flex gap-4 text-[11px] text-muted-foreground">
          <span>
            <i className="mr-1 inline-block size-2 rounded-full bg-success" />
            {t('billed')}
          </span>
          <span>
            <i className="mr-1 inline-block size-2 rounded-full bg-primary/45" />
            {t('forecast')}
          </span>
        </div>
      )}
    </div>
  );
}

export function QuotaGap({
  gap,
  currency = 'USD',
  interpretation,
  drivers = [],
  action,
}: {
  gap: number | null;
  currency?: string;
  interpretation?: string;
  drivers?: Array<{ label: string; amount: number }>;
  action?: ReactNode;
}) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('sales');
  const tValue = useTranslations('common.value');
  const available = gap !== null;
  const above = available && gap <= 0;
  return (
    <Card
      className={cn(
        !available && 'border-border',
        available && (above ? 'border-success/30' : 'border-warning/35'),
      )}
    >
      <CardContent className="p-density-card">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              'grid size-9 shrink-0 place-items-center rounded-xl',
              !available
                ? 'bg-muted text-muted-foreground'
                : above
                  ? 'bg-surface-success-soft text-success'
                  : 'bg-surface-warning-soft text-warning',
            )}
          >
            {available && above ? (
              <CheckCircle2 className="size-5" />
            ) : (
              <CircleAlert className="size-5" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {t('remainingGap')}
            </p>
            <p className="tnum mt-1 text-3xl font-semibold tracking-[-0.035em]">
              {available ? formatCurrency(Math.abs(gap), currency, locale) : tValue('notAvailable')}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {interpretation ??
                (!available
                  ? t('quotaDataUnavailable')
                  : above
                    ? t('forecastAbove')
                    : t('pipelineAction'))}
            </p>
            {drivers.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs">
                {drivers.slice(0, 3).map((driver) => (
                  <li key={driver.label} className="flex justify-between gap-4">
                    <span className="truncate text-muted-foreground">{driver.label}</span>
                    <b className="tnum">{formatCurrency(driver.amount, currency, locale)}</b>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {action}
        </div>
      </CardContent>
    </Card>
  );
}

export function RiskBadge({
  severity = 'WARNING',
  label,
  code,
  className,
}: {
  severity?: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  label?: string;
  code?: string;
  className?: string;
}) {
  const tStatus = useTranslations('common.status');
  const tCodes = useTranslations('alerts.codes');
  const text = label ?? (code && tCodes.has(code) ? tCodes(code) : undefined) ?? tStatus(severity);
  const severityIcon =
    severity === 'CRITICAL' ? (
      <OctagonAlert className="size-3" />
    ) : severity === 'HIGH' ? (
      <ShieldAlert className="size-3" />
    ) : severity === 'WARNING' ? (
      <AlertTriangle className="size-3" />
    ) : (
      <CircleAlert className="size-3" />
    );
  return (
    <Badge
      className={cn(
        'gap-1 border-transparent',
        severity === 'INFO' && 'bg-secondary text-secondary-foreground',
        severity === 'WARNING' && 'bg-surface-warning-soft text-warning',
        (severity === 'HIGH' || severity === 'CRITICAL') && 'bg-surface-danger-soft text-danger',
        className,
      )}
    >
      {severityIcon}
      {text}
    </Badge>
  );
}

export function OpportunityHealth({
  score,
  status,
  factors,
  showFactors,
  size = 'md',
}: {
  score: number;
  status?: 'HEALTHY' | 'AT_RISK' | 'CRITICAL';
  factors?: Array<{ code: string; impact: number; message: string }>;
  showFactors?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const tStatus = useTranslations('common.status');
  const resolved = status ?? (score >= 70 ? 'HEALTHY' : score >= 45 ? 'AT_RISK' : 'CRITICAL');
  return (
    <div>
      <div className="flex items-center gap-2">
        <Gauge className={cn('text-muted-foreground', size === 'sm' ? 'size-3.5' : 'size-4')} />
        <span
          className={cn(
            'tnum font-semibold',
            size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-xs' : 'text-base',
            resolved === 'HEALTHY'
              ? 'text-success'
              : resolved === 'AT_RISK'
                ? 'text-warning'
                : 'text-danger',
          )}
        >
          {score}
        </span>
        <span className="text-[11px] font-medium text-muted-foreground">{tStatus(resolved)}</span>
      </div>
      {showFactors && factors?.length ? (
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {factors.map((factor) => (
            <li key={factor.code}>{factor.message}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function StageVelocity({
  stage,
  daysInStage,
  benchmarkDays,
}: {
  stage: string;
  daysInStage: number;
  benchmarkDays?: number;
}) {
  const t = useTranslations('sales');
  const pace = benchmarkDays ? daysInStage / benchmarkDays : null;
  const ratio = pace === null ? 0 : Math.min(100, (pace / 1.5) * 100);
  const verdict = pace === null ? null : pace <= 1 ? 'onPace' : pace <= 1.5 ? 'slowing' : 'stalled';
  return (
    <div
      aria-label={`${stage}: ${t('daysInStage', { count: daysInStage })}${benchmarkDays ? `, ${benchmarkDays}, ${verdict ? t(verdict) : ''}` : ''}`}
    >
      <div className="flex justify-between text-xs">
        <span className="font-semibold">
          {stage} · {t('stageVelocity')}
        </span>
        <span
          className={cn(
            verdict === 'onPace' && 'text-success',
            verdict === 'slowing' && 'text-warning',
            verdict === 'stalled' && 'text-danger',
          )}
        >
          {t('daysInStage', { count: daysInStage })}
          {benchmarkDays && verdict ? ` · ${t(verdict)} · ${benchmarkDays}` : ''}
        </span>
      </div>
      {benchmarkDays ? (
        <div className="relative mt-2 h-2 rounded-full bg-surface-sunken">
          <span
            className={cn(
              'block h-2 rounded-full',
              verdict === 'onPace'
                ? 'bg-success'
                : verdict === 'slowing'
                  ? 'bg-warning'
                  : 'bg-danger',
            )}
            style={{ width: `${ratio}%` }}
          />
          <i className="absolute top-[-3px] h-4 w-px bg-foreground/60" style={{ left: '66%' }} />
        </div>
      ) : null}
    </div>
  );
}

type ForecastConfidenceProps = {
  sellerCategory?: string;
  rationale?: string;
  onRetry?: () => void;
} & ForecastConfidenceState;

export function ForecastConfidence(props: ForecastConfidenceProps) {
  const t = useTranslations('sales');
  const tCategory = useTranslations('common.forecastCategory');
  const { sellerCategory = 'PIPELINE', rationale, onRetry } = props;
  const sellerCall = tCategory.has(sellerCategory)
    ? tCategory(sellerCategory)
    : sellerCategory.replaceAll('_', ' ');

  const resolved = resolveForecastConfidence(props);
  if (resolved.state === 'LOADING') {
    return (
      <div className="rounded-xl border p-3" aria-busy="true" aria-label={t('loadingConfidence')}>
        <span className="sr-only">{t('loadingConfidence')}</span>
        <div className="flex items-center justify-between gap-3">
          <span className="h-4 w-44 animate-pulse rounded bg-surface-sunken" />
          <span className="h-4 w-24 animate-pulse rounded bg-surface-sunken" />
        </div>
        <div className="mt-2 h-2 animate-pulse rounded-full bg-surface-sunken" />
      </div>
    );
  }

  if (resolved.state !== 'AVAILABLE') {
    const message =
      resolved.state === 'INSUFFICIENT_DATA'
        ? t('insufficientConfidence')
        : resolved.state === 'ERROR'
          ? t('confidenceError')
          : t('confidenceUnavailable');
    return (
      <div
        className="rounded-xl border p-3"
        role={resolved.state === 'ERROR' ? 'alert' : 'status'}
        aria-label={`${t('sellerForecast', { category: sellerCall })}. ${message}`}
      >
        <p className="text-xs font-semibold text-muted-foreground">
          {t('sellerForecast', { category: sellerCall })}
        </p>
        <p className="mt-2 text-sm font-semibold">{message}</p>
        {rationale ? (
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{rationale}</p>
        ) : null}
        {resolved.state === 'ERROR' && onRetry ? (
          <button
            type="button"
            className="mt-2 text-xs font-semibold text-primary"
            onClick={onRetry}
          >
            {t('retryConfidence')}
          </button>
        ) : null}
      </div>
    );
  }

  const { confidence, range, relationship } = resolved;
  const relationshipLabel =
    relationship === 'Aligned with seller call' ? t('aligned') : t('diverges');
  return (
    <div
      className="rounded-xl border p-3"
      aria-label={`${t('sellerForecast', { category: sellerCall })}. ${t('confidenceValue', { value: confidence })}. ${t('confidenceRange', { min: range.min, max: range.max, relationship: relationshipLabel })}.`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-muted-foreground">
          {t('sellerForecast', { category: sellerCall })}
        </span>
        <b
          className={cn(
            'tnum',
            confidence >= 65 ? 'text-success' : confidence >= 40 ? 'text-warning' : 'text-danger',
          )}
        >
          {t('confidenceValue', { value: confidence })}
        </b>
      </div>
      <p className="mt-1 text-[11px] font-medium text-muted-foreground">
        {t('confidenceRange', {
          min: range.min,
          max: range.max,
          relationship: relationshipLabel,
        })}
      </p>
      <div className="mt-2 h-2 rounded-full bg-surface-sunken" aria-hidden="true">
        <span className="block h-2 rounded-full bg-primary" style={{ width: `${confidence}%` }} />
      </div>
      {rationale && <p className="mt-2 text-xs leading-5 text-muted-foreground">{rationale}</p>}
    </div>
  );
}

export interface FunnelStageDatum {
  stage: string;
  stageCode: string;
  probability: number;
  count: number;
  amount: number;
  atRisk?: number;
  atRiskAmount?: number;
  avgDaysInStage?: number;
  likelyToSlip?: number;
  conversion?: number;
}

const pipelineColors = [
  'bg-pipeline-discovery',
  'bg-pipeline-qualified',
  'bg-pipeline-proposal',
  'bg-pipeline-commit',
  'bg-pipeline-backlog',
  'bg-pipeline-billed',
];

export function SalesFunnel({
  stages,
  currency = 'USD',
  selectedStage,
  onSelectStage,
  renderDetail,
}: {
  stages: FunnelStageDatum[];
  currency?: string;
  selectedStage?: string | null;
  onSelectStage?: (stage: string | null) => void;
  renderDetail?: (stage: FunnelStageDatum | undefined) => ReactNode;
}) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('sales');
  const tCommon = useTranslations('common');
  const tValue = useTranslations('common.value');
  const selected = stages.find((stage) => stage.stage === selectedStage);
  return (
    <div>
      <div className="space-y-1.5" aria-label={t('salesFunnel')}>
        {stages.map((stage, index) => {
          const width = Math.max(34, 100 - index * (58 / Math.max(stages.length - 1, 1)));
          const active = selectedStage === stage.stage;
          return (
            <div
              key={stage.stage}
              className="group relative mx-auto w-full sm:w-[var(--funnel-width)]"
              style={{ '--funnel-width': `${width}%` } as CSSProperties}
            >
              <button
                type="button"
                aria-pressed={active}
                aria-label={`${stage.stage}: ${formatCurrency(stage.amount, currency, locale)}, ${tCommon('opportunityCount', { count: stage.count })}, ${t('atRisk', { count: stage.atRisk ?? 0 })}`}
                onClick={() => onSelectStage?.(active ? null : stage.stage)}
                className={cn(
                  'relative flex h-11 w-full items-center justify-between gap-3 rounded-lg px-4 text-left text-xs font-semibold text-sidebar transition-[filter,outline-color] hover:brightness-[1.08] focus-visible:z-20',
                  pipelineColors[index % pipelineColors.length],
                  active && 'ring-2 ring-ring ring-offset-2 ring-offset-background',
                )}
              >
                <span>{stage.stage}</span>
                <span className="tnum">
                  {formatCurrency(stage.amount, currency, locale)} · {stage.count}
                </span>
              </button>
              <div
                role="tooltip"
                className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-20 hidden w-64 -translate-x-1/2 rounded-xl border bg-card p-3 text-xs text-foreground shadow-[var(--shadow-overlay)] sm:group-hover:block sm:group-focus-within:block"
              >
                <p className="font-semibold">{stage.stage}</p>
                <p className="tnum mt-1 text-lg font-semibold">
                  {formatCurrency(stage.amount, currency, locale)}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-muted-foreground">
                  <span>{tCommon('opportunityCount', { count: stage.count })}</span>
                  <span>
                    {t('atRiskAmount', {
                      amount: formatCurrency(stage.atRiskAmount ?? 0, currency, locale),
                    })}
                  </span>
                  <span>
                    {stage.avgDaysInStage === undefined
                      ? t('daysUnavailable')
                      : t('daysAverage', { count: stage.avgDaysInStage })}
                  </span>
                  <span>
                    {stage.likelyToSlip === undefined
                      ? t('slippageUnavailable')
                      : t('likelySlip', {
                          amount: formatCurrency(stage.likelyToSlip, currency, locale),
                        })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="sr-only">
        <table>
          <caption>{t('funnelData')}</caption>
          <thead>
            <tr>
              <th>{t('stage')}</th>
              <th>{t('amount')}</th>
              <th>{t('opportunities')}</th>
              <th>{t('atRiskLabel')}</th>
              <th>{t('avgDays')}</th>
            </tr>
          </thead>
          <tbody>
            {stages.map((stage) => (
              <tr key={stage.stage}>
                <td>{stage.stage}</td>
                <td>{stage.amount}</td>
                <td>{stage.count}</td>
                <td>{stage.atRiskAmount ?? 0}</td>
                <td>{stage.avgDaysInStage ?? tValue('notAvailable')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && renderDetail && (
        <div className="mt-5 border-t pt-5">{renderDetail(selected)}</div>
      )}
    </div>
  );
}

export function ForecastMovement({
  since,
  net,
  currency = 'USD',
  movements,
  onSelect,
}: {
  since?: string;
  net?: number;
  currency?: string;
  movements: Array<{ label: string; delta: number; reason?: string; opportunityId?: string }>;
  onSelect?: (item: {
    label: string;
    delta: number;
    reason?: string;
    opportunityId?: string;
  }) => void;
}) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('sales');
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {t('since', { value: since ?? t('lastSnapshot') })}
        </span>
        {net !== undefined && (
          <b className={cn('tnum text-sm', net < 0 ? 'text-danger' : 'text-success')}>
            {net >= 0 ? '+' : '−'}
            {formatCurrency(Math.abs(net), currency, locale)}
          </b>
        )}
      </div>
      <div className="mt-3 divide-y">
        {movements.map((item) => (
          <button
            key={`${item.label}-${item.delta}`}
            onClick={() => onSelect?.(item)}
            className="flex w-full items-center gap-3 py-3 text-left text-xs hover:text-primary"
          >
            <span
              className={cn(
                'grid size-7 place-items-center rounded-lg',
                item.delta < 0
                  ? 'bg-surface-danger-soft text-danger'
                  : 'bg-surface-success-soft text-success',
              )}
            >
              {item.delta < 0 ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />}
            </span>
            <span className="min-w-0 flex-1">
              <b className="block truncate">{item.label}</b>
              <span className="text-muted-foreground">{item.reason}</span>
            </span>
            <b className="tnum">
              {item.delta >= 0 ? '+' : '−'}
              {formatCurrency(Math.abs(item.delta), currency, locale)}
            </b>
          </button>
        ))}
      </div>
    </div>
  );
}

export function SellerPerformance({
  sellers,
  currency = 'USD',
  onSelect,
}: {
  sellers: Array<{
    seller: string;
    opportunities: number;
    pipeline: number;
    commit: number;
    quota?: number;
  }>;
  currency?: string;
  onSelect?: (row: {
    seller: string;
    opportunities: number;
    pipeline: number;
    commit: number;
    quota?: number;
  }) => void;
}) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('sales');
  const tRole = useTranslations('common.role');
  const tValue = useTranslations('common.value');
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="border-b text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          <tr>
            <th className="h-density-row py-2">{tRole('SELLER')}</th>
            <th>{t('quota')}</th>
            <th>{t('pipeline')}</th>
            <th>{t('commit')}</th>
            <th>{t('coverage')}</th>
            <th>{t('atRiskLabel')}</th>
            <th>{t('trend')}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {sellers.map((seller) => (
            <tr key={seller.seller}>
              <td className="h-density-row py-2">
                <button
                  className="font-semibold hover:text-primary"
                  onClick={() => onSelect?.(seller)}
                >
                  {seller.seller}
                </button>
              </td>
              <td className="tnum">
                {seller.quota
                  ? formatCurrency(seller.quota, currency, locale)
                  : tValue('notAvailable')}
              </td>
              <td className="tnum">{formatCurrency(seller.pipeline, currency, locale)}</td>
              <td className="tnum">{formatCurrency(seller.commit, currency, locale)}</td>
              <td className="tnum">
                {seller.quota ? `${(seller.pipeline / seller.quota).toFixed(1)}×` : '—'}
              </td>
              <td>{t('seeDeals')}</td>
              <td>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Minus className="size-3" />
                  {t('noHistory')}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
