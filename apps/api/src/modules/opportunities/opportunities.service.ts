import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { ForecastHealth } from '@sip/shared';
import type { RequestAuth } from '../../common/http/authenticated-request';
import { PrismaService } from '../../common/prisma/prisma.service';
import { evaluateOpportunityRisk } from '../alerts/forecast-health.engine';
import { PERMISSIONS } from '../authorization/permissions';
import {
  canUpdateOpportunities,
  opportunityReadScope,
  opportunityUpdateScope,
} from '../authorization/opportunity-scope';
import type { CreateOpportunityDto } from './dto/create-opportunity.dto';
import type { ListOpportunitiesDto } from './dto/list-opportunities.dto';
import type { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import {
  calculateFinancials,
  commercialStateIssue,
  defaultForecastCategory,
  defaultOpportunityStatus,
  requiredQualificationGates,
} from './commercial-domain';
import { QualificationService } from '../qualification/qualification.service';
import { currentFiscalQuarter } from '../analytics/fiscal-period';

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly qualification: QualificationService,
  ) {}

  async list(auth: RequestAuth, query: ListOpportunitiesDto) {
    return this.prisma.withTenant(auth.activeTenantId, async (transaction) => {
      const accessScope = this.scope(auth);
      const where: Prisma.OpportunityWhereInput = {
        tenantId: auth.activeTenantId,
        deletedAt: null,
        AND: [
          accessScope,
          ...(query.search
            ? [
                {
                  OR: [
                    { title: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
                    {
                      customer: {
                        name: { contains: query.search, mode: Prisma.QueryMode.insensitive },
                      },
                    },
                  ],
                } satisfies Prisma.OpportunityWhereInput,
              ]
            : []),
        ],
        ...(query.status ? { status: query.status } : {}),
        ...(query.stageId ? { stageId: query.stageId } : {}),
        ...(query.brandId ? { lineItems: { some: { brandId: query.brandId } } } : {}),
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
            qualificationResponses: {
              include: {
                criterion: true,
                updatedBy: { select: { id: true, name: true } },
              },
              orderBy: { criterion: { sortOrder: 'asc' } },
            },
            reviewEvents: {
              include: {
                actor: { select: { id: true, name: true } },
                targetUser: { select: { id: true, name: true } },
                replies: {
                  include: { actor: { select: { id: true, name: true } } },
                  orderBy: { createdAt: 'asc' },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 50,
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
    const canAssignAnySeller = auth.permissions.has(PERMISSIONS.OPPORTUNITIES_UPDATE_ALL);
    const canAssignOwnTeam = auth.permissions.has(PERMISSIONS.OPPORTUNITIES_UPDATE_TEAM);
    if ((canAssignAnySeller || canAssignOwnTeam) && !input.sellerId) {
      throw new BadRequestException({
        code: 'SELLER_REQUIRED',
        message: 'An active tenant seller must be selected',
      });
    }
    const sellerId = canAssignAnySeller || canAssignOwnTeam ? input.sellerId! : auth.userId;
    const managerId = canAssignAnySeller
      ? (input.managerId ?? null)
      : canAssignOwnTeam
        ? auth.userId
        : null;
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
          where: {
            tenantId: auth.activeTenantId,
            userId: sellerId,
            role: 'SELLER',
            status: 'ACTIVE',
          },
        }),
      ]);
      if (!stage || !customer || !seller)
        throw new ForbiddenException('Invalid tenant-owned reference');
      if (stage.code === '100') {
        throw new BadRequestException({
          code: 'BILLING_FACT_REQUIRED',
          message: 'Billed stage is reached only through a linked billing confirmation',
        });
      }
      if (managerId) {
        const manager = await transaction.tenantMembership.findFirst({
          where: {
            tenantId: auth.activeTenantId,
            userId: managerId,
            status: 'ACTIVE',
            role: 'MANAGER',
          },
        });
        if (!manager) throw new ForbiddenException('Invalid tenant-owned manager reference');
      }
      if (input.partnerId) {
        const partner = await transaction.partner.findFirst({
          where: { id: input.partnerId, tenantId: auth.activeTenantId },
        });
        if (!partner) throw new ForbiddenException('Invalid tenant-owned partner reference');
      }
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
      const amount = Number(input.estimatedAmount);
      let financials: ReturnType<typeof calculateFinancials>;
      try {
        financials = calculateFinancials({
          estimatedAmount: amount,
          grossProfit: input.grossProfit === undefined ? undefined : Number(input.grossProfit),
          grossMarginPercent:
            input.grossMarginPercent === undefined ? undefined : Number(input.grossMarginPercent),
        });
      } catch (error) {
        throw new BadRequestException({
          code: 'INVALID_FINANCIAL_VALUES',
          message: error instanceof Error ? error.message : 'Invalid financial values',
        });
      }
      if (input.lineItems.length) {
        const lineTotal = input.lineItems.reduce((total, item) => total + Number(item.amount), 0);
        if (Math.abs(lineTotal - amount) > 0.01) {
          throw new BadRequestException({
            code: 'LINE_ITEM_TOTAL_MISMATCH',
            message: 'Line item amounts must equal the opportunity amount',
          });
        }
      }
      const status = input.status ?? defaultOpportunityStatus(stage.code);
      const forecastCategory = input.forecastCategory ?? defaultForecastCategory(stage.code);
      const stateIssue = commercialStateIssue({
        stageCode: stage.code,
        status,
        forecastCategory,
      });
      if (stateIssue) {
        throw new BadRequestException({ code: 'INVALID_COMMERCIAL_STATE', message: stateIssue });
      }
      const requiresQualification = requiredQualificationGates(stage.code).length > 0;
      const canOverride = ['MANAGER', 'TENANT_ADMIN', 'PLATFORM_ADMIN'].includes(auth.role);
      const overrideReason = input.qualificationOverrideReason?.trim();
      if (requiresQualification && (!canOverride || !overrideReason)) {
        throw new BadRequestException({
          code: 'QUALIFICATION_REQUIRED_BEFORE_ADVANCED_STAGE',
          message: 'Create the opportunity in Prospecting or Qualification before advancing it',
        });
      }
      const opportunity = await transaction.opportunity.create({
        data: {
          tenantId: auth.activeTenantId,
          sellerId,
          managerId,
          customerId: input.customerId,
          partnerId: input.partnerId,
          title: input.title.trim(),
          status,
          stageId: stage.id,
          forecastCategory,
          currency: input.currency.toUpperCase(),
          estimatedAmount: new Prisma.Decimal(amount),
          grossProfit:
            financials.grossProfit === null ? null : new Prisma.Decimal(financials.grossProfit),
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
      if (requiresQualification && overrideReason) {
        await transaction.opportunityReviewEvent.create({
          data: {
            tenantId: auth.activeTenantId,
            opportunityId: opportunity.id,
            actorId: auth.userId,
            type: 'OVERRIDE_QUALIFICATION',
            body: overrideReason,
          },
        });
      }
      await this.replaceAlerts(transaction, opportunity, settings);
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
    if (!canUpdateOpportunities(auth)) {
      throw new ForbiddenException('Opportunity update is not permitted');
    }
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
      if (stageChanged && stage.code === '100') {
        throw new BadRequestException({
          code: 'BILLING_FACT_REQUIRED',
          message: 'Billed stage is reached only through a linked billing confirmation',
        });
      }
      let forecastCategory = input.forecastCategory ?? current.forecastCategory;
      let status = input.status ?? current.status;
      let stateIssue = commercialStateIssue({
        stageCode: stage.code,
        status,
        forecastCategory,
      });
      if (
        stageChanged &&
        input.forecastCategory === undefined &&
        stateIssue?.includes('Forecast category')
      ) {
        forecastCategory = defaultForecastCategory(stage.code);
      }
      stateIssue = commercialStateIssue({ stageCode: stage.code, status, forecastCategory });
      if (stageChanged && input.status === undefined && stateIssue?.includes('status')) {
        status = defaultOpportunityStatus(stage.code);
      }
      stateIssue = commercialStateIssue({ stageCode: stage.code, status, forecastCategory });
      if (stateIssue) {
        throw new BadRequestException({ code: 'INVALID_COMMERCIAL_STATE', message: stateIssue });
      }
      const gate = stageChanged
        ? await this.qualification.gateVerdict(
            transaction,
            auth.activeTenantId,
            current.id,
            stage.code,
          )
        : { complete: true, required: 0, satisfied: 0, missing: [] };
      const overrideReason = input.qualificationOverrideReason?.trim();
      const canOverride = ['MANAGER', 'TENANT_ADMIN', 'PLATFORM_ADMIN'].includes(auth.role);
      if (!gate.complete && (!canOverride || !overrideReason)) {
        throw new BadRequestException({
          code: 'QUALIFICATION_GATE_BLOCKED',
          message: 'Required qualification evidence is incomplete',
          gate,
        });
      }
      const amount =
        input.estimatedAmount === undefined
          ? current.estimatedAmount.toNumber()
          : Number(input.estimatedAmount);
      let financials: ReturnType<typeof calculateFinancials> | undefined;
      if (
        input.estimatedAmount !== undefined ||
        input.grossProfit !== undefined ||
        input.grossMarginPercent !== undefined
      ) {
        try {
          financials = calculateFinancials({
            estimatedAmount: amount,
            grossProfit:
              input.grossProfit === undefined
                ? input.grossMarginPercent === undefined
                  ? current.grossProfit?.toNumber()
                  : undefined
                : Number(input.grossProfit),
            grossMarginPercent:
              input.grossMarginPercent === undefined ? undefined : Number(input.grossMarginPercent),
          });
        } catch (error) {
          throw new BadRequestException({
            code: 'INVALID_FINANCIAL_VALUES',
            message: error instanceof Error ? error.message : 'Invalid financial values',
          });
        }
      }
      await transaction.opportunity.update({
        where: { id },
        data: {
          ...(input.title !== undefined ? { title: input.title.trim() } : {}),
          ...(input.status !== undefined || stageChanged ? { status } : {}),
          ...(input.stageId !== undefined
            ? { stageId: stage.id, probability: input.probability ?? stage.probability }
            : {}),
          ...(input.forecastCategory !== undefined || stageChanged ? { forecastCategory } : {}),
          ...(financials
            ? {
                estimatedAmount: new Prisma.Decimal(amount),
                grossProfit:
                  financials.grossProfit === null
                    ? null
                    : new Prisma.Decimal(financials.grossProfit),
              }
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
            reason: overrideReason?.slice(0, 500) ?? input.notes?.slice(0, 500),
          },
        });
      }
      if (!gate.complete && overrideReason) {
        await transaction.opportunityReviewEvent.create({
          data: {
            tenantId: auth.activeTenantId,
            opportunityId: id,
            actorId: auth.userId,
            type: 'OVERRIDE_QUALIFICATION',
            body: overrideReason,
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
      await this.replaceAlerts(transaction, updated, settings);
      await transaction.auditEvent.create({
        data: {
          tenantId: auth.activeTenantId,
          actorId: auth.userId,
          action: stageChanged ? 'OPPORTUNITY_STAGE_CHANGED' : 'OPPORTUNITY_UPDATED',
          entity: 'Opportunity',
          entityId: id,
          requestId,
          metadata: stageChanged
            ? {
                fromStageId: current.stageId,
                toStageId: stage.id,
                qualificationOverride: !gate.complete,
                qualificationMissing: gate.missing.map((item) => item.code),
              }
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
    return forUpdate ? opportunityUpdateScope(auth) : opportunityReadScope(auth);
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
      status: opportunity.status,
      forecastCategory: opportunity.forecastCategory,
    });
  }

  private serialize<T extends OpportunityWithRelations>(
    opportunity: T,
    marginThreshold: number,
  ): T & {
    estimatedAmount: number;
    grossProfit: number | null;
    margin: number | null;
    grossMarginPercent: number | null;
    health: ForecastHealth;
  } {
    const amount = opportunity.estimatedAmount.toNumber();
    const grossProfit = opportunity.grossProfit?.toNumber() ?? null;
    return {
      ...opportunity,
      estimatedAmount: amount,
      grossProfit,
      margin: grossProfit === null || amount === 0 ? null : (grossProfit / amount) * 100,
      grossMarginPercent:
        grossProfit === null || amount === 0 ? null : (grossProfit / amount) * 100,
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
    settings: { defaultMarginThreshold: { toNumber(): number }; fiscalYearStartMonth: number },
  ): Promise<void> {
    const period = currentFiscalQuarter(new Date(), settings.fiscalYearStartMonth);
    const qualification = await this.qualification.gateVerdict(
      transaction,
      opportunity.tenantId,
      opportunity.id,
      opportunity.stage.code,
    );
    const risk = evaluateOpportunityRisk({
      amount: opportunity.estimatedAmount.toNumber(),
      grossProfit: opportunity.grossProfit?.toNumber() ?? null,
      stageProbability: opportunity.stage.probability,
      poNumber: opportunity.poNumber,
      expectedCloseDate: opportunity.expectedCloseDate,
      expectedBillingDate: opportunity.expectedBillingDate,
      lastStageChangedAt: opportunity.lastStageChangedAt,
      marginThreshold: settings.defaultMarginThreshold.toNumber(),
      status: opportunity.status,
      forecastCategory: opportunity.forecastCategory,
      qualificationComplete: qualification.complete,
      periodStart: period.start,
      periodEnd: period.end,
    });
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
