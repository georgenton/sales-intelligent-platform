import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: true,
  retries: 1,
  reporter: [['line']],
  use: {
    baseURL: process.env.STAGING_BASE_URL,
    screenshot: 'only-on-failure',
    trace: 'off',
    video: 'off',
    ...devices['Desktop Chrome'],
  },
});
