import { defineConfig, devices } from '@playwright/test';

const vercelAutomationBypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: true,
  retries: 1,
  reporter: [['line']],
  use: {
    baseURL: process.env.STAGING_BASE_URL,
    extraHTTPHeaders: vercelAutomationBypass
      ? { 'x-vercel-protection-bypass': vercelAutomationBypass }
      : undefined,
    screenshot: 'only-on-failure',
    trace: 'off',
    video: 'off',
    ...devices['Desktop Chrome'],
  },
});
