import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { isTenantFeatureKey } from '../modules/features/feature-catalog';
import { assertFeatureOperationAllowed } from '../modules/features/feature-operation-guard';

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main(): Promise<void> {
  const tenantSlug = argument('--tenant');
  const requestedEnvironment = argument('--environment');
  const featureKey = argument('--feature');
  const list = process.argv.includes('--list');
  const enable = process.argv.includes('--enable');
  const disable = process.argv.includes('--disable');
  if (!tenantSlug || Number(list) + Number(enable) + Number(disable) !== 1) {
    throw new Error(
      'Usage: platform:feature -- --environment <staging|production> --tenant <slug> [--list | --feature <key> (--enable|--disable)]',
    );
  }
  if (!list && (!featureKey || !isTenantFeatureKey(featureKey))) {
    throw new Error('A valid --feature from the Phase 1 catalog is required');
  }
  assertFeatureOperationAllowed({
    tenantSlug,
    requestedEnvironment,
    appEnvironment: process.env.APP_ENV,
    migrationDatabaseUrl: process.env.MIGRATION_DATABASE_URL,
    allowStagingChanges: process.env.ALLOW_PLATFORM_FEATURE_CHANGES,
    allowProductionChanges: process.env.ALLOW_PRODUCTION_FEATURE_CHANGES,
    productionConfirmation: argument('--confirm-production'),
  });
  const prisma = new PrismaClient({
    datasources: { db: { url: process.env.MIGRATION_DATABASE_URL } },
  });
  try {
    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) throw new Error('Tenant not found');
    if (list) {
      const rows = await prisma.tenantFeatureEntitlement.findMany({
        where: { tenantId: tenant.id },
        select: { featureKey: true, enabled: true, updatedAt: true },
        orderBy: { featureKey: 'asc' },
      });
      console.log(JSON.stringify(rows));
      return;
    }
    const enabled = enable;
    const entitlement = await prisma.tenantFeatureEntitlement.upsert({
      where: { tenantId_featureKey: { tenantId: tenant.id, featureKey: featureKey! } },
      update: { enabled },
      create: { tenantId: tenant.id, featureKey: featureKey!, enabled },
    });
    await prisma.auditEvent.create({
      data: {
        tenantId: tenant.id,
        action: 'TENANT_FEATURE_ENTITLEMENT_CHANGED',
        entity: 'TenantFeatureEntitlement',
        entityId: entitlement.id,
        metadata: { featureKey, enabled, environment: process.env.APP_ENV },
      },
    });
    console.log(`${featureKey}: ${enabled ? 'enabled' : 'disabled'} for ${tenantSlug}`);
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Feature operation failed');
  process.exitCode = 1;
});
