import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const prisma = new PrismaClient();
const runId = randomUUID().slice(0, 8);
const tenantIds: string[] = [];
const userIds: string[] = [];
let opportunityA = '';
let opportunityB = '';
let protectedA: Record<string, string> = {};
let protectedB: Record<string, string> = {};

async function createTenantFixture(label: 'A' | 'B') {
  const tenant = await prisma.tenant.create({
    data: { name: `Isolation Tenant ${label}`, slug: `isolation-${label.toLowerCase()}-${runId}` },
  });
  const user = await prisma.user.create({
    data: {
      name: `User ${label}`,
      email: `isolation-${label.toLowerCase()}-${runId}@example.test`,
    },
  });
  const [stage, customer, brand] = await Promise.all([
    prisma.stage.create({
      data: {
        tenantId: tenant.id,
        code: '20',
        name: 'Prospecting',
        probability: 20,
        sortOrder: 1,
      },
    }),
    prisma.customer.create({ data: { tenantId: tenant.id, name: `Customer ${label}` } }),
    prisma.brand.create({ data: { tenantId: tenant.id, name: `Brand ${label}` } }),
    prisma.tenantMembership.create({
      data: { tenantId: tenant.id, userId: user.id, role: 'SELLER', status: 'ACTIVE' },
    }),
  ]);
  const opportunity = await prisma.opportunity.create({
    data: {
      tenantId: tenant.id,
      sellerId: user.id,
      customerId: customer.id,
      stageId: stage.id,
      title: `Opportunity ${label}`,
      currency: 'USD',
      estimatedAmount: 10_000,
      probability: 20,
      expectedCloseDate: new Date('2026-10-01'),
    },
  });
  const criterion = await prisma.qualificationCriterion.create({
    data: {
      tenantId: tenant.id,
      gateCode: '60',
      code: `BUDGET_${label}`,
      labelEn: 'Budget confirmed',
      labelEs: 'Presupuesto confirmado',
    },
  });
  const [qualificationResponse, billingRecord, reviewEvent, featureEntitlement] = await Promise.all(
    [
      prisma.qualificationResponse.create({
        data: {
          tenantId: tenant.id,
          opportunityId: opportunity.id,
          criterionId: criterion.id,
          answer: 'YES',
          evidence: 'Isolation fixture',
          updatedById: user.id,
        },
      }),
      prisma.billingRecord.create({
        data: {
          tenantId: tenant.id,
          brandId: brand.id,
          amount: 100,
          currency: 'USD',
          billedAt: new Date('2026-10-01'),
          source: 'ISOLATION_TEST',
          externalReference: `BILLING-${label}-${runId}`,
        },
      }),
      prisma.opportunityReviewEvent.create({
        data: {
          tenantId: tenant.id,
          opportunityId: opportunity.id,
          actorId: user.id,
          type: 'GUIDED_ACTION',
          body: 'Isolation fixture',
        },
      }),
      prisma.tenantFeatureEntitlement.create({
        data: {
          tenantId: tenant.id,
          featureKey: `AI_CONTEXTUAL_REAL_${label}`,
          enabled: true,
        },
      }),
    ],
  );
  return {
    tenant,
    user,
    stage,
    customer,
    opportunity,
    protected: {
      criterion: criterion.id,
      qualificationResponse: qualificationResponse.id,
      billingRecord: billingRecord.id,
      reviewEvent: reviewEvent.id,
      featureEntitlement: featureEntitlement.id,
    },
  };
}

