export interface FeatureOperationGuardInput {
  tenantSlug: string;
  requestedEnvironment?: string;
  appEnvironment?: string;
  migrationDatabaseUrl?: string;
  allowStagingChanges?: string;
  allowProductionChanges?: string;
  productionConfirmation?: string;
}

export function assertFeatureOperationAllowed(input: FeatureOperationGuardInput): void {
  if (!['staging', 'production'].includes(input.requestedEnvironment ?? '')) {
    throw new Error('--environment must be staging or production');
  }
  if (input.requestedEnvironment !== input.appEnvironment) {
    throw new Error('--environment must exactly match APP_ENV');
  }
  if (!input.migrationDatabaseUrl) {
    throw new Error('MIGRATION_DATABASE_URL is required');
  }
  if (input.requestedEnvironment === 'staging') {
    if (input.allowStagingChanges !== 'true') {
      throw new Error('Staging changes require ALLOW_PLATFORM_FEATURE_CHANGES=true');
    }
    return;
  }
  if (
    input.allowProductionChanges !== 'true' ||
    input.productionConfirmation !== input.tenantSlug
  ) {
    throw new Error(
      'Production changes require ALLOW_PRODUCTION_FEATURE_CHANGES=true and --confirm-production <tenant>',
    );
  }
}
