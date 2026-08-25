import { expect, test } from '@playwright/test';

const baseUrl = process.env.STAGING_BASE_URL;
const adminEmail = process.env.STAGING_ADMIN_EMAIL ?? 'admin@techdistribution.demo';
const adminPassword = process.env.STAGING_ADMIN_PASSWORD;

test.beforeAll(() => {
  if (!baseUrl || !adminPassword) {
    throw new Error('STAGING_BASE_URL and STAGING_ADMIN_PASSWORD are required');
  }
  if (new URL(baseUrl).protocol !== 'https:') {
    throw new Error('The staging E2E suite only accepts an HTTPS target');
  }
  if (adminPassword === 'ChangeMe-Local-2026!') {
    throw new Error('The local demonstration password is forbidden in staging');
  }
});

test('admin can manage a synthetic opportunity and end the session', async ({ page }) => {
  const title = `E2E staging opportunity ${Date.now()}`;
  const closeDate = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);

  await page.goto('/login');
  await page.getByLabel('Email', { exact: true }).fill(adminEmail);
  await page.getByLabel('Password', { exact: true }).fill(adminPassword!);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  await expect(page).toHaveURL(/\/app\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'How is the quarter looking?' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Quarter KPIs' })).toBeVisible();

  await page.getByRole('link', { name: 'New opportunity' }).first().click();
  await page.getByLabel('Title', { exact: true }).fill(title);
  await page.getByLabel('Estimated amount', { exact: true }).fill('12500');
  await page.getByLabel('Gross profit', { exact: true }).fill('2500');
  await page.getByLabel('Expected close', { exact: true }).fill(closeDate);
  await page.getByLabel('Description 1', { exact: true }).fill('Synthetic E2E line item');
  await page.getByLabel('Amount 1', { exact: true }).fill('12500');
  await page.getByLabel('Cost 1', { exact: true }).fill('10000');
  await page.getByRole('button', { name: 'Create opportunity' }).click();

  await expect(page).toHaveURL(/\/app\/opportunities\/[0-9a-f-]+$/);
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
  await page
    .getByRole('combobox', { name: 'Stage', exact: true })
    .selectOption({ label: '50% · Proposal' });
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toHaveText('Changes saved.');
  await expect(page.getByText('50% · Proposal').first()).toBeVisible();

  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/app/dashboard');
  await expect(page).toHaveURL(/\/login$/);
});
