import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';

type Fixture = {
  tenantId: string;
  userId: string;
  customerId: string;
  stageId: string;
  opportunityId: string;
};

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function createFixture(
  prisma: PrismaClient,
  runId: string,
  label: 'a' | 'b',
): Promise<Fixture> {
  const tenant = await prisma.tenant.create({
    data: {
      name: `Staging isolation ${label.toUpperCase()}`,
      slug: `staging-rls-${label}-${runId}`,
    },
  });
  const user = await prisma.user.create({
    data: {
      name: `Staging isolation ${label.toUpperCase()}`,
      email: `staging-rls-${label}-${runId}@example.test`,
    },
  });
  const [customer, stage] = await Promise.all([
    prisma.customer.create({ data: { tenantId: tenant.id, name: `Customer ${label}` } }),
    prisma.stage.create({
      data: {
        tenantId: tenant.id,
        code: '25',
        name: 'Discovery',
        probability: 25,
        sortOrder: 1,
      },
    }),
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
      title: `Staging isolation ${label.toUpperCase()}`,
      currency: 'USD',
      estimatedAmount: 10_000,
      probability: 25,
      expectedCloseDate: new Date('2026-10-01'),
    },
  });

  return {
    tenantId: tenant.id,
    userId: user.id,
    customerId: customer.id,
    stageId: stage.id,
    opportunityId: opportunity.id,
  };
}

async function main(): Promise<void> {
  if (!process.argv.includes('--staging') || process.env.APP_ENV !== 'staging') {
    throw new Error('This verification can only run with --staging and APP_ENV=staging');
  }

  const migrationUrl = required('MIGRATION_DATABASE_URL');
  const runtimeUrl = new URL(required('DATABASE_URL'));
  const runtimeUser = required('RUNTIME_DATABASE_USER');
  if (decodeURIComponent(runtimeUrl.username) !== runtimeUser) {
    throw new Error('DATABASE_URL does not use RUNTIME_DATABASE_USER');
  }

  const prisma = new PrismaClient({ datasources: { db: { url: migrationUrl } } });
  const runId = randomUUID().replaceAll('-', '').slice(0, 12);
  const tenantIds: string[] = [];
  const userIds: string[] = [];

  try {
    const roleState = await prisma.$queryRaw<
      Array<{ rolsuper: boolean; rolbypassrls: boolean; rolinherit: boolean }>
    >`SELECT rolsuper, rolbypassrls, rolinherit FROM pg_roles WHERE rolname = ${runtimeUser}`;
    if (
      !roleState[0] ||
      roleState[0].rolsuper ||
      roleState[0].rolbypassrls ||
      roleState[0].rolinherit
    ) {
      throw new Error('Runtime role is not restricted as required');
    }

    const fixtureA = await createFixture(prisma, runId, 'a');
    const fixtureB = await createFixture(prisma, runId, 'b');
    tenantIds.push(fixtureA.tenantId, fixtureB.tenantId);
    userIds.push(fixtureA.userId, fixtureB.userId);

    const visibility = await prisma.$transaction(async (transaction) => {
      await transaction.$executeRawUnsafe('SET LOCAL ROLE app_runtime');
      await transaction.$executeRaw`SELECT set_config('app.current_tenant_id', ${fixtureA.tenantId}, true)`;
      return {
        own: await transaction.opportunity.findUnique({
          where: { id: fixtureA.opportunityId },
        }),
        foreign: await transaction.opportunity.findUnique({
          where: { id: fixtureB.opportunityId },
        }),
      };
    });
    if (visibility.own?.id !== fixtureA.opportunityId || visibility.foreign !== null) {
      throw new Error('Cross-tenant SELECT isolation failed');
    }

    let insertBlocked = false;
    try {
      await prisma.$transaction(async (transaction) => {
        await transaction.$executeRawUnsafe('SET LOCAL ROLE app_runtime');
        await transaction.$executeRaw`SELECT set_config('app.current_tenant_id', ${fixtureA.tenantId}, true)`;
        await transaction.opportunity.create({
          data: {
            tenantId: fixtureB.tenantId,
            sellerId: fixtureB.userId,
            customerId: fixtureB.customerId,
            stageId: fixtureB.stageId,
            title: 'Cross-tenant insert must fail',
            currency: 'USD',
            estimatedAmount: 1,
            probability: 25,
            expectedCloseDate: new Date('2026-10-01'),
          },
        });
      });
    } catch (error) {
      insertBlocked = /row-level security policy/i.test(String(error));
    }
    if (!insertBlocked) throw new Error('Cross-tenant INSERT was not blocked by RLS');

    let updateBlocked = false;
    try {
      await prisma.$transaction(async (transaction) => {
        await transaction.$executeRawUnsafe('SET LOCAL ROLE app_runtime');
        await transaction.$executeRaw`SELECT set_config('app.current_tenant_id', ${fixtureA.tenantId}, true)`;
        await transaction.opportunity.update({
          where: { id: fixtureB.opportunityId },
          data: { title: 'Cross-tenant update must fail' },
        });
      });
    } catch (error) {
      updateBlocked = /record to update not found|operation failed because it depends/i.test(
        String(error),
      );
    }
    if (!updateBlocked) throw new Error('Cross-tenant UPDATE was not blocked by RLS');

    const unchanged = await prisma.opportunity.findUniqueOrThrow({
      where: { id: fixtureB.opportunityId },
    });
    if (unchanged.title !== 'Staging isolation B') {
      throw new Error('Cross-tenant UPDATE changed the protected record');
    }

    console.log(
      JSON.stringify({
        status: 'passed',
        checks: ['runtime-role', 'select-isolation', 'insert-isolation', 'update-isolation'],
      }),
    );
  } finally {
    if (tenantIds.length > 0) {
      await prisma.tenant.deleteMany({ where: { id: { in: tenantIds } } });
    }
    if (userIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
    await prisma.$disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Staging security verification failed');
  process.exitCode = 1;
});
