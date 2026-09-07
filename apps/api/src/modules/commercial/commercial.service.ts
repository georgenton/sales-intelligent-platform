import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { RequestAuth } from '../../common/http/authenticated-request';
import { PrismaService } from '../../common/prisma/prisma.service';
import { currentFiscalQuarter } from '../analytics/fiscal-period';
import type { UpdateCommercialSettingsDto } from './dto/update-commercial-settings.dto';
import type { UpdateCriterionDto } from './dto/update-criterion.dto';
import type { UpdateQuotasDto } from './dto/update-quotas.dto';

const positiveAmount = (value: string): Prisma.Decimal => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0)
    throw new BadRequestException('Quota cannot be negative');
  return new Prisma.Decimal(amount);
};

@Injectable()
export class CommercialService {
  constructor(private readonly prisma: PrismaService) {}

  getConfig(auth: RequestAuth) {
    return this.prisma.withTenant(auth.activeTenantId, async (transaction) => {
      const settings = await transaction.tenantSetting.findUniqueOrThrow({
        where: { tenantId: auth.activeTenantId },
      });
      const period = currentFiscalQuarter(new Date(), settings.fiscalYearStartMonth);
      const [brands, memberships, quotas, criteria] = await Promise.all([
        transaction.brand.findMany({
          where: { tenantId: auth.activeTenantId },
          orderBy: { name: 'asc' },
        }),
        transaction.tenantMembership.findMany({
          where: { tenantId: auth.activeTenantId, role: 'SELLER', status: 'ACTIVE' },
          include: { user: { select: { id: true, name: true } } },
          orderBy: { user: { name: 'asc' } },
        }),
        transaction.quota.findMany({
          where: {
            tenantId: auth.activeTenantId,
            periodStart: { lte: period.end },
            periodEnd: { gte: period.start },
          },
          orderBy: { createdAt: 'asc' },
        }),
        transaction.qualificationCriterion.findMany({
          where: { tenantId: auth.activeTenantId },
          orderBy: [{ gateCode: 'asc' }, { sortOrder: 'asc' }],
        }),
      ]);
      return {
        settings: {
          ...settings,
          defaultMarginThreshold: settings.defaultMarginThreshold.toNumber(),
        },
        period,
        brands,
        sellers: memberships.map((membership) => membership.user),
        quotas: quotas.map((quota) => ({ ...quota, amount: quota.amount.toNumber() })),
        criteria,
      };
    });
  }

  updateSettings(auth: RequestAuth, input: UpdateCommercialSettingsDto, requestId: string) {
    return this.prisma.withTenant(auth.activeTenantId, async (transaction) => {
      if (input.defaultMarginThreshold !== undefined) {
        const threshold = Number(input.defaultMarginThreshold);
        if (!Number.isFinite(threshold) || threshold < 0 || threshold > 100) {
          throw new BadRequestException('Margin threshold must be between 0 and 100');
        }
      }
      const startMonth = input.fiscalYearStartMonth;
      const settings = await transaction.tenantSetting.update({
        where: { tenantId: auth.activeTenantId },
        data: {
          ...(startMonth !== undefined
            ? {
                fiscalYearStartMonth: startMonth,
                fiscalYearEndMonth: startMonth === 1 ? 12 : startMonth - 1,
              }
            : {}),
          ...(input.currency !== undefined ? { currency: input.currency.toUpperCase() } : {}),
          ...(input.defaultMarginThreshold !== undefined
            ? { defaultMarginThreshold: new Prisma.Decimal(input.defaultMarginThreshold) }
            : {}),
        },
      });
      await transaction.auditEvent.create({
        data: {
          tenantId: auth.activeTenantId,
          actorId: auth.userId,
          action: 'COMMERCIAL_SETTINGS_UPDATED',
          entity: 'TenantSetting',
          entityId: settings.id,
          requestId,
          metadata: { fields: Object.keys(input) },
        },
      });
      return { ...settings, defaultMarginThreshold: settings.defaultMarginThreshold.toNumber() };
    });
  }

