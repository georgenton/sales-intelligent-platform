import { Injectable } from '@nestjs/common';
import type { RequestAuth } from '../../common/http/authenticated-request';
import { PrismaService } from '../../common/prisma/prisma.service';
import { coverageMetrics } from './commercial-metrics';
import { currentFiscalQuarter } from './fiscal-period';

const money = (value: { toNumber(): number } | null | undefined): number => value?.toNumber() ?? 0;

interface BrandAccumulator {
  brandId: string;
  brand: string;
  quota: number | null;
  billed: number;
  billedGrossProfit: number;
  pipeline: number;
  forecast: number;
  commit: number;
  backlog: number;
  pipelineGrossProfit: number;
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(auth: RequestAuth) {
    return this.prisma.withTenant(auth.activeTenantId, async (transaction) => {
      const settings = await transaction.tenantSetting.findUniqueOrThrow({
        where: { tenantId: auth.activeTenantId },
      });
      const period = currentFiscalQuarter(new Date(), settings.fiscalYearStartMonth);
      const sellerScoped = auth.role === 'SELLER';
      const opportunityScope = sellerScoped ? { sellerId: auth.userId } : {};
      const quotaAssigneeId = sellerScoped ? auth.userId : null;
      const [opportunities, quotas, billing, brands, activeAlerts] = await Promise.all([
        transaction.opportunity.findMany({
          where: { tenantId: auth.activeTenantId, deletedAt: null, ...opportunityScope },
          include: {
            stage: true,
            seller: { select: { id: true, name: true } },
            lineItems: { include: { brand: { select: { id: true, name: true } } } },
          },
        }),
        transaction.quota.findMany({
          where: {
            tenantId: auth.activeTenantId,
            assigneeId: quotaAssigneeId,
            periodStart: { lte: period.end },
            periodEnd: { gte: period.start },
          },
        }),
        transaction.billingRecord.findMany({
          where: {
            tenantId: auth.activeTenantId,
            billedAt: { gte: period.start, lte: period.end },
            ...(sellerScoped ? { opportunity: { sellerId: auth.userId } } : {}),
          },
          include: {
            brand: { select: { id: true, name: true } },
            opportunity: {
              select: {
                estimatedAmount: true,
                lineItems: {
                  include: { brand: { select: { id: true, name: true } } },
                },
              },
            },
          },
        }),
        transaction.brand.findMany({
          where: { tenantId: auth.activeTenantId },
          orderBy: { name: 'asc' },
        }),
        transaction.alert.count({
          where: {
            tenantId: auth.activeTenantId,
            resolvedAt: null,
            ...(sellerScoped ? { opportunity: { sellerId: auth.userId } } : {}),
          },
        }),
      ]);

      const open = opportunities.filter((opportunity) => opportunity.status === 'OPEN');
      const eligibleOpen = open.filter(
        (opportunity) =>
          opportunity.expectedCloseDate >= period.start &&
          opportunity.expectedCloseDate <= period.end,
      );
      const sum = (items: typeof opportunities): number =>
        items.reduce((total, opportunity) => total + money(opportunity.estimatedAmount), 0);
      const pipeline = sum(eligibleOpen);
      const totalOpenPipeline = sum(open);
      const weightedPipeline = eligibleOpen.reduce(
        (total, opportunity) =>
          total + money(opportunity.estimatedAmount) * (opportunity.probability / 100),
        0,
      );
      const forecast = sum(
        eligibleOpen.filter((opportunity) =>
          ['BEST_CASE', 'COMMIT'].includes(opportunity.forecastCategory),
        ),
      );
      const commit = sum(
        eligibleOpen.filter((opportunity) => opportunity.forecastCategory === 'COMMIT'),
      );
      const backlogOpportunities = opportunities.filter(
        (opportunity) => opportunity.status === 'WON' && !opportunity.stage.isBilled,
      );
      const backlog = sum(backlogOpportunities);
      const billed = billing.reduce((total, record) => total + money(record.amount), 0);
      const totalQuotaRows = quotas.filter((item) => item.brandId === null);
      const quota = totalQuotaRows.length
        ? totalQuotaRows.reduce((total, item) => total + money(item.amount), 0)
        : null;
      const coverage = coverageMetrics({
        quota,
        billed,
        eligibleOpenPipeline: pipeline,
        weightedEligibleOpenPipeline: weightedPipeline,
      });
      const totalGrossProfit = eligibleOpen.reduce(
        (total, item) => total + money(item.grossProfit),
        0,
      );
      const totalAmountWithMargin = eligibleOpen
        .filter((item) => item.grossProfit !== null)
        .reduce((total, item) => total + money(item.estimatedAmount), 0);

      const funnelMap = new Map<
        string,
        { stage: string; stageCode: string; probability: number; count: number; amount: number }
      >();
      for (const opportunity of eligibleOpen) {
        const key = opportunity.stage.id;
        const current = funnelMap.get(key) ?? {
          stage: opportunity.stage.name,
          stageCode: opportunity.stage.code,
          probability: opportunity.stage.probability,
          count: 0,
          amount: 0,
        };
        current.count += 1;
        current.amount += money(opportunity.estimatedAmount);
        funnelMap.set(key, current);
      }

      const brandMap = new Map<string, BrandAccumulator>();
      for (const brand of brands) {
        brandMap.set(brand.id, {
          brandId: brand.id,
          brand: brand.name,
          quota: null,
          billed: 0,
          billedGrossProfit: 0,
          pipeline: 0,
          forecast: 0,
          commit: 0,
          backlog: 0,
          pipelineGrossProfit: 0,
        });
      }
      for (const quotaRow of quotas.filter((item) => item.brandId !== null)) {
        const brand = brandMap.get(quotaRow.brandId!);
        if (brand) brand.quota = (brand.quota ?? 0) + money(quotaRow.amount);
      }
      const eligibleIds = new Set(eligibleOpen.map((item) => item.id));
      const backlogIds = new Set(backlogOpportunities.map((item) => item.id));
      for (const opportunity of opportunities) {
        const isEligible = eligibleIds.has(opportunity.id);
        const isBacklog = backlogIds.has(opportunity.id);
        const lineTotal = opportunity.lineItems.reduce(
          (total, item) => total + money(item.amount),
          0,
        );
        for (const item of opportunity.lineItems) {
          const brand = brandMap.get(item.brandId);
          if (!brand) continue;
          const amount = money(item.amount);
          const allocatedGrossProfit =
            item.cost !== null
              ? amount - money(item.cost)
              : lineTotal > 0
                ? money(opportunity.grossProfit) * (amount / lineTotal)
                : 0;
          if (isEligible) {
            brand.pipeline += amount;
            brand.pipelineGrossProfit += allocatedGrossProfit;
            if (['BEST_CASE', 'COMMIT'].includes(opportunity.forecastCategory)) {
              brand.forecast += amount;
            }
            if (opportunity.forecastCategory === 'COMMIT') brand.commit += amount;
          }
          if (isBacklog) brand.backlog += amount;
        }
      }
      for (const record of billing) {
        if (record.brandId) {
          const brand = brandMap.get(record.brandId);
          if (brand) {
            brand.billed += money(record.amount);
            brand.billedGrossProfit += money(record.grossProfit);
          }
          continue;
        }
        const lineItems = record.opportunity?.lineItems ?? [];
        const lineTotal = lineItems.reduce((total, item) => total + money(item.amount), 0);
        for (const item of lineItems) {
          const brand = brandMap.get(item.brandId);
          if (!brand || lineTotal === 0) continue;
          const share = money(item.amount) / lineTotal;
          brand.billed += money(record.amount) * share;
          brand.billedGrossProfit += money(record.grossProfit) * share;
        }
      }

      const sellerMap = new Map<
        string,
        {
          seller: string;
          pipeline: number;
          commit: number;
          opportunities: number;
          grossProfit: number;
        }
      >();
      for (const opportunity of eligibleOpen) {
        const current = sellerMap.get(opportunity.seller.id) ?? {
          seller: opportunity.seller.name,
          pipeline: 0,
          commit: 0,
          opportunities: 0,
          grossProfit: 0,
        };
        current.pipeline += money(opportunity.estimatedAmount);
        current.commit +=
          opportunity.forecastCategory === 'COMMIT' ? money(opportunity.estimatedAmount) : 0;
        current.opportunities += 1;
        current.grossProfit += money(opportunity.grossProfit);
        sellerMap.set(opportunity.seller.id, current);
      }

      const brandPerformance = [...brandMap.values()]
        .map((brand) => {
          const gap = brand.quota === null ? null : Math.max(0, brand.quota - brand.billed);
          return {
            ...brand,
            gap,
            billingAttainment:
              brand.quota && brand.quota > 0 ? (brand.billed / brand.quota) * 100 : null,
            forecastAttainment:
              brand.quota && brand.quota > 0 ? (brand.forecast / brand.quota) * 100 : null,
            grossMargin:
              brand.pipeline > 0 ? (brand.pipelineGrossProfit / brand.pipeline) * 100 : null,
          };
        })
        .filter(
          (brand) =>
            brand.quota !== null || brand.billed > 0 || brand.pipeline > 0 || brand.backlog > 0,
        )
        .sort((left, right) => right.pipeline + right.billed - (left.pipeline + left.billed));

      return {
        period: { label: period.label, start: period.start, end: period.end },
        currency: settings.currency,
        kpis: {
          quota,
          quotaConfigured: quota !== null,
          pipeline,
          totalOpenPipeline,
          weightedPipeline,
          forecast,
          commit,
          backlog,
          billed,
          gap: coverage.remainingQuota,
          forecastAttainment: quota && quota > 0 ? (forecast / quota) * 100 : null,
          billingAttainment: quota && quota > 0 ? (billed / quota) * 100 : null,
          pipelineCoverage: coverage.pipelineCoverage,
          weightedCoverage: coverage.weightedCoverage,
          coverageStatus: coverage.coverageStatus,
          averageMargin: totalAmountWithMargin
            ? (totalGrossProfit / totalAmountWithMargin) * 100
            : null,
          atRisk: activeAlerts,
        },
        funnel: [...funnelMap.values()].sort((left, right) => left.probability - right.probability),
        byBrand: brandPerformance.map(({ brandId, brand, pipeline: amount }) => ({
          brandId,
          brand,
          amount,
        })),
        brandPerformance,
        sellerPerformance: [...sellerMap.values()]
          .map((seller) => ({
            ...seller,
            grossMargin: seller.pipeline > 0 ? (seller.grossProfit / seller.pipeline) * 100 : null,
          }))
          .sort((left, right) => right.pipeline - left.pipeline),
      };
    });
  }
}
