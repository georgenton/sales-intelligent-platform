import { expect, test } from '@playwright/test';

const baseUrl = process.env.STAGING_BASE_URL;
const adminEmail = process.env.STAGING_ADMIN_EMAIL ?? 'admin@techdistribution.demo';
const adminPassword = process.env.STAGING_ADMIN_PASSWORD;
const sellerEmail = process.env.STAGING_SELLER_EMAIL;
const sellerPassword = process.env.STAGING_SELLER_PASSWORD;

test.beforeAll(() => {
  if (!baseUrl || !adminPassword) {
    throw new Error('STAGING_BASE_URL and STAGING_ADMIN_PASSWORD are required');
  }
  const target = new URL(baseUrl);
  const localRun =
    process.env.E2E_ALLOW_LOCAL === 'true' &&
    target.protocol === 'http:' &&
    ['127.0.0.1', 'localhost'].includes(target.hostname);
  if (target.protocol !== 'https:' && !localRun) {
    throw new Error('The staging E2E suite only accepts an HTTPS target');
  }
  if (adminPassword === 'ChangeMe-Local-2026!' && !localRun) {
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
  await expect(page.getByRole('heading', { name: 'Will the team reach quota?' })).toBeVisible();
  await expect(page.getByText('Team quota attainment')).toBeVisible();

  await page.keyboard.press('Control+k');
  await page.getByRole('option', { name: /Create opportunity/ }).click();
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

test('manager drills into the funnel, opens context and closes with Escape', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email', { exact: true }).fill(adminEmail);
  await page.getByLabel('Password', { exact: true }).fill(adminPassword!);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  const commit = page.getByRole('button', { name: /^Commit:/ }).first();
  await expect(commit).toBeVisible();
  await commit.click();
  await expect(page.getByText(/Commit · \d+ opportunities/)).toBeVisible();

  const opportunity = page.getByRole('button', { name: /Health \d+/ }).first();
  await expect(opportunity).toBeVisible();
  await opportunity.click();
  const drawer = page.getByRole('dialog', { name: /Opportunity context|.+/ }).last();
  await expect(drawer).toBeVisible();
  await drawer.getByRole('button', { name: 'Ask Copilot' }).click();
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
});

test('manager review advances only after an explicit decision', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email', { exact: true }).fill(adminEmail);
  await page.getByLabel('Password', { exact: true }).fill(adminPassword!);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByRole('button', { name: 'Forecast review' }).click();
  await expect(
    page.getByText(/classifications change only after an explicit action/i),
  ).toBeVisible();
  const headingBefore = await page.getByRole('heading', { level: 1 }).textContent();
  const keep = page.getByRole('button', { name: 'Keep Commit' });
  await expect(keep).toBeVisible();
  await keep.click();
  await expect(page.getByRole('heading', { level: 1 })).not.toHaveText(headingBefore ?? '');
});

test('appearance cycles through Light, Dark and System and persists', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email', { exact: true }).fill(adminEmail);
  await page.getByLabel('Password', { exact: true }).fill(adminPassword!);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  const appearance = page.getByLabel('Appearance');
  await appearance.selectOption('DARK');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const persistedAppearance = page.getByLabel('Appearance');
  await expect(persistedAppearance).toHaveValue('DARK');
  await persistedAppearance.selectOption('LIGHT');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByLabel('Appearance').selectOption('SYSTEM');
  await expect(page.getByLabel('Appearance')).toHaveValue('SYSTEM');
});

test('seller completes Focus and advances the Guided queue', async ({ page }) => {
  test.skip(!sellerEmail || !sellerPassword, 'Seller staging credentials are optional');
  await page.goto('/login');
  await page.getByLabel('Email', { exact: true }).fill(sellerEmail!);
  await page.getByLabel('Password', { exact: true }).fill(sellerPassword!);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByLabel('Cognitive mode').selectOption('FOCUS');
  await expect(page.getByRole('heading', { name: '3 priorities today' })).toBeVisible();
  const priority = page.getByRole('button', { name: /Complete priority 1/ });
  await expect(priority).toBeVisible();
  await priority.click();
  await page.getByRole('button', { name: /Start guided queue/ }).click();
  const recommendation = page.getByRole('button', { name: /Choose recommendation/ });
  await expect(recommendation).toBeVisible();
  await recommendation.click();
  await expect(page.getByText(/session decisions/)).toBeVisible();
});