describe('PostgreSQL tenant isolation', () => {
  beforeAll(async () => {
    const [fixtureA, fixtureB] = await Promise.all([
      createTenantFixture('A'),
      createTenantFixture('B'),
    ]);
    tenantIds.push(fixtureA.tenant.id, fixtureB.tenant.id);
    userIds.push(fixtureA.user.id, fixtureB.user.id);
    opportunityA = fixtureA.opportunity.id;
    opportunityB = fixtureB.opportunity.id;
    protectedA = fixtureA.protected;
    protectedB = fixtureB.protected;
  });

  afterAll(async () => {
    await prisma.tenant.deleteMany({ where: { id: { in: tenantIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.$disconnect();
  });

  it('allows Tenant A and denies Tenant B even when its direct UUID is supplied', async () => {
    const result = await prisma.$transaction(async (transaction) => {
      await transaction.$executeRawUnsafe('SET LOCAL ROLE app_runtime');
      await transaction.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantIds[0]!}, true)`;
      const own = await transaction.opportunity.findUnique({ where: { id: opportunityA } });
      const foreign = await transaction.opportunity.findUnique({ where: { id: opportunityB } });
      return { own, foreign };
    });
    expect(result.own?.id).toBe(opportunityA);
    expect(result.foreign).toBeNull();
  });

  it('enforces the inverse boundary for Tenant B', async () => {
    const result = await prisma.$transaction(async (transaction) => {
      await transaction.$executeRawUnsafe('SET LOCAL ROLE app_runtime');
      await transaction.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantIds[1]!}, true)`;
      return {
        own: await transaction.opportunity.findUnique({ where: { id: opportunityB } }),
        foreign: await transaction.opportunity.findUnique({ where: { id: opportunityA } }),
      };
    });
    expect(result.own?.id).toBe(opportunityB);
    expect(result.foreign).toBeNull();
  });

  it('isolates every new Phase 1 tenant-owned commercial table', async () => {
    const result = await prisma.$transaction(async (transaction) => {
      await transaction.$executeRawUnsafe('SET LOCAL ROLE app_runtime');
      await transaction.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantIds[0]!}, true)`;
      return {
        ownCriterion: await transaction.qualificationCriterion.findUnique({
          where: { id: protectedA.criterion },
        }),
        foreignCriterion: await transaction.qualificationCriterion.findUnique({
          where: { id: protectedB.criterion },
        }),
        ownResponse: await transaction.qualificationResponse.findUnique({
          where: { id: protectedA.qualificationResponse },
        }),
        foreignResponse: await transaction.qualificationResponse.findUnique({
          where: { id: protectedB.qualificationResponse },
        }),
        ownBilling: await transaction.billingRecord.findUnique({
          where: { id: protectedA.billingRecord },
        }),
        foreignBilling: await transaction.billingRecord.findUnique({
          where: { id: protectedB.billingRecord },
        }),
        ownReview: await transaction.opportunityReviewEvent.findUnique({
          where: { id: protectedA.reviewEvent },
        }),
        foreignReview: await transaction.opportunityReviewEvent.findUnique({
          where: { id: protectedB.reviewEvent },
        }),
        ownEntitlement: await transaction.tenantFeatureEntitlement.findUnique({
          where: { id: protectedA.featureEntitlement },
        }),
        foreignEntitlement: await transaction.tenantFeatureEntitlement.findUnique({
          where: { id: protectedB.featureEntitlement },
        }),
      };
    });
    expect(result.ownCriterion).not.toBeNull();
    expect(result.ownResponse).not.toBeNull();
    expect(result.ownBilling).not.toBeNull();
    expect(result.ownReview).not.toBeNull();
    expect(result.ownEntitlement).not.toBeNull();
    expect(result.foreignCriterion).toBeNull();
    expect(result.foreignResponse).toBeNull();
    expect(result.foreignBilling).toBeNull();
    expect(result.foreignReview).toBeNull();
    expect(result.foreignEntitlement).toBeNull();
  });

  it('blocks cross-tenant inserts at the database policy', async () => {
    await expect(
      prisma.$transaction(async (transaction) => {
        await transaction.$executeRawUnsafe('SET LOCAL ROLE app_runtime');
        await transaction.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantIds[0]!}, true)`;
        return transaction.opportunity.create({
          data: {
            tenantId: tenantIds[1]!,
            sellerId: userIds[1]!,
            customerId: (
              await prisma.customer.findFirstOrThrow({ where: { tenantId: tenantIds[1]! } })
            ).id,
            stageId: (await prisma.stage.findFirstOrThrow({ where: { tenantId: tenantIds[1]! } }))
              .id,
            title: 'Injected cross-tenant record',
            currency: 'USD',
            estimatedAmount: 1,
            probability: 20,
            expectedCloseDate: new Date('2026-10-01'),
          },
        });
      }),
    ).rejects.toThrow(/row-level security policy/i);
  });

  it('blocks cross-tenant updates addressed by direct UUID', async () => {
    await expect(
      prisma.$transaction(async (transaction) => {
        await transaction.$executeRawUnsafe('SET LOCAL ROLE app_runtime');
        await transaction.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantIds[0]!}, true)`;
        return transaction.opportunity.update({
          where: { id: opportunityB },
          data: { title: 'Cross-tenant update must not persist' },
        });
      }),
    ).rejects.toThrow(/record to update not found|operation failed because it depends/i);

    const unchanged = await prisma.opportunity.findUniqueOrThrow({ where: { id: opportunityB } });
    expect(unchanged.title).toBe('Opportunity B');
  });
});
