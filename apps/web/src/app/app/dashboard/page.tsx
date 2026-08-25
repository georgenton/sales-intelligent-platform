import {
  AlertTriangle,
  ArrowUpRight,
  BadgeDollarSign,
  CircleGauge,
  CirclePile,
  Goal,
  Plus,
  ReceiptText,
} from 'lucide-react';
import Link from 'next/link';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';
import { ManagerBrief } from '@/components/dashboard/manager-brief';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import type { AlertData, DashboardData } from '@/lib/types';
import { formatCurrency, formatDateOnly } from '@/lib/utils';

export default async function DashboardPage() {
  const [dashboard, alerts] = await Promise.all([
    apiFetch<DashboardData>('/analytics/dashboard'),
    apiFetch<AlertData[]>('/alerts'),
  ]);
  const kpis = [
    { label: 'Quota', value: dashboard.kpis.quota, detail: dashboard.period.label, icon: Goal },
    {
      label: 'Forecast',
      value: dashboard.kpis.forecast,
      detail: `${dashboard.kpis.forecastAttainment.toFixed(1)}% attainment`,
      icon: CircleGauge,
    },
    {
      label: 'Billed',
      value: dashboard.kpis.billed,
      detail: `${dashboard.kpis.billingAttainment.toFixed(1)}% attainment`,
      icon: ReceiptText,
    },
    { label: 'Gap', value: dashboard.kpis.gap, detail: 'to billed quota', icon: BadgeDollarSign },
    {
      label: 'Pipeline',
      value: dashboard.kpis.pipeline,
      detail: `${dashboard.kpis.pipelineCoverage.toFixed(1)}× coverage`,
      icon: CirclePile,
    },
  ];
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Sales command center</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.035em]">
            How is the quarter looking?
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {dashboard.period.label} · {formatDateOnly(dashboard.period.start)} –{' '}
            {formatDateOnly(dashboard.period.end)}
          </p>
        </div>
        <Link
          href="/app/opportunities/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90"
        >
          <Plus className="size-4" />
          New opportunity
        </Link>
      </div>
      <section aria-label="Quarter KPIs" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="xl:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wider">{kpi.label}</span>
                <kpi.icon className="size-4" />
              </div>
              <p className="mt-4 text-2xl font-semibold tracking-tight">
                {formatCurrency(kpi.value, dashboard.currency)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{kpi.detail}</p>
            </CardContent>
          </Card>
        ))}
        <Card className="border-red-100 bg-red-50 xl:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-danger">
              <span className="text-xs font-semibold uppercase tracking-wider">At risk</span>
              <AlertTriangle className="size-4" />
            </div>
            <p className="mt-4 text-2xl font-semibold tracking-tight text-danger">
              {dashboard.kpis.atRisk}
            </p>
            <p className="mt-1 text-xs text-red-700">active signals</p>
          </CardContent>
        </Card>
      </section>
      <DashboardCharts dashboard={dashboard} />
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Priority risks</CardTitle>
              <p className="text-xs text-muted-foreground">
                Deterministic signals requiring action
              </p>
            </div>
            <Link href="/app/alerts" className="text-xs font-semibold text-primary">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <Link
                key={alert.id}
                href={
                  alert.opportunity ? `/app/opportunities/${alert.opportunity.id}` : '/app/alerts'
                }
                className="flex items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-muted"
              >
                <span className="mt-1 size-2 rounded-full bg-danger" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">
                      {alert.opportunity?.title ?? 'Portfolio alert'}
                    </p>
                    <Badge className="text-[10px]">{alert.severity}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{alert.message}</p>
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
            {!alerts.length && (
              <p className="py-8 text-center text-sm text-muted-foreground">No active risks.</p>
            )}
          </CardContent>
        </Card>
        <ManagerBrief />
      </div>
    </div>
  );
}
