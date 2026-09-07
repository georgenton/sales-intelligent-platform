'use client';

import {
  Activity,
  ArrowUpRight,
  Bot,
  Check,
  Clock3,
  FileQuestion,
  Landmark,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ForecastConfidence, RiskBadge, StageVelocity } from '@/components/sales/sales-components';
import { Button } from '@/components/ui/button';
import type { AppLocale } from '@/i18n/config';
import { commercialStageLabel } from '@/lib/commercial';
import { formatCurrency, formatDateOnly, formatDateTime, formatRelativeTime } from '@/lib/utils';
import { useOpportunityQuery, useQualificationQuery } from '@/store/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectOpportunity, setCopilotContext, setCopilotPanelOpen } from '@/store/ui-slice';

const copilotPrompts = [
  { id: 'RISK', key: 'risk' },
  { id: 'COMMIT', key: 'commit' },
  { id: 'MISSING', key: 'missing' },
  { id: 'MEETING', key: 'meeting' },
  { id: 'FOLLOW_UP', key: 'followUp' },
] as const;

const lowerFirst = (value: string) =>
  value.length ? `${value[0]?.toLocaleLowerCase()}${value.slice(1)}` : value;

export function OpportunityDrawer({ canUpdate }: { canUpdate: boolean }) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations('opportunities.drawer');
  const tOpportunities = useTranslations('opportunities');
  const tValue = useTranslations('common.value');
  const tStatus = useTranslations('common.status');
  const tCategory = useTranslations('common.forecastCategory');
  const tCopilot = useTranslations('copilot.prompts');
  const tAlertMessages = useTranslations('alerts.messages');
  const dispatch = useAppDispatch();
  const selectedId = useAppSelector((state) => state.productUi.selectedOpportunityId);
  const {
    data: opportunity,
    isFetching,
    isError,
  } = useOpportunityQuery(selectedId ?? '', { skip: !selectedId });
  const { data: qualification } = useQualificationQuery(selectedId ?? '', { skip: !selectedId });
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const [openedAt] = useState(() => Date.now());

  const close = () => dispatch(selectOpportunity(null));
  useEffect(() => {
    if (!selectedId) return;
    previousFocus.current = document.activeElement as HTMLElement;
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => previousFocus.current?.focus();
  }, [selectedId]);

  const evidence = useMemo(() => {
    if (!opportunity || !qualification) return { present: [] as string[], missing: [] as string[] };
    const criteria = qualification.gates.flatMap((gate) => gate.criteria);
    const label = (criterion: (typeof criteria)[number]) =>
      locale === 'es' ? criterion.labelEs : criterion.labelEn;
    const present = criteria
      .filter(
        (criterion) =>
          criterion.response?.answer === 'YES' &&
          (!criterion.evidenceRequired || Boolean(criterion.response.evidence?.trim())),
      )
      .map(label);
    const missing = criteria
      .filter(
        (criterion) =>
          criterion.required &&
          (criterion.response?.answer !== 'YES' ||
            (criterion.evidenceRequired && !criterion.response.evidence?.trim())),
      )
      .map(label);
    return { present, missing };
  }, [locale, opportunity, qualification]);

  if (!selectedId) return null;
  const ageDays = opportunity
    ? Math.max(0, Math.floor((openedAt - new Date(opportunity.updatedAt).getTime()) / 86_400_000))
    : 0;

  return (
    <div
      className="fixed inset-0 z-[70] bg-foreground/30 backdrop-blur-[1px]"
      onMouseDown={(event) => event.target === event.currentTarget && close()}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="opportunity-drawer-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-[480px] flex-col border-l bg-card shadow-[var(--shadow-overlay)]"
        onKeyDown={(event) => {
          if (event.key === 'Escape') close();
          if (event.key !== 'Tab') return;
          const controls = event.currentTarget.querySelectorAll<HTMLElement>(
            'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
              {t('context')}
            </p>
            <p className="text-xs text-muted-foreground">{t('dashboardInPlace')}</p>
          </div>
          <Button variant="ghost" size="icon" aria-label={t('close')} onClick={close}>
            <X className="size-4" />
          </Button>
        </div>
        {isFetching && (
          <div
            role="status"
            className="grid flex-1 place-items-center text-sm text-muted-foreground"
          >
            {t('loading')}
          </div>
        )}
        {isError && (
          <div
            role="alert"
            className="grid flex-1 place-items-center p-8 text-center text-sm text-danger"
          >
            {t('loadError')}
          </div>
        )}
        {opportunity && (
          <div className="flex-1 overflow-y-auto">
            <header className="border-b p-5">
              <div className="flex flex-wrap items-center gap-2">
                <RiskBadge
                  severity={
                    opportunity.health.status === 'CRITICAL'
                      ? 'CRITICAL'
                      : opportunity.health.status === 'AT_RISK'
                        ? 'HIGH'
                        : 'INFO'
                  }
                  label={tStatus(opportunity.health.status)}
                />
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                  {opportunity.stage.code}% · {commercialStageLabel(opportunity.stage, locale)}
                </span>
              </div>
              <h2
                id="opportunity-drawer-title"
                className="mt-3 text-xl font-semibold tracking-[-0.03em]"
              >
                {opportunity.customer.name} · {opportunity.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {opportunity.seller.name}
                {opportunity.partner ? ` · via ${opportunity.partner.name}` : ''}
              </p>
              <p className="tnum mt-4 text-3xl font-semibold tracking-[-0.04em]">
                {formatCurrency(opportunity.estimatedAmount, opportunity.currency, locale)}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {canUpdate && (
                  <Link
                    href={`/app/opportunities/${opportunity.id}`}
                    className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground"
                  >
                    {t('updateForecast')} <ArrowUpRight className="size-3" />
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch(setCopilotPanelOpen(true))}
                >
                  <Bot className="size-3.5" />
                  {t('askCopilot')}
                </Button>
              </div>
            </header>
            <div className="space-y-5 p-5">
              <section
                aria-labelledby="next-step-title"
                className="rounded-2xl border border-primary/25 bg-surface-brand-soft p-4"
              >
                <p
                  id="next-step-title"
                  className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary"
                >
                  {t('nextStep')}
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {evidence.missing[0]
                    ? t('confirmWithCustomer', { item: lowerFirst(evidence.missing[0]) })
                    : t('validateCommitment')}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {t('owner', {
                    name: opportunity.seller.name,
                    date: formatDateOnly(opportunity.expectedCloseDate, locale),
                  })}
                </p>
              </section>
              <section aria-labelledby="activity-title">
                <h3
                  id="activity-title"
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                >
                  <Activity className="size-4" />
                  {t('lastActivity')}
                </h3>
                <p className="mt-2 text-sm font-semibold">
                  {t('updated', {
                    relative: formatRelativeTime(opportunity.updatedAt, locale, new Date(openedAt)),
                  })}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{t('timelineUnavailable')}</p>
              </section>
              <section aria-labelledby="evidence-title">
                <h3
                  id="evidence-title"
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                >
                  <FileQuestion className="size-4" />
                  {t('whyCategory', { category: tCategory(opportunity.forecastCategory) })}
                </h3>
                <ForecastConfidence
                  sellerCategory={opportunity.forecastCategory}
                  state="INSUFFICIENT_DATA"
                  rationale={
                    evidence.missing.length
                      ? t('requiresEvidence', { items: evidence.missing.join(', ') })
                      : t('supportsCategory')
                  }
                />
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="font-semibold text-success">{t('evidencePresent')}</p>
                    <ul className="mt-1 space-y-1 text-muted-foreground">
                      {evidence.present.length ? (
                        evidence.present.map((item) => (
                          <li key={item} className="flex gap-1">
                            <Check className="mt-0.5 size-3 shrink-0" />
                            {item}
                          </li>
                        ))
                      ) : (
                        <li>{tValue('noneRecorded')}</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-warning">{t('missing')}</p>
                    <ul className="mt-1 space-y-1 text-muted-foreground">
                      {evidence.missing.length ? (
                        evidence.missing.map((item) => <li key={item}>{item}</li>)
                      ) : (
                        <li>{t('noCriticalGaps')}</li>
                      )}
                    </ul>
                  </div>
                </div>
              </section>
              <section aria-labelledby="facts-title">
                <h3
                  id="facts-title"
                  className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                >
                  {t('commercialFacts')}
                </h3>
                <dl className="mt-2 grid grid-cols-2 gap-3 rounded-xl border p-3 text-xs">
                  <div>
                    <dt className="text-muted-foreground">{tOpportunities('expectedClose')}</dt>
                    <dd className="mt-1 font-semibold">
                      {formatDateOnly(opportunity.expectedCloseDate, locale)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{tOpportunities('margin')}</dt>
                    <dd className="tnum mt-1 font-semibold">
                      {opportunity.grossMarginPercent?.toFixed(1) ?? tValue('notAvailable')}%
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t('po')}</dt>
                    <dd className="mt-1 font-semibold">
                      {opportunity.poNumber ?? tValue('notRecorded')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t('brand')}</dt>
                    <dd className="mt-1 font-semibold">
                      {opportunity.lineItems[0]?.brand.name ?? tValue('notRecorded')}
                    </dd>
                  </div>
                </dl>
              </section>
              <section>
                <StageVelocity
                  stage={commercialStageLabel(opportunity.stage, locale)}
                  daysInStage={ageDays}
                />
              </section>
              {opportunity.alerts.length > 0 && (
                <section aria-labelledby="alerts-title">
                  <h3
                    id="alerts-title"
                    className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                  >
                    {t('activeAlerts')}
                  </h3>
                  <div className="mt-2 space-y-2">
                    {opportunity.alerts.map((alert) => (
                      <div key={alert.id} className="rounded-xl bg-surface-danger-soft p-3">
                        <RiskBadge severity={alert.severity} code={alert.code} />
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          {tAlertMessages.has(alert.code)
                            ? tAlertMessages(alert.code)
                            : alert.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {opportunity.stageHistory?.length ? (
                <section aria-labelledby="history-title">
                  <h3
                    id="history-title"
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                  >
                    <Landmark className="size-4" />
                    {tOpportunities('stageHistory')}
                  </h3>
                  <ol className="mt-3 space-y-3">
                    {opportunity.stageHistory.slice(0, 4).map((entry) => (
                      <li key={entry.id} className="border-l-2 pl-3 text-xs">
                        <b>
                          {entry.fromStage
                            ? `${commercialStageLabel(entry.fromStage, locale)} → `
                            : ''}
                          {commercialStageLabel(entry.toStage, locale)}
                        </b>
                        <p className="mt-1 text-muted-foreground">
                          {entry.changedBy.name} · {formatDateTime(entry.changedAt, locale)}
                        </p>
                      </li>
                    ))}
                  </ol>
                </section>
              ) : null}
              <section
                aria-labelledby="copilot-actions-title"
                className="rounded-2xl bg-copilot p-4 text-sidebar-foreground"
              >
                <h3
                  id="copilot-actions-title"
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-copilot-accent"
                >
                  <Bot className="size-4" />
                  {t('contextualActions')}
                </h3>
                <div className="mt-3 space-y-1.5">
                  {copilotPrompts.map((prompt) => (
                    <button
                      key={prompt.id}
                      className="block w-full rounded-lg px-2 py-2 text-left text-xs text-sidebar-foreground/75 hover:bg-sidebar-foreground/10"
                      onClick={() => {
                        dispatch(
                          setCopilotContext({
                            page: 'opportunity-drawer',
                            opportunityId: opportunity.id,
                            intentId: prompt.id,
                          }),
                        );
                        dispatch(setCopilotPanelOpen(true));
                      }}
                    >
                      {tCopilot(prompt.key)}
                    </button>
                  ))}
                </div>
              </section>
            </div>
            <footer className="sticky bottom-0 flex items-center justify-between border-t bg-card p-4">
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock3 className="size-3" />
                {t('escapeHint')}
              </span>
              <Link
                href={`/app/opportunities/${opportunity.id}`}
                className="text-xs font-semibold text-primary"
              >
                {t('openRecord')}
              </Link>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}
