import { defineRailway, github, postgres, preserve, project, service } from 'railway/iac';

export default defineRailway(() => {
  const database = postgres('Postgres', { region: 'us-west2' });

  const api = service('api-staging', {
    source: github('georgenton/sales-intelligence-platform', {
      branch: 'staging',
      checkSuites: true,
    }),
    build: {
      builder: 'DOCKERFILE',
      buildEnvironment: 'V3',
      dockerfilePath: 'apps/api/Dockerfile',
      watchPatterns: [
        'apps/api/**',
        'packages/shared/**',
        'packages/typescript-config/**',
        'package.json',
        'pnpm-lock.yaml',
        'pnpm-workspace.yaml',
        '.railway/**',
      ],
    },
    preDeploy: 'node /app/scripts/predeploy.cjs',
    healthcheck: '/health/ready',
    healthcheckTimeout: 120,
    replicas: { 'us-west2': 1 },
    deploy: {
      ipv6EgressEnabled: false,
      restartPolicyMaxRetries: 3,
      runtime: 'V2',
      useLegacyStacker: false,
    },
    env: {
      AI_PROVIDER: preserve(),
      APP_ENV: preserve(),
      APP_URL: preserve(),
      DATABASE_URL: preserve(),
      LOG_LEVEL: preserve(),
      MIGRATION_DATABASE_URL: preserve(),
      NODE_ENV: preserve(),
      PORT: preserve(),
      RUNTIME_DATABASE_PASSWORD: preserve(),
      RUNTIME_DATABASE_USER: preserve(),
      SESSION_TTL_HOURS: preserve(),
    },
  });

  return project('sales-intelligence-staging', {
    resources: [api, database],
  });
});
