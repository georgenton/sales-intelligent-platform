import { Injectable } from '@nestjs/common';
import type { RequestAuth } from '../../common/http/authenticated-request';
import { PrismaService } from '../../common/prisma/prisma.service';
import { currentFiscalQuarter } from './fiscal-period';

const money = (value: { toNumber(): number } | null | undefined): number => value?.toNumber() ?? 0;

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(auth: RequestAuth) {
    return this.prisma.withTenant(auth.activeTenantId, async (transaction) => {
      const settings = await transaction.tenantSetting.findUniqueOrThrow({
        where: { tenantId: auth.activeTenantId },
      });
      const period = currentFiscalQuarter(new Date(), settings.fiscalYearStartMonth);
      const [opportunities, quotas, billing, activeAlerts] = await Promise.all([
        transaction.opportunity.findMany({
          where: { tenantId: auth.activeTenantId, deletedAt: null },
          include: {
            stage: true,
            seller: { select: { id: true, name: true } },
            lineItems: { include: { brand: { select: { id: true, name: true } } } },
          },
        }),
        transaction.quota.findMany({
          where: {
            tenantId: auth.activeTenantId,
            assigneeId: null,
            brandId: null,
            periodStart: { lte: period.end },
            periodEnd: { gte: period.start },
          },
        }),
        transaction.billingRecord.findMany({
          where: {
            tenantId: auth.activeTenantId,
            billedAt: { gte: period.start, lte: period.end },
          },
        }),
        transaction.alert.count({ where: { tenantId: auth.activeTenantId, resolvedAt: null } }),
      ]);

      const open = opportunities.filter((opportunity) => opportunity.status === 'OPEN');
      const inPeriod = open.filter(
        (opportunity) =>
          opportunity.expectedCloseDate >= period.start &&
          opportunity.expectedCloseDate <= period.end,
      );
      const sum = (items: typeof opportunities): number =>
        items.reduce((total, opportunity) => total + money(opportunity.estimatedAmount), 0);
      const pipeline = sum(open);
      const weightedPipeline = open.reduce(
        (total, opportunity) =>
          total + money(opportunity.estimatedAmount) * (opportunity.probability / 100),
        0,
      );
      const forecast = sum(
        inPeriod.filter((opportunity) =>
          ['BEST_CASE', 'COMMIT'].includes(opportunity.forecastCategory),
        ),
      );
      const commit = sum(
        inPeriod.filter((opportunity) => opportunity.forecastCategory === 'COMMIT'),
      );
      const backlog = sum(
        opportunities.filter(
          (opportunity) => opportunity.status === 'WON' && !opportunity.stage.isBilled,
        ),
      );
      const billed = billing.reduce((total, record) => total + money(record.amount), 0);
      const quota = quotas.reduce((total, item) => total + money(item.amount), 0);
      const gap = Math.max(0, quota - billed);
      const totalGrossProfit = opportunities.reduce(
        (total, item) => total + money(item.grossProfit),
        0,
      );
      const totalAmountWithMargin = opportunities
        .filter((item) => item.grossProfit !== null)
        .reduce((total, item) => total + money(item.estimatedAmount), 0);

      const funnelMap = new Map<
        string,
        { stage: string; probability: number; count: number; amount: number }
      >();
      for (const opportunity of open) {
        const key = opportunity.stage.id;
        const current = funnelMap.get(key) ?? {
          stage: opportunity.stage.name,
          probability: opportunity.stage.probability,
          count: 0,
          amount: 0,
        };
        current.count += 1;
        current.amount += money(opportunity.estimatedAmount);
        funnelMap.set(key, current);
      }

      const brandMap = new Map<string, number>();
      for (const opportunity of open) {
        for (const item of opportunity.lineItems) {
          brandMap.set(item.brand.name, (brandMap.get(item.brand.name) ?? 0) + money(item.amount));
        }
      }

      const sellerMap = new Map<
        string,
        { seller: string; pipeline: number; commit: number; opportunities: number }
      >();
      for (const opportunity of open) {
        const current = sellerMap.get(opportunity.seller.id) ?? {
          seller: opportunity.seller.name,
          pipeline: 0,
          commit: 0,
          opportunities: 0,
        };
        current.pipeline += money(opportunity.estimatedAmount);
        current.commit +=
          opportunity.forecastCategory === 'COMMIT' ? money(opportunity.estimatedAmount) : 0;
        current.opportunities += 1;
        sellerMap.set(opportunity.seller.id, current);
      }

      return {
        period: { label: period.label, start: period.start, end: period.end },
        currency: settings.currency,
        kpis: {
          quota,
          pipeline,
          weightedPipeline,
          forecast,
          commit,
          backlog,
          billed,
          gap,
          forecastAttainment: quota ? (forecast / quota) * 100 : 0,
          billingAttainment: quota ? (billed / quota) * 100 : 0,
          pipelineCoverage: gap ? pipeline / gap : 0,
          averageMargin: totalAmountWithMargin
            ? (totalGrossProfit / totalAmountWithMargin) * 100
            : 0,
          atRisk: activeAlerts,
        },
        funnel: [...funnelMap.values()].sort((left, right) => left.probability - right.probability),
        byBrand: [...brandMap.entries()]
          .map(([brand, amount]) => ({ brand, amount }))
          .sort((left, right) => right.amount - left.amount),
        sellerPerformance: [...sellerMap.values()].sort(
          (left, right) => right.pipeline - left.pipeline,
        ),
      };
    });
  }
}
