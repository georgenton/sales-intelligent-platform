import * as argon2 from 'argon2';
import type { PrismaClient } from '@prisma/client';

const ADMIN_EMAIL = 'admin@techdistribution.demo';
const TENANT_SLUG = 'tech-distribution-demo';
const EXPECTED_APP_URL = 'https://sales-intelligence-staging-georgenton.vercel.app';
const ROTATION_CONFIRMATION = 'sales-intelligence-staging/admin@techdistribution.demo';

export const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

export function assertStagingRotationTarget(
  env: NodeJS.ProcessEnv,
  arguments_: readonly string[],
): void {
  if (!arguments_.includes('--staging')) {
    throw new Error('Password rotation requires the explicit --staging flag');
  }
  if (env.NODE_ENV !== 'production' || env.APP_ENV !== 'staging') {
    throw new Error('Password rotation requires NODE_ENV=production and APP_ENV=staging');
  }
  if (
    env.RAILWAY_PROJECT_NAME !== 'sales-intelligence-staging' ||
    env.RAILWAY_ENVIRONMENT_NAME !== 'staging'
  ) {
    throw new Error('Password rotation requires the dedicated Railway staging project');
  }
  if (env.RAILWAY_SERVICE_NAME === 'api-staging') {
    if (env.APP_URL !== EXPECTED_APP_URL) {
      throw new Error('Password rotation target APP_URL is not the dedicated staging application');
    }
    if (!env.MIGRATION_DATABASE_URL) {
      throw new Error('MIGRATION_DATABASE_URL is required for password rotation');
    }
    if (env.MIGRATION_DATABASE_URL === env.DATABASE_URL) {
      throw new Error('Password rotation requires separate migration and runtime credentials');
    }
  } else if (env.RAILWAY_SERVICE_NAME === 'Postgres') {
    if (
      !arguments_.includes('--database-service') ||
      !env.STAGING_DATABASE_TUNNEL_PORT ||
      !env.PGUSER ||
      !env.PGPASSWORD ||
      !env.PGDATABASE
    ) {
      throw new Error(
        'The staging database service requires --database-service, an SSH tunnel and PG credentials',
      );
    }
  } else {
    throw new Error('Password rotation requires the dedicated Railway staging service');
  }
  if (env.STAGING_ROTATION_CONFIRMATION !== ROTATION_CONFIRMATION) {
    throw new Error('Password rotation confirmation is missing or invalid');
  }
}

export function rotationDatabaseUrl(env: NodeJS.ProcessEnv): string {
  if (env.RAILWAY_SERVICE_NAME === 'Postgres') {
    const port = env.STAGING_DATABASE_TUNNEL_PORT;
    if (!port || !/^\d{4,5}$/u.test(port) || !env.PGUSER || !env.PGPASSWORD || !env.PGDATABASE) {
      throw new Error('The staging database SSH tunnel configuration is invalid');
    }
    const url = new URL('postgresql://localhost');
    url.username = env.PGUSER;
    url.password = env.PGPASSWORD;
    url.hostname = '127.0.0.1';
    url.port = port;
    url.pathname = `/${env.PGDATABASE}`;
    url.searchParams.set('sslmode', 'require');
    return url.toString();
  }

  const value = env.MIGRATION_DATABASE_URL;
  if (!value || !value.startsWith('postgresql://')) {
    throw new Error('A PostgreSQL owner connection is required for password rotation');
  }
  return value;
}

export function validateNewPassword(password: string): void {
  if (password.length < 48 || password.length > 256) {
    throw new Error('The staging password must contain between 48 and 256 characters');
  }
  if (
    [...password].some((character) => {
      const codePoint = character.codePointAt(0)!;
      return /\s/u.test(character) || codePoint < 32 || codePoint === 127;
    })
  ) {
    throw new Error('The staging password cannot contain whitespace or control characters');
  }
  if (password === 'ChangeMe-Local-2026!') {
    throw new Error('The local demonstration password cannot be used for staging');
  }
}

export async function hashPassword(password: string): Promise<string> {
  validateNewPassword(password);
  return argon2.hash(password, ARGON2_OPTIONS);
}

export async function rotateStagingAdminPassword(
  prisma: PrismaClient,
  password: string,
): Promise<{ revokedSessions: number }> {
  const passwordHash = await hashPassword(password);
  const tenant = await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } });
  const user = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
    include: {
      localCredential: true,
      memberships: { where: { tenantId: tenant?.id, status: 'ACTIVE' }, take: 1 },
    },
  });

  if (!tenant || !user || !user.localCredential || user.memberships.length !== 1) {
    throw new Error('The active staging administrator credential could not be resolved');
  }

  return prisma.$transaction(async (transaction) => {
    const changedAt = new Date();
    await transaction.localCredential.update({
      where: { userId: user.id },
      data: { passwordHash, passwordChangedAt: changedAt },
    });
    await transaction.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
    const revoked = await transaction.session.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: changedAt },
    });
    await transaction.auditEvent.create({
      data: {
        tenantId: tenant.id,
        actorId: user.id,
        action: 'STAGING_ADMIN_PASSWORD_ROTATED',
        entity: 'User',
        entityId: user.id,
        metadata: { revokedSessions: revoked.count },
      },
    });
    return { revokedSessions: revoked.count };
  });
}
