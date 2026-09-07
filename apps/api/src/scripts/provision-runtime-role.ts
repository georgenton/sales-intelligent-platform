import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const ROLE_PATTERN = /^[a-z][a-z0-9_]{2,62}$/;
const PASSWORD_PATTERN = /^[A-Za-z0-9_-]{32,128}$/;

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function quotedIdentifier(value: string): string {
  if (!ROLE_PATTERN.test(value)) throw new Error('RUNTIME_DATABASE_USER is invalid');
  return `"${value}"`;
}

function quotedPassword(value: string): string {
  if (!PASSWORD_PATTERN.test(value)) {
    throw new Error('RUNTIME_DATABASE_PASSWORD must be 32-128 URL-safe characters');
  }
  return `'${value}'`;
}

async function main(): Promise<void> {
  const migrationUrl = required('MIGRATION_DATABASE_URL');
  const runtimeUser = required('RUNTIME_DATABASE_USER');
  const runtimePassword = required('RUNTIME_DATABASE_PASSWORD');
  const role = quotedIdentifier(runtimeUser);
  const password = quotedPassword(runtimePassword);
  const prisma = new PrismaClient({ datasources: { db: { url: migrationUrl } } });

  try {
    const databaseState = await prisma.$queryRaw<Array<{ database_name: string }>>`
      SELECT current_database() AS database_name
    `;
    const databaseName = databaseState[0]?.database_name;
    if (!databaseName) throw new Error('Unable to resolve the target database');
    const database = `"${databaseName.replaceAll('"', '""')}"`;

    await prisma.$executeRawUnsafe(`
      DO $provision$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${runtimeUser}') THEN
          CREATE ROLE ${role} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
        END IF;
      END
      $provision$;
    `);
    await prisma.$executeRawUnsafe(
      `ALTER ROLE ${role} WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS PASSWORD ${password}`,
    );
    await prisma.$executeRawUnsafe(`GRANT app_runtime TO ${role}`);
    await prisma.$executeRawUnsafe(`GRANT CONNECT ON DATABASE ${database} TO ${role}`);
    await prisma.$executeRawUnsafe(`REVOKE CREATE ON SCHEMA public FROM ${role}`);
    await prisma.$executeRawUnsafe(
      `REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM ${role}`,
    );
    await prisma.$executeRawUnsafe(
      `REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM ${role}`,
    );
    await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO ${role}`);
    await prisma.$executeRawUnsafe(
      `GRANT SELECT ON users, tenants, tenant_memberships, auth_identities, local_credentials, sessions, password_reset_tokens TO ${role}`,
    );
    await prisma.$executeRawUnsafe(`GRANT UPDATE ON users TO ${role}`);
    await prisma.$executeRawUnsafe(`GRANT UPDATE ON local_credentials TO ${role}`);
    await prisma.$executeRawUnsafe(`GRANT INSERT, UPDATE ON sessions TO ${role}`);
    await prisma.$executeRawUnsafe(`GRANT INSERT, UPDATE ON password_reset_tokens TO ${role}`);

    const state = await prisma.$queryRaw<Array<{ rolsuper: boolean; rolbypassrls: boolean }>>`
      SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = ${runtimeUser}
    `;
    if (!state[0] || state[0].rolsuper || state[0].rolbypassrls) {
      throw new Error('Runtime database role safety verification failed');
    }
    console.log(`Provisioned restricted runtime database role: ${runtimeUser}`);
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Runtime role provisioning failed');
  process.exitCode = 1;
});
