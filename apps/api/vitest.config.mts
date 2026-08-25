import { defineConfig } from 'vitest/config';

process.env.DATABASE_URL ??=
  'postgresql://postgres:local_only_change_me@localhost:5449/sales_intelligence?schema=public';
process.env.NODE_ENV ??= 'test';
process.env.APP_URL ??= 'http://localhost:3000';

export default defineConfig({
  test: {
    include: ['**/*.spec.ts', '**/*.integration-spec.ts'],
    environment: 'node',
    globals: false,
    testTimeout: 20_000,
    hookTimeout: 20_000,
    pool: 'forks',
    fileParallelism: false,
  },
});
