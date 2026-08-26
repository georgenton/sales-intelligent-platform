import * as argon2 from 'argon2';
import { describe, expect, it } from 'vitest';
import {
  assertStagingRotationTarget,
  hashPassword,
  rotationDatabaseUrl,
  validateNewPassword,
} from './staging-password-rotation';

const stagingEnvironment: NodeJS.ProcessEnv = {
  NODE_ENV: 'production',
  APP_ENV: 'staging',
  APP_URL: 'https://sales-intelligence-staging-georgenton.vercel.app',
  DATABASE_URL: 'postgresql://runtime:password@runtime.example.test/database',
  MIGRATION_DATABASE_URL: 'postgresql://owner:password@owner.example.test/database',
  RAILWAY_PROJECT_NAME: 'sales-intelligence-staging',
  RAILWAY_ENVIRONMENT_NAME: 'staging',
  RAILWAY_SERVICE_NAME: 'api-staging',
  STAGING_ROTATION_CONFIRMATION: 'sales-intelligence-staging/admin@techdistribution.demo',
};

describe('staging password rotation guards', () => {
  it('accepts only the dedicated staging target with explicit confirmation', () => {
    expect(() => assertStagingRotationTarget(stagingEnvironment, ['--staging'])).not.toThrow();
    expect(() =>
      assertStagingRotationTarget(
        { ...stagingEnvironment, RAILWAY_ENVIRONMENT_NAME: 'production' },
        ['--staging'],
      ),
    ).toThrow(/dedicated Railway staging project/);
    expect(() => assertStagingRotationTarget(stagingEnvironment, [])).toThrow(/--staging/);
  });

  it('accepts only an explicit SSH tunnel to the staging database service', () => {
    const databaseServiceEnvironment: NodeJS.ProcessEnv = {
      NODE_ENV: 'production',
      APP_ENV: 'staging',
      PGUSER: 'owner',
      PGPASSWORD: 'password',
      PGDATABASE: 'database',
      STAGING_DATABASE_TUNNEL_PORT: '55439',
      RAILWAY_PROJECT_NAME: 'sales-intelligence-staging',
      RAILWAY_ENVIRONMENT_NAME: 'staging',
      RAILWAY_SERVICE_NAME: 'Postgres',
      STAGING_ROTATION_CONFIRMATION: 'sales-intelligence-staging/admin@techdistribution.demo',
    };
    expect(() =>
      assertStagingRotationTarget(databaseServiceEnvironment, ['--staging', '--database-service']),
    ).not.toThrow();
    expect(rotationDatabaseUrl(databaseServiceEnvironment)).toBe(
      'postgresql://owner:password@127.0.0.1:55439/database?sslmode=require',
    );
    expect(() => assertStagingRotationTarget(databaseServiceEnvironment, ['--staging'])).toThrow(
      /--database-service, an SSH tunnel/,
    );
  });

  it('rejects weak or whitespace-bearing passwords', () => {
    expect(() => validateNewPassword('short')).toThrow(/between 48 and 256/);
    expect(() => validateNewPassword(`${'a'.repeat(63)} `)).toThrow(/whitespace/);
  });

  it('hashes credentials with Argon2id', async () => {
    const password = 'a'.repeat(64);
    const hash = await hashPassword(password);
    expect(hash).toMatch(/^\$argon2id\$/);
    await expect(argon2.verify(hash, password)).resolves.toBe(true);
  });
});