  updateQuotas(auth: RequestAuth, input: UpdateQuotasDto, requestId: string) {
    return this.prisma.withTenant(auth.activeTenantId, async (transaction) => {
      const settings = await transaction.tenantSetting.findUniqueOrThrow({
        where: { tenantId: auth.activeTenantId },
      });
      const period = currentFiscalQuarter(new Date(), settings.fiscalYearStartMonth);
      let sellerQuotaAssigneeIds: string[] = [];
      if (input.brandQuotas) {
        const brandIds = [...new Set(input.brandQuotas.map((quota) => quota.brandId))];
        const count = await transaction.brand.count({
          where: { tenantId: auth.activeTenantId, id: { in: brandIds } },
        });
        if (count !== brandIds.length) throw new BadRequestException('Invalid tenant brand quota');
      }
      if (input.sellerQuotas) {
        const sellerIds = [...new Set(input.sellerQuotas.map((quota) => quota.sellerId))];
        const sellerMemberships = await transaction.tenantMembership.findMany({
          where: {
            tenantId: auth.activeTenantId,
            role: 'SELLER',
          },
          select: { userId: true, status: true },
        });
        sellerQuotaAssigneeIds = sellerMemberships.map((membership) => membership.userId);
        const activeSellerIds = new Set(
          sellerMemberships
            .filter((membership) => membership.status === 'ACTIVE')
            .map((membership) => membership.userId),
        );
        if (sellerIds.some((sellerId) => !activeSellerIds.has(sellerId)))
          throw new BadRequestException('Invalid tenant seller quota');
      }
      if (input.totalQuota !== undefined) {
        await transaction.quota.deleteMany({
          where: {
            tenantId: auth.activeTenantId,
            assigneeId: null,
            brandId: null,
            periodStart: period.start,
            periodEnd: period.end,
          },
        });
        if (input.totalQuota !== null) {
          await transaction.quota.create({
            data: {
              tenantId: auth.activeTenantId,
              periodStart: period.start,
              periodEnd: period.end,
              currency: settings.currency,
              amount: positiveAmount(input.totalQuota),
            },
          });
        }
      }
      if (input.brandQuotas) {
        await transaction.quota.deleteMany({
          where: {
            tenantId: auth.activeTenantId,
            assigneeId: null,
            brandId: { not: null },
            periodStart: period.start,
            periodEnd: period.end,
          },
        });
        if (input.brandQuotas.length) {
          await transaction.quota.createMany({
            data: input.brandQuotas.map((quota) => ({
              tenantId: auth.activeTenantId,
              brandId: quota.brandId,
              periodStart: period.start,
              periodEnd: period.end,
              currency: settings.currency,
              amount: positiveAmount(quota.amount),
            })),
          });
        }
      }
      if (input.sellerQuotas) {
        await transaction.quota.deleteMany({
          where: {
            tenantId: auth.activeTenantId,
            assigneeId: { in: sellerQuotaAssigneeIds },
            brandId: null,
            periodStart: period.start,
            periodEnd: period.end,
          },
        });
        if (input.sellerQuotas.length) {
          await transaction.quota.createMany({
            data: input.sellerQuotas.map((quota) => ({
              tenantId: auth.activeTenantId,
              assigneeId: quota.sellerId,
              periodStart: period.start,
              periodEnd: period.end,
              currency: settings.currency,
              amount: positiveAmount(quota.amount),
            })),
          });
        }
      }
      await transaction.auditEvent.create({
        data: {
          tenantId: auth.activeTenantId,
          actorId: auth.userId,
          action: 'COMMERCIAL_QUOTAS_UPDATED',
          entity: 'Quota',
          requestId,
          metadata: {
            totalConfigured: input.totalQuota !== undefined,
            brandQuotas: input.brandQuotas?.length ?? null,
            sellerQuotas: input.sellerQuotas?.length ?? null,
            period: period.label,
          },
        },
      });
      return this.getConfigInTransaction(transaction, auth.activeTenantId, period);
    });
  }

  updateCriterion(
    auth: RequestAuth,
    criterionId: string,
    input: UpdateCriterionDto,
    requestId: string,
  ) {
    return this.prisma.withTenant(auth.activeTenantId, async (transaction) => {
      const criterion = await transaction.qualificationCriterion.findFirst({
        where: { id: criterionId, tenantId: auth.activeTenantId },
      });
      if (!criterion) throw new NotFoundException('Qualification criterion not found');
      const updated = await transaction.qualificationCriterion.update({
        where: { id: criterion.id },
        data: input,
      });
      await transaction.auditEvent.create({
        data: {
          tenantId: auth.activeTenantId,
          actorId: auth.userId,
          action: 'QUALIFICATION_CRITERION_CONFIGURED',
          entity: 'QualificationCriterion',
          entityId: criterion.id,
          requestId,
          metadata: {
            fields: Object.keys(input),
            gateCode: criterion.gateCode,
            code: criterion.code,
          },
        },
      });
      return updated;
    });
  }

  private async getConfigInTransaction(
    transaction: Prisma.TransactionClient,
    tenantId: string,
    period: { start: Date; end: Date; label: string },
  ) {
    const quotas = await transaction.quota.findMany({
      where: {
        tenantId,
        periodStart: { lte: period.end },
        periodEnd: { gte: period.start },
      },
    });
    return {
      period,
      quotas: quotas.map((quota) => ({ ...quota, amount: quota.amount.toNumber() })),
    };
  }
}
