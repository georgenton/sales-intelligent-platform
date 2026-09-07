import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { RequestAuth } from '../../common/http/authenticated-request';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  canUpdateOpportunities,
  opportunityReadScope,
  opportunityUpdateScope,
} from '../authorization/opportunity-scope';
import type { CreateReviewEventDto } from './dto/create-review-event.dto';
import type { ListReviewEventsDto } from './dto/list-review-events.dto';

const include = {
  opportunity: { select: { id: true, title: true, sellerId: true } },
  actor: { select: { id: true, name: true } },
  targetUser: { select: { id: true, name: true } },
  replies: {
    include: { actor: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' as const },
  },
} satisfies Prisma.OpportunityReviewEventInclude;

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  list(auth: RequestAuth, query: ListReviewEventsDto) {
    const opportunityScope = this.opportunityScope(auth, false);
    return this.prisma.withTenant(auth.activeTenantId, (transaction) =>
      transaction.opportunityReviewEvent.findMany({
        where: {
          tenantId: auth.activeTenantId,
          ...(query.opportunityId ? { opportunityId: query.opportunityId } : {}),
          ...(query.pendingOnly ? { type: 'ASK_SELLER', resolvedAt: null } : {}),
          ...(Object.keys(opportunityScope).length ? { opportunity: opportunityScope } : {}),
          ...(auth.role === 'SELLER' && !query.opportunityId ? { targetUserId: auth.userId } : {}),
        },
        include,
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    );
  }

  async create(auth: RequestAuth, input: CreateReviewEventDto, requestId: string) {
    if (!canUpdateOpportunities(auth)) {
      throw new ForbiddenException('Commercial review mutation is not permitted');
    }
    return this.prisma.withTenant(auth.activeTenantId, async (transaction) => {
      const opportunity = await transaction.opportunity.findFirst({
        where: {
          id: input.opportunityId,
          tenantId: auth.activeTenantId,
          deletedAt: null,
          ...this.opportunityScope(auth, true),
        },
        include: { stage: true },
      });
      if (!opportunity) throw new NotFoundException('Opportunity not found');
      const managerAction = [
        'KEEP_COMMIT',
        'MOVE_BEST_CASE',
        'ASK_SELLER',
        'MANAGER_NOTE',
      ].includes(input.type);
      if (managerAction && !['MANAGER', 'TENANT_ADMIN', 'PLATFORM_ADMIN'].includes(auth.role)) {
        throw new ForbiddenException('This review decision requires a manager');
      }
      if (input.type === 'OVERRIDE_QUALIFICATION') {
        throw new ForbiddenException('Qualification overrides are only created by the stage gate');
      }
      const body = input.body?.trim() || null;
      if (
        ['ASK_SELLER', 'SELLER_RESPONSE', 'MANAGER_NOTE', 'GUIDED_ACTION'].includes(input.type) &&
        !body
      ) {
        throw new BadRequestException('A review body is required');
      }

      let targetUserId: string | null = null;
      let parentEventId: string | null = null;
      if (input.type === 'ASK_SELLER') targetUserId = opportunity.sellerId;
      if (input.type === 'SELLER_RESPONSE') {
        if (!input.parentEventId)
          throw new BadRequestException('A seller response requires a parent request');
        const parent = await transaction.opportunityReviewEvent.findFirst({
          where: {
            id: input.parentEventId,
            tenantId: auth.activeTenantId,
            opportunityId: opportunity.id,
            type: 'ASK_SELLER',
            targetUserId: auth.userId,
            resolvedAt: null,
          },
        });
        if (!parent) throw new NotFoundException('Pending manager request not found');
        parentEventId = parent.id;
        await transaction.opportunityReviewEvent.update({
          where: { id: parent.id },
          data: { resolvedAt: new Date() },
        });
      }
      if (input.type === 'KEEP_COMMIT' && opportunity.forecastCategory !== 'COMMIT') {
        throw new BadRequestException('Only a Commit opportunity can be kept in Commit');
      }
      if (input.type === 'MOVE_BEST_CASE') {
        if (!['60', '80'].includes(opportunity.stage.code) || opportunity.status !== 'OPEN') {
          throw new BadRequestException('Best Case is not valid for this opportunity stage');
        }
        await transaction.opportunity.update({
          where: { id: opportunity.id },
          data: { forecastCategory: 'BEST_CASE' },
        });
      }
      const event = await transaction.opportunityReviewEvent.create({
        data: {
          tenantId: auth.activeTenantId,
          opportunityId: opportunity.id,
          actorId: auth.userId,
          type: input.type,
          targetUserId,
          body,
          parentEventId,
        },
        include,
      });
      await transaction.auditEvent.create({
        data: {
          tenantId: auth.activeTenantId,
          actorId: auth.userId,
          action: `FORECAST_REVIEW_${input.type}`,
          entity: 'Opportunity',
          entityId: opportunity.id,
          requestId,
          metadata: {
            reviewEventId: event.id,
            categoryChanged: input.type === 'MOVE_BEST_CASE',
          },
        },
      });
      return event;
    });
  }

  private opportunityScope(auth: RequestAuth, forUpdate: boolean): Prisma.OpportunityWhereInput {
    return forUpdate ? opportunityUpdateScope(auth) : opportunityReadScope(auth);
  }
}
