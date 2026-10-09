import { BadRequestException, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { RequestAuth } from '../../common/http/authenticated-request';
import { PrismaService } from '../../common/prisma/prisma.service';
import { opportunityReadScope } from '../authorization/opportunity-scope';
import { currentFiscalQuarter, type FiscalPeriod } from './fiscal-period';
import type { ManagerDashboardQueryDto } from './dto/manager-dashboard-query.dto';
import {
  BACKLOG_STAGE,
  compareWeeklyPipeline,
  distinctCustomersVisited,
  fourToOneCoverage,
  isClosedWeek,
  managerCommercialBuckets,
  outstandingBacklogAmount,
  stalledOpportunity,
  weightedGrossMargin,
} from './manager-dashboard.metrics';

const DATA_CENTER_BRANDS = new Set(['HP', 'HPE', 'NUTANIX', 'LENOVO']);
const STAGE_CODES = ['20', '40', '60', '80', '90', '100'] as const;
const UNCLASSIFIED_LINE = 'Sin línea clasificada';
const money = (value: { toNumber(): number } | null | undefined): number => value?.toNumber() ?? 0;
const isoDate = (date: Date): string => date.toISOString().slice(0, 10);
const matchesLine = (value: string | null, line?: string) =>
  !line ||
  (line === UNCLASSIFIED_LINE
    ? !value?.trim()
    : value?.trim().toLocaleLowerCase() === line.trim().toLocaleLowerCase());

function offsetQuarter(period: FiscalPeriod, offset: number): FiscalPeriod {
  const start = new Date(
    Date.UTC(period.start.getUTCFullYear(), period.start.getUTCMonth() + offset * 3, 1),
  );
  const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 3, 0));
  const quarter = Math.floor(((start.getUTCMonth() - 11 + 12) % 12) / 3) + 1;
  const fiscalYear = start.getUTCMonth() < 11 ? start.getUTCFullYear() : start.getUTCFullYear() + 1;
  return { label: `FY${fiscalYear} Q${quarter}`, start, end };
}

function mondayWeek(date: Date): { start: Date; end: Date } {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = start.getUTCDay();
  start.setUTCDate(start.getUTCDate() - (day === 0 ? 6 : day - 1));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
}

function allocationFor(
  opportunity: {
    estimatedAmount: { toNumber(): number };
    lineItems: Array<{
      amount: { toNumber(): number };
      cost: { toNumber(): number } | null;
      brandId: string;
      productLine: string | null;
    }>;
  },
  brandId?: string,
  line?: string,
  allowedBrandIds?: ReadonlySet<string>,
): { amount: number; grossProfit: number | null } {
  const selected = opportunity.lineItems.filter(
    (item) =>
      (!brandId || item.brandId === brandId) &&
      (!allowedBrandIds || allowedBrandIds.has(item.brandId)) &&
      matchesLine(item.productLine, line),
  );
  if (!brandId && !line && !allowedBrandIds) {
    return { amount: money(opportunity.estimatedAmount), grossProfit: null };
  }
  const amount = selected.reduce((total, item) => total + money(item.amount), 0);
  const known = selected.filter((item) => item.cost !== null);
  return {
    amount,
    grossProfit:
      known.length === selected.length && selected.length > 0
        ? known.reduce((total, item) => total + money(item.amount) - money(item.cost), 0)
        : null,
  };
}

