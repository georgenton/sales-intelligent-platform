import { describe, expect, it } from 'vitest';
import { assertFeatureOperationAllowed } from './feature-operation-guard';

const staging = {
  tenantSlug: 'tech-distribution-demo',
  requestedEnvironment: 'staging',
  appEnvironment: 'staging',
  migrationDatabaseUrl: 'postgresql://owner:secret@example.test/database',
  allowStagingChanges: 'true',
};

describe('feature operation guard', () => {
  it('allows an explicitly confirmed staging operation', () => {
    expect(() => assertFeatureOperationAllowed(staging)).not.toThrow();
  });

  it('rejects a missing or mismatched explicit environment', () => {
    expect(() =>
      assertFeatureOperationAllowed({ ...staging, requestedEnvironment: undefined }),
    ).toThrow('--environment must be staging or production');
    expect(() =>
      assertFeatureOperationAllowed({ ...staging, appEnvironment: 'production' }),
    ).toThrow('--environment must exactly match APP_ENV');
  });

  it('rejects staging without the migration credential and mutation guard', () => {
    expect(() =>
      assertFeatureOperationAllowed({ ...staging, migrationDatabaseUrl: undefined }),
    ).toThrow('MIGRATION_DATABASE_URL is required');
    expect(() =>
      assertFeatureOperationAllowed({ ...staging, allowStagingChanges: undefined }),
    ).toThrow('ALLOW_PLATFORM_FEATURE_CHANGES=true');
  });

  it('requires exact production confirmation in addition to the production guard', () => {
    const production = {
      ...staging,
      requestedEnvironment: 'production',
      appEnvironment: 'production',
      allowProductionChanges: 'true',
    };
    expect(() => assertFeatureOperationAllowed(production)).toThrow('--confirm-production');
    expect(() =>
      assertFeatureOperationAllowed({
        ...production,
        productionConfirmation: production.tenantSlug,
      }),
    ).not.toThrow();
  });
});
