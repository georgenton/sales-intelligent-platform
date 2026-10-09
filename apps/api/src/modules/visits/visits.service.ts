import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { RequestAuth } from '../../common/http/authenticated-request';
import { PrismaService } from '../../common/prisma/prisma.service';
import { opportunityReadScope } from '../authorization/opportunity-scope';
import type { CreateCustomerVisitDto } from './dto/create-customer-visit.dto';

@Injectable()
export class VisitsService {
  constructor(private readonly prisma: PrismaService) {}

  create(auth: RequestAuth, input: CreateCustomerVisitDto, requestId: string) {
    return this.prisma.withTenant(auth.activeTenantId, async (transaction) => {
      const existing = await transaction.customerVisit.findUnique({
        where: {
          tenantId_idempotencyKey: {
            tenantId: auth.activeTenantId,
            idempotencyKey: input.idempotencyKey,
          },
        },
        include: {
          seller: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true } },
          opportunity: { select: { id: true, title: true } },
        },
      });
      if (existing) {
        await this.assertSellerScope(transaction, auth, existing.sellerId);
        const same =
          existing.sellerId === input.sellerId &&
          existing.customerId === input.customerId &&
          existing.visitedAt.toISOString().slice(0, 10) === input.visitedAt &&
          existing.foundOpportunity === input.foundOpportunity &&
          existing.opportunityId === (input.opportunityId ?? null);
        if (!same) {
          throw new BadRequestException({
            code: 'VISIT_IDEMPOTENCY_CONFLICT',
            message: 'The idempotency key was already used for a different visit',
          });
        }
        return this.serialize(existing);
      }

      await this.assertSellerScope(transaction, auth, input.sellerId);
      const [seller, customer] = await Promise.all([
        transaction.tenantMembership.findFirst({
          where: {
            tenantId: auth.activeTenantId,
            userId: input.sellerId,
            role: 'SELLER',
            status: 'ACTIVE',
          },
        }),
        transaction.customer.findFirst({
          where: { tenantId: auth.activeTenantId, id: input.customerId },
        }),
      ]);
      if (!seller || !customer)
        throw new ForbiddenException('Invalid tenant-owned visit reference');

      if (!input.foundOpportunity && input.opportunityId) {
        throw new BadRequestException({
          code: 'VISIT_OPPORTUNITY_RESULT_CONFLICT',
          message: 'A visit marked No cannot link an opportunity',
        });
      }
      if (input.opportunityId) {
        const opportunity = await transaction.opportunity.findFirst({
          where: {
            id: input.opportunityId,
            tenantId: auth.activeTenantId,
            sellerId: input.sellerId,
            customerId: input.customerId,
            deletedAt: null,
            ...opportunityReadScope(auth),
          },
          select: { id: true },
        });
        if (!opportunity) {
          throw new ForbiddenException('Opportunity is outside the authorized visit context');
        }
      }
      const visitedAt = new Date(`${input.visitedAt}T00:00:00.000Z`);
      if (Number.isNaN(visitedAt.getTime())) throw new BadRequestException('Invalid visit date');
      const visit = await transaction.customerVisit.create({
        data: {
          tenantId: auth.activeTenantId,
          sellerId: input.sellerId,
          customerId: input.customerId,
          opportunityId: input.opportunityId ?? null,
          recordedById: auth.userId,
          visitedAt,
          foundOpportunity: input.foundOpportunity,
          idempotencyKey: input.idempotencyKey,
        },
        include: {
          seller: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true } },
          opportunity: { select: { id: true, title: true } },
        },
      });
      await transaction.auditEvent.create({
        data: {
          tenantId: auth.activeTenantId,
          actorId: auth.userId,
          action: 'CUSTOMER_VISIT_RECORDED',
          entity: 'CustomerVisit',
          entityId: visit.id,
          requestId,
          metadata: {
            sellerId: visit.sellerId,
            customerId: visit.customerId,
            opportunityLinked: Boolean(visit.opportunityId),
            foundOpportunity: visit.foundOpportunity,
            visitedAt: input.visitedAt,
          },
        },
      });
      return this.serialize(visit);
    });
  }

  linkOpportunity(auth: RequestAuth, visitId: string, opportunityId: string, requestId: string) {
    return this.prisma.withTenant(auth.activeTenantId, async (transaction) => {
      const visit = await transaction.customerVisit.findFirst({
        where: { id: visitId, tenantId: auth.activeTenantId },
      });
      if (!visit) throw new ForbiddenException('Visit is outside the authorized tenant context');
      await this.assertSellerScope(transaction, auth, visit.sellerId);
      if (!visit.foundOpportunity) {
        throw new BadRequestException({
          code: 'VISIT_WITHOUT_OPPORTUNITY_RESULT',
          message: 'A visit marked No cannot link an opportunity',
        });
      }
      if (visit.opportunityId && visit.opportunityId !== opportunityId) {
        throw new BadRequestException({
          code: 'VISIT_ALREADY_LINKED',
          message: 'The visit is already linked to a different opportunity',
        });
      }
      const opportunity = await transaction.opportunity.findFirst({
        where: {
          id: opportunityId,
          tenantId: auth.activeTenantId,
          sellerId: visit.sellerId,
          customerId: visit.customerId,
          deletedAt: null,
          ...opportunityReadScope(auth),
        },
        select: { id: true },
      });
      if (!opportunity) {
        throw new ForbiddenException('Opportunity is outside the authorized visit context');
      }
      if (!visit.opportunityId) {
        await transaction.customerVisit.update({
          where: { id: visit.id },
          data: { opportunityId },
        });
        await transaction.auditEvent.create({
          data: {
            tenantId: auth.activeTenantId,
            actorId: auth.userId,
            action: 'CUSTOMER_VISIT_OPPORTUNITY_LINKED',
            entity: 'CustomerVisit',
            entityId: visit.id,
            requestId,
            metadata: { opportunityId },
          },
        });
      }
      const linked = await transaction.customerVisit.findUniqueOrThrow({
        where: { id: visit.id },
        include: {
          seller: { select: { id: true, name: true } },
          customer: { select: { id: true, name: true } },
          opportunity: { select: { id: true, title: true } },
        },
      });
      return this.serialize(linked);
    });
  }

  private async assertSellerScope(
    transaction: Prisma.TransactionClient,
    auth: RequestAuth,
    sellerId: string,
  ) {
    if (auth.role === 'SELLER' && sellerId !== auth.userId) {
      throw new ForbiddenException('A seller may only record their own visits');
    }
    if (auth.role !== 'MANAGER' || sellerId === auth.userId) return;
    const teamEvidence = await transaction.opportunity.findFirst({
      where: {
        tenantId: auth.activeTenantId,
        sellerId,
        managerId: auth.userId,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!teamEvidence) throw new ForbiddenException('Seller is outside the manager scope');
  }

  private serialize(visit: {
    id: string;
    sellerId: string;
    customerId: string;
    opportunityId: string | null;
    visitedAt: Date;
    foundOpportunity: boolean;
    seller: { id: string; name: string };
    customer: { id: string; name: string };
    opportunity: { id: string; title: string } | null;
  }) {
    return {
      id: visit.id,
      seller: visit.seller,
      customer: visit.customer,
      visitedAt: visit.visitedAt.toISOString().slice(0, 10),
      foundOpportunity: visit.foundOpportunity,
      opportunity: visit.opportunity,
      linkStatus: visit.foundOpportunity && !visit.opportunityId ? 'PENDING_LINK' : 'COMPLETE',
    };
  }
}
