import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { RequestAuth } from '../../common/http/authenticated-request';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PERMISSIONS } from '../authorization/permissions';
import { requiredQualificationGates } from '../opportunities/commercial-domain';
import type { UpsertQualificationResponseDto } from './dto/upsert-qualification-response.dto';

export interface QualificationGateVerdict {
  complete: boolean;
  required: number;
  satisfied: number;
  missing: Array<{ criterionId: string; code: string; reason: 'ANSWER' | 'EVIDENCE' }>;
}

@Injectable()
export class QualificationService {
  constructor(private readonly prisma: PrismaService) {}

  async detail(auth: RequestAuth, opportunityId: string) {
    return this.prisma.withTenant(auth.activeTenantId, async (transaction) => {
      await this.requireOpportunity(transaction, auth, opportunityId, false);
      const criteria = await transaction.qualificationCriterion.findMany({
        where: { tenantId: auth.activeTenantId, enabled: true },
        include: {
          responses: {
            where: { opportunityId },
            include: { updatedBy: { select: { id: true, name: true } } },
          },
        },
        orderBy: [{ gateCode: 'asc' }, { sortOrder: 'asc' }],
      });
      const groups = ['60', '80'].map((gateCode) => {
        const gateCriteria = criteria.filter((criterion) => criterion.gateCode === gateCode);
        return {
          gateCode,
          verdict: this.verdictFromCriteria(gateCriteria),
          criteria: gateCriteria.map(({ responses, ...criterion }) => ({
            ...criterion,
            response: responses[0] ?? null,
          })),
        };
      });
      return { opportunityId, gates: groups };
    });
  }

  async respond(
    auth: RequestAuth,
    opportunityId: string,
    input: UpsertQualificationResponseDto,
    requestId: string,
  ) {
    return this.prisma.withTenant(auth.activeTenantId, async (transaction) => {
      await this.requireOpportunity(transaction, auth, opportunityId, true);
      const criterion = await transaction.qualificationCriterion.findFirst({
        where: { id: input.criterionId, tenantId: auth.activeTenantId, enabled: true },
      });
      if (!criterion) throw new NotFoundException('Qualification criterion not found');
      const evidence = input.evidence?.trim() || null;
      if (input.answer === 'YES' && criterion.evidenceRequired && !evidence) {
        throw new BadRequestException({
          code: 'QUALIFICATION_EVIDENCE_REQUIRED',
          message: 'Evidence is required for this criterion',
        });
      }
      const response = await transaction.qualificationResponse.upsert({
        where: { opportunityId_criterionId: { opportunityId, criterionId: criterion.id } },
        update: { answer: input.answer, evidence, updatedById: auth.userId },
        create: {
          tenantId: auth.activeTenantId,
          opportunityId,
          criterionId: criterion.id,
          answer: input.answer,
          evidence,
          updatedById: auth.userId,
        },
        include: { updatedBy: { select: { id: true, name: true } } },
      });
      await transaction.auditEvent.create({
        data: {
          tenantId: auth.activeTenantId,
          actorId: auth.userId,
          action: 'QUALIFICATION_RESPONSE_UPDATED',
          entity: 'Opportunity',
          entityId: opportunityId,
          requestId,
          metadata: {
            criterionCode: criterion.code,
            gateCode: criterion.gateCode,
            answer: input.answer,
          },
        },
      });
      return response;
    });
  }

  async gateVerdict(
    transaction: Prisma.TransactionClient,
    tenantId: string,
    opportunityId: string,
    targetStageCode: string,
  ): Promise<QualificationGateVerdict> {
    const gates = requiredQualificationGates(targetStageCode);
    if (!gates.length) return { complete: true, required: 0, satisfied: 0, missing: [] };
    const criteria = await transaction.qualificationCriterion.findMany({
      where: { tenantId, gateCode: { in: gates }, enabled: true, required: true },
      include: { responses: { where: { opportunityId } } },
    });
    return this.verdictFromCriteria(criteria);
  }

  private verdictFromCriteria(
    criteria: Array<{
      id: string;
      code: string;
      required: boolean;
      evidenceRequired: boolean;
      responses: Array<{ answer: string; evidence: string | null }>;
    }>,
  ): QualificationGateVerdict {
    const required = criteria.filter((criterion) => criterion.required);
    const missing: QualificationGateVerdict['missing'] = [];
    for (const criterion of required) {
      const response = criterion.responses[0];
      if (response?.answer !== 'YES') {
        missing.push({ criterionId: criterion.id, code: criterion.code, reason: 'ANSWER' });
      } else if (criterion.evidenceRequired && !response.evidence?.trim()) {
        missing.push({ criterionId: criterion.id, code: criterion.code, reason: 'EVIDENCE' });
      }
    }
    return {
      complete: missing.length === 0,
      required: required.length,
      satisfied: required.length - missing.length,
      missing,
    };
  }

  private async requireOpportunity(
    transaction: Prisma.TransactionClient,
    auth: RequestAuth,
    opportunityId: string,
    forUpdate: boolean,
  ): Promise<void> {
    const canReadAll = auth.permissions.has(
      forUpdate ? PERMISSIONS.OPPORTUNITIES_UPDATE_ALL : PERMISSIONS.OPPORTUNITIES_READ_ALL,
    );
    const canReadTeam = !forUpdate && auth.permissions.has(PERMISSIONS.OPPORTUNITIES_READ_TEAM);
    const opportunity = await transaction.opportunity.findFirst({
      where: {
        id: opportunityId,
        tenantId: auth.activeTenantId,
        deletedAt: null,
        ...(canReadAll
          ? {}
          : canReadTeam
            ? { OR: [{ sellerId: auth.userId }, { managerId: auth.userId }] }
            : { sellerId: auth.userId }),
      },
      select: { id: true },
    });
    if (!opportunity) {
      if (forUpdate && !auth.permissions.has(PERMISSIONS.OPPORTUNITIES_UPDATE_OWN)) {
        throw new ForbiddenException('Qualification update is not permitted');
      }
      throw new NotFoundException('Opportunity not found');
    }
  }
}
