import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { ForecastHealth } from '@sip/shared';
import type { RequestAuth } from '../../common/http/authenticated-request';
import { PrismaService } from '../../common/prisma/prisma.service';
import { evaluateOpportunityRisk } from '../alerts/forecast-health.engine';
import { PERMISSIONS } from '../authorization/permissions';
import type { CreateOpportunityDto } from './dto/create-opportunity.dto';
import type { ListOpportunitiesDto } from './dto/list-opportunities.dto';
import type { UpdateOpportunityDto } from './dto/update-opportunity.dto';

const opportunityInclude = {
  seller: { select: { id: true, name: true } },
  manager: { select: { id: true, name: true } },
  customer: { select: { id: true, name: true } },
  partner: { select: { id: true, name: true } },
  stage: true,
  lineItems: { include: { brand: true } },
  alerts: { where: { resolvedAt: null }, orderBy: { severity: 'desc' as const } },
} satisfies Prisma.OpportunityInclude;

type OpportunityWithRelations = Prisma.OpportunityGetPayload<{
  include: typeof opportunityInclude;
}>;

@Injectable()
export class OpportunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(auth: RequestAuth, query: ListOpportunitiesDto) {
    return this.prisma.withTenant(auth.activeTenantId, async (transaction) => {
      const where: Prisma.OpportunityWhereInput = {
        tenantId: auth.activeTenantId,
        deletedAt: null,
        ...this.scope(auth),
        ...(query.status ? { status: query.status } : {}),
        ...(query.stageId ? { stageId: query.stageId } : {}),
        ...(query.brandId ? { lineItems: { some: { brandId: query.brandId } } } : {}),
        ...(query.search
          ? {
              OR: [
                { title: { contains: query.search, mode: 'insensitive' } },
                { customer: { name: { contains: query.search, mode: 'insensitive' } } },
              ],
            }
          : {}),
      };
      const [items, total, settings] = await Promise.all([
        transaction.opportunity.findMany({
          where,
          include: opportunityInclude,
          orderBy: [{ expectedCloseDate: 'asc' }, { updatedAt: 'desc' }],
          skip: (query.page - 1) * query.perPage,
          take: query.perPage,
        }),
        transaction.opportunity.count({ where }),
        transaction.tenantSetting.findUniqueOrThrow({ where: { tenantId: auth.activeTenantId } }),
      ]);
      return {
        items: items.map((item) =>
          this.serialize(item, settings.defaultMarginThreshold.toNumber()),
        ),
        pagination: {
          page: query.page,
          perPage: query.perPage,
          total,
          pages: Math.ceil(total / query.perPage),
        },
      };
    });
  }

  async detail(auth: RequestAuth, id: string) {
    return this.prisma.withTenant(auth.activeTenantId, async (transaction) => {
      const [opportunity, settings, auditTrail] = await Promise.all([
        transaction.opportunity.findFirst({
          where: { id, tenantId: auth.activeTenantId, deletedAt: null, ...this.scope(auth) },
          include: {
            ...opportunityInclude,
            stageHistory: {
              include: {
                fromStage: true,
                toStage: true,
                changedBy: { select: { id: true, name: true } },
              },
              orderBy: { changedAt: 'desc' },
            },
          },
        }),
        transaction.tenantSetting.findUniqueOrThrow({ where: { tenantId: auth.activeTenantId } }),
        transaction.auditEvent.findMany({
          where: { tenantId: auth.activeTenantId, entity: 'Opportunity', entityId: id },
          select: {
            id: true,
            action: true,
            occurredAt: true,
            metadata: true,
            actor: { select: { name: true } },
          },
          orderBy: { occurredAt: 'desc' },
          take: 20,
        }),
      ]);
      if (!opportunity) {
        throw new NotFoundException({
          code: 'OPPORTUNITY_NOT_FOUND',
          message: 'Opportunity not found',
        });
      }
      return {
        ...this.serialize(opportunity, settings.defaultMarginThreshold.toNumber()),
        auditTrail,
      };
    });
  }

  async referenceData(auth: RequestAuth) {
    return this.prisma.withTenant(auth.activeTenantId, async (transaction) => {
      const [stages, brands, partners, customers, memberships, settings] = await Promise.all([
        transaction.stage.findMany({
          where: { tenantId: auth.activeTenantId },
          orderBy: { sortOrder: 'asc' },
        }),
        transaction.brand.findMany({
          where: { tenantId: auth.activeTenantId },
          orderBy: { name: 'asc' },
        }),
        transaction.partner.findMany({
          where: { tenantId: auth.activeTenantId },
          orderBy: { name: 'asc' },
        }),
        transaction.customer.findMany({
          where: { tenantId: auth.activeTenantId },
          orderBy: { name: 'asc' },
        }),
        transaction.tenantMembership.findMany({
          where: {
            tenantId: auth.activeTenantId,
            status: 'ACTIVE',
            role: { in: ['SELLER', 'MANAGER'] },
          },
          include: { user: { select: { id: true, name: true } } },
        }),
        transaction.tenantSetting.findUniqueOrThrow({ where: { tenantId: auth.activeTenantId } }),
      ]);
      return {
        stages,
        brands,
        partners,
        customers,
        users: memberships.map((item) => ({ ...item.user, role: item.role })),
        settings,
      };
    });
  }

  async create(auth: RequestAuth, input: CreateOpportunityDto, requestId: string) {
    const sellerId = auth.permissions.has(PERMISSIONS.OPPORTUNITIES_UPDATE_ALL)
      ? (input.sellerId ?? auth.userId)
      : auth.userId;
    return this.prisma.withTenant(auth.activeTenantId, async (transaction) => {
      const [stage, settings, customer, seller] = await Promise.all([
        transaction.stage.findFirst({
          where: { id: input.stageId, tenantId: auth.activeTenantId },
        }),
        transaction.tenantSetting.findUniqueOrThrow({ where: { tenantId: auth.activeTenantId } }),
        transaction.customer.findFirst({
          where: { id: input.customerId, tenantId: auth.activeTenantId },
        }),
        transaction.tenantMembership.findFirst({
          where: { tenantId: auth.activeTenantId, userId: sellerId, status: 'ACTIVE' },
        }),
      ]);
      if (!stage || !customer || !seller)
        throw new ForbiddenException('Invalid tenant-owned reference');
      if (input.lineItems.length) {
        const brandCount = await transaction.brand.count({
          where: {
            tenantId: auth.activeTenantId,
            id: { in: input.lineItems.map((item) => item.brandId) },
          },
        });
        if (brandCount !== new Set(input.lineItems.map((item) => item.brandId)).size) {
          throw new ForbiddenException('Invalid tenant-owned brand reference');
        }
      }
      const opportunity = await transaction.opportunity.create({
        data: {
          tenantId: auth.activeTenantId,
          sellerId,
          managerId: input.managerId,
          customerId: input.customerId,
          partnerId: input.partnerId,
          title: input.title.trim(),
          status: input.status,
          stageId: stage.id,
          forecastCategory: input.forecastCategory,
          currency: input.currency.toUpperCase(),
          estimatedAmount: new Prisma.Decimal(input.estimatedAmount),
          grossProfit: input.grossProfit ? new Prisma.Decimal(input.grossProfit) : null,
          probability: input.probability ?? stage.probability,
          expectedCloseDate: new Date(input.expectedCloseDate),
          expectedBillingDate: input.expectedBillingDate
            ? new Date(input.expectedBillingDate)
            : null,
          poNumber: input.poNumber?.trim() || null,
          notes: input.notes?.trim() || null,
          lineItems: {
            create: input.lineItems.map((item) => ({
              tenantId: auth.activeTenantId,
              brandId: item.brandId,
              description: item.description.trim(),
              amount: new Prisma.Decimal(item.amount),
              cost: item.cost ? new Prisma.Decimal(item.cost) : null,
            })),
          },
          stageHistory: {
            create: {
              tenantId: auth.activeTenantId,
              toStageId: stage.id,
              changedById: auth.userId,
              reason: 'Opportunity created',
            },
          },
        },
        include: opportunityInclude,
      });
      await this.replaceAlerts(
        transaction,
        opportunity,
        settings.defaultMarginThreshold.toNumber(),
      );
      await transaction.auditEvent.create({
        data: {
          tenantId: auth.activeTenantId,
          actorId: auth.userId,
          action: 'OPPORTUNITY_CREATED',
          entity: 'Opportunity',
          entityId: opportunity.id,
          requestId,
          metadata: { status: opportunity.status, stageId: opportunity.stageId },
        },
      });
      const refreshed = await transaction.opportunity.findUniqueOrThrow({
        where: { id: opportunity.id },
        include: opportunityInclude,
      });
      return this.serialize(refreshed, settings.defaultMarginThreshold.toNumber());
    });
  }

  async update(auth: RequestAuth, id: string, input: UpdateOpportunityDto, requestId: string) {
    return this.prisma.withTenant(auth.activeTenantId, async (transaction) => {
      const current = await transaction.opportunity.findFirst({
        where: { id, tenantId: auth.activeTenantId, deletedAt: null, ...this.scope(auth, true) },
        include: { stage: true },
      });
      if (!current)
        throw new NotFoundException({
          code: 'OPPORTUNITY_NOT_FOUND',
          message: 'Opportunity not found',
        });
      const stage = input.stageId
        ? await transaction.stage.findFirst({
            where: { id: input.stageId, tenantId: auth.activeTenantId },
          })
        : current.stage;
      if (!stage) throw new ForbiddenException('Invalid tenant-owned stage reference');
      const stageChanged = stage.id !== current.stageId;
      await transaction.opportunity.update({
        where: { id },
        data: {
          ...(input.title !== undefined ? { title: input.title.trim() } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
          ...(input.stageId !== undefined
            ? { stageId: stage.id, probability: input.probability ?? stage.probability }
            : {}),
          ...(input.forecastCategory !== undefined
            ? { forecastCategory: input.forecastCategory }
            : {}),
          ...(input.estimatedAmount !== undefined
            ? { estimatedAmount: new Prisma.Decimal(input.estimatedAmount) }
            : {}),
          ...(input.grossProfit !== undefined
            ? { grossProfit: new Prisma.Decimal(input.grossProfit) }
            : {}),
          ...(input.expectedCloseDate !== undefined
            ? { expectedCloseDate: new Date(input.expectedCloseDate) }
            : {}),
          ...(input.expectedBillingDate !== undefined
            ? { expectedBillingDate: new Date(input.expectedBillingDate) }
            : {}),
          ...(input.poNumber !== undefined ? { poNumber: input.poNumber.trim() || null } : {}),
          ...(input.notes !== undefined ? { notes: input.notes.trim() || null } : {}),
          ...(stageChanged ? { lastStageChangedAt: new Date() } : {}),
        },
      });
      if (stageChanged) {
        await transaction.stageHistory.create({
          data: {
            tenantId: auth.activeTenantId,
            opportunityId: id,
            fromStageId: current.stageId,
            toStageId: stage.id,
            changedById: auth.userId,
            reason: input.notes?.slice(0, 500),
          },
        });
      }
      const updated = await transaction.opportunity.findUniqueOrThrow({
        where: { id },
        include: opportunityInclude,
      });
      const settings = await transaction.tenantSetting.findUniqueOrThrow({
        where: { tenantId: auth.activeTenantId },
      });
      await this.replaceAlerts(transaction, updated, settings.defaultMarginThreshold.toNumber());
      await transaction.auditEvent.create({
        data: {
          tenantId: auth.activeTenantId,
          actorId: auth.userId,
          action: stageChanged ? 'OPPORTUNITY_STAGE_CHANGED' : 'OPPORTUNITY_UPDATED',
          entity: 'Opportunity',
          entityId: id,
          requestId,
          metadata: stageChanged
            ? { fromStageId: current.stageId, toStageId: stage.id }
            : { fields: Object.keys(input) },
        },
      });
      const refreshed = await transaction.opportunity.findUniqueOrThrow({
        where: { id },
        include: opportunityInclude,
      });
      return this.serialize(refreshed, settings.defaultMarginThreshold.toNumber());
    });
  }

  private scope(auth: RequestAuth, forUpdate = false): Prisma.OpportunityWhereInput {
    if (
      auth.permissions.has(
        forUpdate ? PERMISSIONS.OPPORTUNITIES_UPDATE_ALL : PERMISSIONS.OPPORTUNITIES_READ_ALL,
      )
    )
      return {};
    if (!forUpdate && auth.permissions.has(PERMISSIONS.OPPORTUNITIES_READ_TEAM)) {
      return { OR: [{ managerId: auth.userId }, { sellerId: auth.userId }] };
    }
    return { sellerId: auth.userId };
  }

  private risk(opportunity: OpportunityWithRelations, marginThreshold: number) {
    return evaluateOpportunityRisk({
      amount: opportunity.estimatedAmount.toNumber(),
      grossProfit: opportunity.grossProfit?.toNumber() ?? null,
      stageProbability: opportunity.stage.probability,
      poNumber: opportunity.poNumber,
      expectedCloseDate: opportunity.expectedCloseDate,
      expectedBillingDate: opportunity.expectedBillingDate,
      lastStageChangedAt: opportunity.lastStageChangedAt,
      marginThreshold,
    });
  }

  private serialize<T extends OpportunityWithRelations>(
    opportunity: T,
    marginThreshold: number,
  ): T & {
    estimatedAmount: number;
    grossProfit: number | null;
    margin: number | null;
    health: ForecastHealth;
  } {
    const amount = opportunity.estimatedAmount.toNumber();
    const grossProfit = opportunity.grossProfit?.toNumber() ?? null;
    return {
      ...opportunity,
      estimatedAmount: amount,
      grossProfit,
      margin: grossProfit === null || amount === 0 ? null : (grossProfit / amount) * 100,
      lineItems: opportunity.lineItems.map((item) => ({
        ...item,
        amount: item.amount.toNumber(),
        cost: item.cost?.toNumber() ?? null,
      })),
      health: this.risk(opportunity, marginThreshold).health,
    };
  }

  private async replaceAlerts(
    transaction: Prisma.TransactionClient,
    opportunity: OpportunityWithRelations,
    marginThreshold: number,
  ): Promise<void> {
    const risk = this.risk(opportunity, marginThreshold);
    await transaction.alert.deleteMany({
      where: { tenantId: opportunity.tenantId, opportunityId: opportunity.id, resolvedAt: null },
    });
    if (risk.alerts.length) {
      await transaction.alert.createMany({
        data: risk.alerts.map((alert) => ({
          tenantId: opportunity.tenantId,
          opportunityId: opportunity.id,
          ...alert,
        })),
      });
    }
  }
}
