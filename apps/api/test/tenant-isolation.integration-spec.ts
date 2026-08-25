import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const prisma = new PrismaClient();
const runId = randomUUID().slice(0, 8);
const tenantIds: string[] = [];
const userIds: string[] = [];
let opportunityA = '';
let opportunityB = '';

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
  const [stage, customer] = await Promise.all([
    prisma.stage.create({
      data: { tenantId: tenant.id, code: '25', name: 'Discovery', probability: 25, sortOrder: 1 },
    }),
    prisma.customer.create({ data: { tenantId: tenant.id, name: `Customer ${label}` } }),
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
      probability: 25,
      expectedCloseDate: new Date('2026-10-01'),
    },
  });
  return { tenant, user, stage, customer, opportunity };
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
            probability: 25,
            expectedCloseDate: new Date('2026-10-01'),
          },
        });
      }),
    ).rejects.toThrow(/row-level security policy/i);
  });
});
