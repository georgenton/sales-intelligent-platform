import { ForbiddenException, Injectable } from '@nestjs/common';
import type { ForecastSnapshotScopeType } from '@prisma/client';
import type { RequestAuth } from '../../common/http/authenticated-request';
import { PrismaService } from '../../common/prisma/prisma.service';
import { currentFiscalQuarter } from '../analytics/fiscal-period';
import { opportunityReadScope } from '../authorization/opportunity-scope';
import { compareForecastSnapshots } from './snapshot-diff';

@Injectable()
export class ForecastService {
  constructor(private readonly prisma: PrismaService) {}

  list(auth: RequestAuth) {
    return this.prisma.withTenant(auth.activeTenantId, (transaction) =>
      transaction.forecastSnapshot.findMany({
        where: { tenantId: auth.activeTenantId, ...this.snapshotScope(auth) },
        include: { _count: { select: { items: true } } },
        orderBy: { createdAt: 'desc' },
        take: 25,
      }),
    );
  }

  async latestDiff(auth: RequestAuth) {
    return this.prisma.withTenant(auth.activeTenantId, async (transaction) => {
      const snapshots = await transaction.forecastSnapshot.findMany({
        where: { tenantId: auth.activeTenantId, ...this.snapshotScope(auth) },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        take: 2,
      });
      const current = snapshots[0];
      const previous = snapshots[1];
      if (!current) return { currentSnapshotId: null, previousSnapshotId: null, diff: null };
      return {
        currentSnapshotId: current.id,
        previousSnapshotId: previous?.id ?? null,
        diff: compareForecastSnapshots(current.items, previous?.items ?? []),
      };
    });
  }

  async create(auth: RequestAuth, requestId: string) {
    if (!['PLATFORM_ADMIN', 'TENANT_ADMIN', 'MANAGER'].includes(auth.role)) {
      throw new ForbiddenException('Forecast snapshot creation is not permitted');
    }
    return this.prisma.withTenant(auth.activeTenantId, async (transaction) => {
      const settings = await transaction.tenantSetting.findUniqueOrThrow({
        where: { tenantId: auth.activeTenantId },
      });
      const period = currentFiscalQuarter(new Date(), settings.fiscalYearStartMonth);
      const snapshotScope = this.snapshotScope(auth);
      const opportunities = await transaction.opportunity.findMany({
        where: {
          tenantId: auth.activeTenantId,
          deletedAt: null,
          expectedCloseDate: { gte: period.start, lte: period.end },
          ...opportunityReadScope(auth),
        },
      });
      const snapshot = await transaction.forecastSnapshot.create({
        data: {
          tenantId: auth.activeTenantId,
          createdById: auth.userId,
          ...snapshotScope,
          periodStart: period.start,
          periodEnd: period.end,
          items: {
            create: opportunities.map((opportunity) => ({
              tenantId: auth.activeTenantId,
              opportunityId: opportunity.id,
              stageId: opportunity.stageId,
              status: opportunity.status,
              forecastCategory: opportunity.forecastCategory,
              estimatedAmount: opportunity.estimatedAmount,
              expectedCloseDate: opportunity.expectedCloseDate,
              expectedBillingDate: opportunity.expectedBillingDate,
            })),
          },
        },
        include: { _count: { select: { items: true } } },
      });
      await transaction.auditEvent.create({
        data: {
          tenantId: auth.activeTenantId,
          actorId: auth.userId,
          action: 'FORECAST_SNAPSHOT_CREATED',
          entity: 'ForecastSnapshot',
          entityId: snapshot.id,
          requestId,
          metadata: {
            items: snapshot._count.items,
            period: period.label,
            scopeType: snapshotScope.scopeType,
            scopeUserId: snapshotScope.scopeUserId,
          },
        },
      });
      return snapshot;
    });
  }

  private snapshotScope(auth: RequestAuth): {
    scopeType: ForecastSnapshotScopeType;
    scopeUserId: string | null;
  } {
    if (auth.role === 'MANAGER') {
      return { scopeType: 'TEAM', scopeUserId: auth.userId };
    }
    if (auth.role === 'SELLER') {
      return { scopeType: 'OWN', scopeUserId: auth.userId };
    }
    return { scopeType: 'TENANT', scopeUserId: null };
  }
}
