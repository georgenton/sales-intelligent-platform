import { Injectable } from '@nestjs/common';
import type { RequestAuth } from '../../common/http/authenticated-request';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { MockAiProvider } from './mock-ai.provider';

@Injectable()
export class AiService {
  constructor(
    private readonly analytics: AnalyticsService,
    private readonly prisma: PrismaService,
    private readonly provider: MockAiProvider,
  ) {}

  async managerBrief(auth: RequestAuth, requestId: string) {
    const dashboard = await this.analytics.dashboard(auth);
    const details = await this.prisma.withTenant(auth.activeTenantId, async (transaction) => {
      const [risks, opportunities] = await Promise.all([
        transaction.alert.findMany({
          where: { tenantId: auth.activeTenantId, resolvedAt: null },
          include: { opportunity: { select: { title: true } } },
          orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
          take: 5,
        }),
        transaction.opportunity.findMany({
          where: { tenantId: auth.activeTenantId, status: 'OPEN', deletedAt: null },
          select: { title: true, estimatedAmount: true },
          orderBy: { estimatedAmount: 'desc' },
          take: 5,
        }),
      ]);
      return { risks, opportunities };
    });
    const context = {
      period: dashboard.period.label,
      quota: dashboard.kpis.quota,
      billed: dashboard.kpis.billed,
      forecast: dashboard.kpis.forecast,
      gap: dashboard.kpis.gap,
      commit: dashboard.kpis.commit,
      backlog: dashboard.kpis.backlog,
      topRisks: details.risks.map((risk) => ({
        title: risk.opportunity?.title ?? 'Portfolio risk',
        severity: risk.severity,
        message: risk.message,
      })),
      topOpportunities: details.opportunities.map((item) => ({
        title: item.title,
        amount: item.estimatedAmount.toNumber(),
      })),
      sellerSummary: dashboard.sellerPerformance,
    };
    const summary = await this.provider.generateManagerBrief(context);
    await this.prisma.withTenant(auth.activeTenantId, async (transaction) => {
      await Promise.all([
        transaction.aiInteraction.create({
          data: {
            tenantId: auth.activeTenantId,
            actorId: auth.userId,
            provider: 'mock',
            model: 'deterministic-v1',
            purpose: 'MANAGER_BRIEF',
          },
        }),
        transaction.auditEvent.create({
          data: {
            tenantId: auth.activeTenantId,
            actorId: auth.userId,
            action: 'AI_BRIEF_GENERATED',
            entity: 'ManagerBrief',
            requestId,
            metadata: { provider: 'mock', period: context.period },
          },
        }),
      ]);
    });
    return { context, summary, provider: 'mock' };
  }
}