@Injectable()
export class ManagerDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async get(auth: RequestAuth, query: ManagerDashboardQueryDto) {
    return this.prisma.withTenant(auth.activeTenantId, async (transaction) => {
      const settings = await transaction.tenantSetting.findUniqueOrThrow({
        where: { tenantId: auth.activeTenantId },
      });
      const now = new Date();
      const current = currentFiscalQuarter(now, settings.fiscalYearStartMonth);
      const next = offsetQuarter(current, 1);
      const period = query.period === 'next' ? next : current;
      const requestedWeek = query.weekStart ? new Date(`${query.weekStart}T00:00:00.000Z`) : now;
      if (Number.isNaN(requestedWeek.getTime())) {
        throw new BadRequestException('weekStart must be a valid ISO date');
      }
      const week = mondayWeek(requestedWeek);
      const accessScope = opportunityReadScope(auth);
      const scoped = Object.keys(accessScope).length > 0;
      const opportunityWhere: Prisma.OpportunityWhereInput = {
        tenantId: auth.activeTenantId,
        deletedAt: null,
        AND: [
          accessScope,
          ...(query.sellerId ? [{ sellerId: query.sellerId }] : []),
          ...(query.brandId ? [{ lineItems: { some: { brandId: query.brandId } } }] : []),
          ...(query.line
            ? [
                {
                  lineItems: {
                    some: { productLine: { equals: query.line, mode: 'insensitive' } },
                  },
                } satisfies Prisma.OpportunityWhereInput,
              ]
            : []),
        ],
      };
      const snapshotScope =
        auth.role === 'MANAGER'
          ? { scopeType: 'TEAM' as const, scopeUserId: auth.userId }
          : auth.role === 'SELLER'
            ? { scopeType: 'OWN' as const, scopeUserId: auth.userId }
            : { scopeType: 'TENANT' as const, scopeUserId: null };

      const [opportunities, allQuotaRows, billing, brands, snapshots, latestBatch] =
        await Promise.all([
          transaction.opportunity.findMany({
            where: opportunityWhere,
            include: {
              stage: true,
              seller: { select: { id: true, name: true } },
              customer: { select: { id: true, name: true } },
              lineItems: { include: { brand: { select: { id: true, name: true } } } },
              billingRecords: { select: { amount: true, grossProfit: true, billedAt: true } },
              stageHistory: {
                select: { changedAt: true, reason: true },
                orderBy: { changedAt: 'desc' },
                take: 1,
              },
            },
          }),
          transaction.quota.findMany({
            where: {
              tenantId: auth.activeTenantId,
              periodStart: { lte: period.end },
              periodEnd: { gte: period.start },
            },
          }),
          transaction.billingRecord.findMany({
            where: {
              tenantId: auth.activeTenantId,
              billedAt: { gte: period.start, lte: period.end },
              ...(scoped || query.sellerId
                ? {
                    opportunity: {
                      ...(scoped ? accessScope : {}),
                      ...(query.sellerId ? { sellerId: query.sellerId } : {}),
                    },
                  }
                : {}),
            },
            include: {
              brand: { select: { id: true, name: true } },
              opportunity: {
                select: {
                  sellerId: true,
                  lineItems: { select: { brandId: true, productLine: true, amount: true } },
                },
              },
            },
          }),
          transaction.brand.findMany({
            where: { tenantId: auth.activeTenantId },
            orderBy: { name: 'asc' },
          }),
          transaction.forecastSnapshot.findMany({
            where: {
              tenantId: auth.activeTenantId,
              ...snapshotScope,
              periodStart: period.start,
              periodEnd: period.end,
              createdAt: { lte: week.end },
            },
            include: {
              items: {
                include: {
                  stage: { select: { code: true } },
                  opportunity: {
                    select: {
                      title: true,
                      sellerId: true,
                      lineItems: { select: { brandId: true, productLine: true, amount: true } },
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 2,
          }),
          transaction.commercialImportBatch.findFirst({
            where: { tenantId: auth.activeTenantId },
            orderBy: { createdAt: 'desc' },
          }),
        ]);

      const visibleSellerIds = new Set(opportunities.map((item) => item.sellerId));
      if (auth.role === 'SELLER') visibleSellerIds.add(auth.userId);
      const visitWhere: Prisma.CustomerVisitWhereInput = {
        tenantId: auth.activeTenantId,
        visitedAt: { gte: week.start, lte: week.end },
        ...(query.sellerId ? { sellerId: query.sellerId } : {}),
        ...(query.brandId || query.line
          ? {
              opportunity: {
                is: {
                  lineItems: {
                    some: {
                      ...(query.brandId ? { brandId: query.brandId } : {}),
                      ...(query.line
                        ? { productLine: { equals: query.line, mode: 'insensitive' as const } }
                        : {}),
                    },
                  },
                },
              },
            }
          : {}),
        ...(auth.permissions.has('opportunities.read.all')
          ? {}
          : { sellerId: { in: [...visibleSellerIds] } }),
      };
      const visits = await transaction.customerVisit.findMany({
        where: visitWhere,
        include: {
          seller: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true } },
          opportunity: { select: { id: true, title: true } },
        },
        orderBy: [{ visitedAt: 'desc' }, { createdAt: 'desc' }],
      });
      const dataCenterBrands = brands.filter((brand) =>
        DATA_CENTER_BRANDS.has(brand.name.trim().toLocaleUpperCase()),
      );
      const dataCenterBrandIds = new Set(dataCenterBrands.map((brand) => brand.id));
      if (query.brandId && !dataCenterBrandIds.has(query.brandId)) {
        throw new BadRequestException('brandId must belong to the Data Center scope');
      }
      const dashboardOpportunities = opportunities.filter(
        (opportunity) =>
          allocationFor(
            opportunity,
            query.brandId,
            query.line,
            query.brandId ? undefined : dataCenterBrandIds,
          ).amount > 0,
      );
      const billingAllocation = (
        record: (typeof billing)[number],
        brandId?: string,
        line?: string,
        allowedBrandIds?: ReadonlySet<string>,
      ) => {
        if (record.brandId) {
          if (brandId && record.brandId !== brandId) return 0;
          if (allowedBrandIds && !allowedBrandIds.has(record.brandId)) return 0;
          if (!line) return 1;
          const brandLines =
            record.opportunity?.lineItems.filter((item) => item.brandId === record.brandId) ?? [];
          const denominator = brandLines.reduce((total, item) => total + money(item.amount), 0);
          const numerator = brandLines
            .filter((item) => matchesLine(item.productLine, line))
            .reduce((total, item) => total + money(item.amount), 0);
          return denominator > 0 ? numerator / denominator : 0;
        }
        const opportunityLines = record.opportunity?.lineItems ?? [];
        const denominator = opportunityLines.reduce((total, item) => total + money(item.amount), 0);
        const numerator = opportunityLines
          .filter(
            (item) =>
              (!brandId || item.brandId === brandId) &&
              (!allowedBrandIds || allowedBrandIds.has(item.brandId)) &&
              matchesLine(item.productLine, line),
          )
          .reduce((total, item) => total + money(item.amount), 0);
        return denominator > 0 ? numerator / denominator : 0;
      };
      const allocateBilling = (
        rows: typeof billing,
        brandId?: string,
        line?: string,
        allowedBrandIds?: ReadonlySet<string>,
      ) =>
        rows.flatMap((record) => {
          const share = billingAllocation(record, brandId, line, allowedBrandIds);
          if (share <= 0) return [];
          return [
            {
              id: record.id,
              opportunityId: record.opportunityId,
              amount: money(record.amount) * share,
              grossProfit: record.grossProfit === null ? null : money(record.grossProfit) * share,
            },
          ];
        });
      const dataCenterBilling = allocateBilling(
        billing,
        query.brandId,
        query.line,
        query.brandId ? undefined : dataCenterBrandIds,
      );
      const quotaRows = allQuotaRows.filter(
        (row) =>
          row.assigneeId === (query.sellerId ?? null) && row.brandId === (query.brandId ?? null),
      );

      const commercialRow = (
        opportunity: (typeof opportunities)[number],
        brandId?: string,
        line?: string,
        allowedBrandIds?: ReadonlySet<string>,
      ) => {
        const stageCode = opportunity.stage.code;
        const inClosePeriod =
          opportunity.expectedCloseDate >= period.start &&
          opportunity.expectedCloseDate <= period.end;
        const inBillingPeriod = Boolean(
          opportunity.expectedBillingDate &&
          opportunity.expectedBillingDate >= period.start &&
          opportunity.expectedBillingDate <= period.end,
        );
        if (!(['20', '40', '60', '80'].includes(stageCode) ? inClosePeriod : inBillingPeriod)) {
          return null;
        }
        const allocation = allocationFor(opportunity, brandId, line, allowedBrandIds);
        if (allocation.amount <= 0) return null;
        return {
          id: opportunity.id,
          amount: allocation.amount,
          grossProfit:
            allocation.grossProfit ??
            (opportunity.grossProfit ? money(opportunity.grossProfit) : null),
          stageCode,
          status: opportunity.status,
          expectedBillingDate: opportunity.expectedBillingDate,
          lastStageChangedAt: opportunity.lastStageChangedAt,
        };
      };
      const periodOpportunities = dashboardOpportunities.flatMap((opportunity) => {
        const row = commercialRow(
          opportunity,
          query.brandId,
          query.line,
          query.brandId ? undefined : dataCenterBrandIds,
        );
        return row ? [row] : [];
      });
      const buckets = managerCommercialBuckets(periodOpportunities);
      const billed = dataCenterBilling.reduce((total, record) => total + record.amount, 0);
      const billingMargin = weightedGrossMargin(
        dataCenterBilling.map((record) => ({
          amount: record.amount,
          grossProfit: record.grossProfit,
        })),
      );
      const quota = quotaRows.length
        ? quotaRows.reduce((total, row) => total + money(row.amount), 0)
        : null;
      const pendingTarget = quota === null ? null : Math.max(0, quota - billed);
      const coverage = fourToOneCoverage({
        baseAmount: pendingTarget,
        availablePipeline: buckets.pipeline,
        ratio: money(settings.pipelineCoverageRatio),
      });

      const matchesFilter = (item: (typeof snapshots)[number]['items'][number]) =>
        (!query.sellerId || item.opportunity.sellerId === query.sellerId) &&
        (!query.brandId ||
          item.opportunity.lineItems.some((line) => line.brandId === query.brandId)) &&
        (Boolean(query.brandId) ||
          item.opportunity.lineItems.some((line) => dataCenterBrandIds.has(line.brandId))) &&
        (!query.line ||
          item.opportunity.lineItems.some((line) => matchesLine(line.productLine, query.line)));
      const snapshotMetrics = (snapshot: (typeof snapshots)[number] | undefined) =>
        snapshot
          ? snapshot.items.filter(matchesFilter).flatMap((item) => {
              const allLines = item.opportunity.lineItems;
              const total = allLines.reduce((sum, entry) => sum + money(entry.amount), 0);
              const selected = allLines
                .filter(
                  (entry) =>
                    (!query.brandId || entry.brandId === query.brandId) &&
                    (Boolean(query.brandId) || dataCenterBrandIds.has(entry.brandId)) &&
                    matchesLine(entry.productLine, query.line),
                )
                .reduce((sum, entry) => sum + money(entry.amount), 0);
              const amount = total > 0 ? money(item.estimatedAmount) * (selected / total) : 0;
              return amount > 0
                ? [
                    {
                      opportunityId: item.opportunityId,
                      amount,
                      stageCode: item.stage.code,
                      status: item.status,
                    },
                  ]
                : [];
            })
          : null;
      const movement = compareWeeklyPipeline(
        snapshotMetrics(snapshots[0]),
        snapshotMetrics(snapshots[1]),
      );

      const stageBreakdown = STAGE_CODES.map((stageCode) => {
        if (stageCode === '100') {
          return {
            stageCode,
            count: dataCenterBilling.length,
            amount: billed,
            opportunityIds: dataCenterBilling.flatMap((record) =>
              record.opportunityId ? [record.opportunityId] : [],
            ),
          };
        }
        const rows = periodOpportunities.filter((item) => item.stageCode === stageCode);
        return {
          stageCode,
          count: rows.length,
          amount: rows.reduce((total, item) => total + item.amount, 0),
          opportunityIds: rows.map((item) => item.id),
        };
      });

      const brandHierarchy = dataCenterBrands
        .filter((brand) => !query.brandId || brand.id === query.brandId)
        .map((brand) => {
          const opportunityRows = opportunities.filter((opportunity) =>
            opportunity.lineItems.some(
              (item) => item.brandId === brand.id && matchesLine(item.productLine, query.line),
            ),
          );
          const allocated = opportunityRows.flatMap((opportunity) => {
            const row = commercialRow(opportunity, brand.id, query.line);
            return row ? [row] : [];
          });
          const brandBuckets = managerCommercialBuckets(allocated);
          const brandBilling = allocateBilling(billing, brand.id, query.line);
          const lineNames = new Map<string, string>();
          for (const opportunity of opportunityRows) {
            for (const item of opportunity.lineItems.filter((line) => line.brandId === brand.id)) {
              const name = item.productLine?.trim() || UNCLASSIFIED_LINE;
              if (matchesLine(item.productLine, query.line)) {
                lineNames.set(name.toLocaleLowerCase(), name);
              }
            }
          }
          const brandQuotaRows = allQuotaRows.filter(
            (row) => row.brandId === brand.id && row.assigneeId === (query.sellerId ?? null),
          );
          return {
            brandId: brand.id,
            brand: brand.name,
            mappingState: ['HP', 'HPE'].includes(brand.name.toLocaleUpperCase())
              ? 'ALIAS_PENDING_CONFIRMATION'
              : 'SOURCE_LABEL',
            quota: brandQuotaRows.length
              ? brandQuotaRows.reduce((total, row) => total + money(row.amount), 0)
              : null,
            billed: brandBilling.reduce((total, row) => total + row.amount, 0),
            ...brandBuckets,
            lines: [...lineNames.values()].map((line) => {
              const lineRows = opportunityRows.flatMap((opportunity) => {
                const row = commercialRow(opportunity, brand.id, line);
                return row ? [row] : [];
              });
              const lineBuckets = managerCommercialBuckets(lineRows);
              const lineBilling = allocateBilling(billing, brand.id, line);
              return {
                line,
                quota: null,
                billed: lineBilling.reduce((total, row) => total + row.amount, 0),
                ...lineBuckets,
                opportunityIds: lineRows.map((row) => row.id),
              };
            }),
          };
        });

      const sellerMap = new Map<string, { id: string; name: string; rows: typeof opportunities }>();
      for (const opportunity of dashboardOpportunities) {
        const currentSeller = sellerMap.get(opportunity.sellerId) ?? {
          id: opportunity.sellerId,
          name: opportunity.seller.name,
          rows: [],
        };
        currentSeller.rows.push(opportunity);
        sellerMap.set(opportunity.sellerId, currentSeller);
      }
      for (const visit of visits) {
        if (!sellerMap.has(visit.sellerId)) {
          sellerMap.set(visit.sellerId, { id: visit.sellerId, name: visit.seller.name, rows: [] });
        }
      }
      const weekClosed = isClosedWeek(week.end, now);
      const sellerPerformance = [...sellerMap.values()].map((seller) => {
        const rows = seller.rows.flatMap((opportunity) => {
          const row = commercialRow(
            opportunity,
            query.brandId,
            query.line,
            query.brandId ? undefined : dataCenterBrandIds,
          );
          return row ? [row] : [];
        });
        const sellerBuckets = managerCommercialBuckets(rows);
        const sellerVisits = visits.filter((visit) => visit.sellerId === seller.id);
        const margin = weightedGrossMargin(rows);
        return {
          sellerId: seller.id,
          seller: seller.name,
          opportunities: rows.length,
          ...sellerBuckets,
          visitedCustomers: distinctCustomersVisited(sellerVisits),
          visitTarget: settings.weeklyVisitTarget,
          visitStatus: weekClosed ? 'CLOSED' : 'IN_PROGRESS',
          grossMarginAmount: margin.amount,
          grossMarginPercent: margin.percent,
        };
      });

      const alerts: Array<Record<string, unknown>> = [];
      if (movement.status === 'AVAILABLE' && movement.droppedMoreThanTenPercent) {
        alerts.push({
          id: `A01-${snapshots[0]?.id}`,
          code: 'A01',
          group: 'SELLERS_BRANDS',
          kind: 'SIGNAL',
          severity: 'HIGH',
          title: 'El pipeline bajó esta semana',
          observed: movement,
          rule: 'Descenso estrictamente mayor al 10% en etapas 20/40',
          cutoff: snapshots[0]?.createdAt,
          affectedAmount: movement.changeAmount === null ? null : Math.abs(movement.changeAmount),
        });
      } else if (movement.status === 'NO_COMPARISON') {
        alerts.push({
          id: 'A01-NO-BASELINE',
          code: 'A01',
          group: 'SELLERS_BRANDS',
          kind: 'MISSING_INFORMATION',
          severity: 'INFO',
          title: 'Pipeline semanal sin comparación',
          rule: 'Requiere dos cortes semanales comparables',
          cutoff: null,
          affectedAmount: null,
        });
      }
      alerts.push({
        id: 'A02-COVERAGE',
        code: 'A02',
        group: 'SELLERS_BRANDS',
        kind:
          coverage.status === 'INSUFFICIENT'
            ? 'SIGNAL'
            : coverage.status === 'NOT_EVALUABLE'
              ? 'MISSING_INFORMATION'
              : 'CONTEXT',
        severity: coverage.status === 'INSUFFICIENT' ? 'HIGH' : 'INFO',
        title:
          coverage.status === 'NOT_EVALUABLE'
            ? 'Pipeline 4:1 no evaluable'
            : coverage.status === 'INSUFFICIENT'
              ? 'Pipeline insuficiente para la cuota'
              : 'Pipeline cubre la regla de trabajo 4:1',
        observed: coverage,
        rule: `Pipeline requerido = base pendiente × ${coverage.ratio}`,
        cutoff: isoDate(period.end),
        affectedAmount:
          coverage.difference === null ? null : Math.abs(Math.min(0, coverage.difference)),
      });
      for (const seller of sellerPerformance) {
        if (weekClosed && seller.visitedCustomers < seller.visitTarget) {
          alerts.push({
            id: `A03-${seller.sellerId}-${isoDate(week.start)}`,
            code: 'A03',
            group: 'SELLERS_BRANDS',
            kind: 'SIGNAL',
            severity: 'WARNING',
            title: 'Faltan visitas registradas',
            entity: { id: seller.sellerId, label: seller.seller },
            observed: { visitedCustomers: seller.visitedCustomers, target: seller.visitTarget },
            rule: 'Tres clientes distintos por semana',
            cutoff: isoDate(week.end),
            affectedAmount: null,
          });
        }
      }
      for (const visit of visits.filter((item) => item.foundOpportunity && !item.opportunityId)) {
        alerts.push({
          id: `A04-${visit.id}`,
          code: 'A04',
          group: 'DEALS',
          kind: 'CONTEXT',
          severity: 'WARNING',
          title: 'Visita con oportunidad pendiente de vincular',
          entity: { id: visit.id, label: `${visit.customer.name} · ${visit.seller.name}` },
          observed: { visitedAt: isoDate(visit.visitedAt) },
          rule: 'Resultado Sí requiere una referencia válida cuando el negocio ya está cargado',
          cutoff: latestBatch?.sourceCutoff ? isoDate(latestBatch.sourceCutoff) : null,
          affectedAmount: null,
        });
      }

      const stalled: Array<Record<string, unknown>> = [];
      for (const opportunity of dashboardOpportunities) {
        const latestHistory = opportunity.stageHistory[0];
        const reliableDate = !latestHistory?.reason?.startsWith('Commercial import');
        if (!reliableDate && opportunity.status === 'OPEN' && opportunity.stage.code !== '100') {
          alerts.push({
            id: `A05-MISSING-DATE-${opportunity.id}`,
            code: 'A05',
            group: 'DEALS',
            kind: 'MISSING_INFORMATION',
            severity: 'INFO',
            title: 'Fecha de avance no verificable',
            entity: { id: opportunity.id, label: opportunity.title },
            observed: { stageCode: opportunity.stage.code, reliableTransitionDate: null },
            rule: `${settings.stalledOpportunityDays} días; configuración heredada pendiente de confirmar`,
            cutoff: latestBatch?.sourceCutoff ? isoDate(latestBatch.sourceCutoff) : null,
            affectedAmount: null,
            opportunityId: opportunity.id,
          });
        }
        const evaluation = stalledOpportunity({
          status: opportunity.status,
          stageCode: opportunity.stage.code,
          lastStageChangedAt: reliableDate ? opportunity.lastStageChangedAt : null,
          thresholdDays: settings.stalledOpportunityDays,
          now,
        });
        if (evaluation.stalled) {
          const item = {
            opportunityId: opportunity.id,
            title: opportunity.title,
            sellerId: opportunity.sellerId,
            seller: opportunity.seller.name,
            stageCode: opportunity.stage.code,
            startedAt: isoDate(opportunity.lastStageChangedAt),
            daysWithoutProgress: evaluation.daysWithoutProgress,
            thresholdDays: settings.stalledOpportunityDays,
            thresholdSource: 'INHERITED_TENANT_CONFIGURATION',
            amount: money(opportunity.estimatedAmount),
          };
          stalled.push(item);
          alerts.push({
            id: `A05-${opportunity.id}`,
            code: 'A05',
            group: 'DEALS',
            kind: 'SIGNAL',
            severity: 'WARNING',
            title: 'Oportunidad sin avanzar de etapa',
            entity: { id: opportunity.id, label: opportunity.title },
            observed: item,
            rule: `${settings.stalledOpportunityDays} días; configuración heredada pendiente de confirmar`,
            cutoff: isoDate(now),
            affectedAmount: money(opportunity.estimatedAmount),
            opportunityId: opportunity.id,
          });
        }
      }
      for (const opportunity of dashboardOpportunities.filter(
        (item) => item.status === 'WON' && item.stage.code === BACKLOG_STAGE,
      )) {
        const billedAmount = opportunity.billingRecords.reduce(
          (total, record) => total + money(record.amount),
          0,
        );
        const outstanding = outstandingBacklogAmount({
          opportunityAmount: money(opportunity.estimatedAmount),
          billedAmount,
        });
        const outside =
          opportunity.expectedBillingDate &&
          (opportunity.expectedBillingDate < period.start ||
            opportunity.expectedBillingDate > period.end);
        if (outside || !opportunity.expectedBillingDate) {
          alerts.push({
            id: `A06-${opportunity.id}`,
            code: 'A06',
            group: 'DEALS',
            kind: opportunity.expectedBillingDate ? 'CONTEXT' : 'MISSING_INFORMATION',
            severity: 'WARNING',
            title: opportunity.expectedBillingDate
              ? 'Backlog fuera de este trimestre'
              : 'Backlog con fecha de facturación pendiente',
            entity: { id: opportunity.id, label: opportunity.title },
            observed: {
              expectedBillingDate: opportunity.expectedBillingDate
                ? isoDate(opportunity.expectedBillingDate)
                : null,
              outstanding,
            },
            rule: `Backlog 90 pendiente cuya facturación no cae en ${period.label}`,
            cutoff: isoDate(period.end),
            affectedAmount: outstanding,
            opportunityId: opportunity.id,
          });
        }
      }
      for (const opportunity of dashboardOpportunities) {
        const allocation = allocationFor(
          opportunity,
          query.brandId,
          query.line,
          query.brandId ? undefined : dataCenterBrandIds,
        );
        const amount = allocation.amount;
        const grossProfit =
          allocation.grossProfit ??
          (opportunity.grossProfit ? money(opportunity.grossProfit) : null);
        const margin = weightedGrossMargin([{ amount, grossProfit }]);
        if (margin.percent !== null && margin.percent < money(settings.defaultMarginThreshold)) {
          alerts.push({
            id: `A07-${opportunity.id}`,
            code: 'A07',
            group: 'DEALS',
            kind: 'SIGNAL',
            severity: 'WARNING',
            title: 'Margen por debajo del objetivo',
            entity: { id: opportunity.id, label: opportunity.title },
            observed: { marginPercent: margin.percent, grossProfit: margin.amount },
            rule: `Objetivo configurado ${money(settings.defaultMarginThreshold)}%`,
            cutoff: isoDate(period.end),
            affectedAmount: amount,
            opportunityId: opportunity.id,
          });
        }
      }

      const importState = latestBatch
        ? {
            status: latestBatch.status,
            partial: latestBatch.isPartial,
            sourceCutoff: latestBatch.sourceCutoff ? isoDate(latestBatch.sourceCutoff) : null,
            loadedAt: latestBatch.createdAt,
            summary: latestBatch.summary,
          }
        : {
            status: 'NO_PUBLISHED_BATCH',
            partial: false,
            sourceCutoff: null,
            loadedAt: null,
            summary: null,
          };

      return {
        generatedAt: now,
        currency: settings.currency,
        periods: [current, next].map((item, index) => ({
          value: index === 0 ? 'current' : 'next',
          label: item.label,
          start: isoDate(item.start),
          end: isoDate(item.end),
        })),
        filters: {
          selected: {
            period: query.period,
            brandId: query.brandId ?? null,
            line: query.line ?? null,
            sellerId: query.sellerId ?? null,
            weekStart: isoDate(week.start),
          },
          brands: dataCenterBrands.map((brand) => ({ id: brand.id, name: brand.name })),
          lines: [
            ...new Set(
              dashboardOpportunities.flatMap((item) =>
                item.lineItems.flatMap((line) => (line.productLine ? [line.productLine] : [])),
              ),
            ),
          ].sort(),
          sellers: [...sellerMap.values()].map((seller) => ({ id: seller.id, name: seller.name })),
        },
        period: { label: period.label, start: isoDate(period.start), end: isoDate(period.end) },
        week: { start: isoDate(week.start), end: isoDate(week.end), closed: weekClosed },
        importState,
        summary: {
          quota,
          billed,
          pipeline: buckets.pipeline,
          forecast: buckets.forecast,
          backlog: buckets.backlog,
          forecastAndBacklog: buckets.forecastAndBacklog,
          closeProjection: buckets.forecastAndBacklog,
          compliance: { status: 'PENDING_VALIDATION', reason: 'D01_TOTAL_DEFINITION' },
          marginAmount: billingMargin.amount,
          marginPercent: billingMargin.percent,
          marginTarget: money(settings.defaultMarginThreshold),
        },
        coverage,
        brandHierarchy: {
          label: 'Data Center',
          aliasDecision: 'D04_PENDING',
          brands: brandHierarchy,
        },
        weeklyPipeline: {
          currentCutoff: snapshots[0]?.createdAt ?? null,
          previousCutoff: snapshots[1]?.createdAt ?? null,
          ...movement,
        },
        stages: stageBreakdown,
        visits: visits.map((visit) => ({
          id: visit.id,
          sellerId: visit.sellerId,
          seller: visit.seller.name,
          customerId: visit.customerId,
          customer: visit.customer.name,
          visitedAt: isoDate(visit.visitedAt),
          foundOpportunity: visit.foundOpportunity,
          opportunity: visit.opportunity,
          linkStatus: visit.foundOpportunity && !visit.opportunity ? 'PENDING_LINK' : 'COMPLETE',
        })),
        sellerPerformance,
        stalled,
        salesCycle: {
          status: 'PENDING_DEFINITION',
          reason: 'D03_END_EVENT_CLOSE_OR_BILLING',
          averageDays: null,
        },
        alerts,
      };
    });
  }
}
