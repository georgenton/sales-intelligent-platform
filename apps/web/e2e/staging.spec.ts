import { expect, test, type Page } from '@playwright/test';

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

async function signIn(page: Page, email: string, password: string) {
  await page.goto('/login', { waitUntil: 'networkidle' });
  const emailInput = page.getByLabel('Email', { exact: true });
  const passwordInput = page.getByLabel('Password', { exact: true });
  await emailInput.fill(email);
  await passwordInput.fill(password);
  await expect(emailInput).toHaveValue(email);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
}

test('admin can manage a synthetic opportunity and end the session', async ({ page }) => {
  const title = `E2E staging opportunity ${Date.now()}`;
  const closeDate = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);

  await signIn(page, adminEmail, adminPassword!);

  await expect(page).toHaveURL(/\/app\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Will the team reach quota?' })).toBeVisible();
  await expect(page.getByText('Team quota attainment')).toBeVisible();

  await page.keyboard.press('Control+k');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
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
  await signIn(page, adminEmail, adminPassword!);

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
  await expect(opportunity).toBeFocused();

  await page.goto('/app/alerts');
  const inspect = page.getByRole('button', { name: /^Inspect / }).first();
  await expect(inspect).toBeVisible();
  await inspect.click();
  const alertDrawer = page.getByRole('dialog').last();
  await expect(alertDrawer).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(alertDrawer).toBeHidden();
});

test('manager review advances only after an explicit decision', async ({ page }) => {
  await signIn(page, adminEmail, adminPassword!);
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

test('Copilot traps and restores focus, preserves a failed question and retries', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  let requests = 0;
  await page.route('**/backend/ai/manager-brief', async (route) => {
    requests += 1;
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Synthetic provider failure' }),
    });
  });
  await signIn(page, adminEmail, adminPassword!);

  const launcher = page.getByRole('button', { name: 'Open contextual Copilot' });
  await expect(launcher).toBeVisible();
  await launcher.click();
  const panel = page.getByRole('dialog', { name: 'Contextual Copilot' });
  await expect(panel).toBeVisible();
  const collapse = panel.getByRole('button', { name: 'Collapse Copilot' });
  await expect(collapse).toBeFocused();

  await page.keyboard.press('Shift+Tab');
  const prompt = panel.getByLabel('Ask Sales Copilot');
  await expect(prompt).toBeFocused();
  await prompt.fill('Summarize current risk');
  await panel.getByRole('button', { name: 'Send to Copilot' }).click();
  await expect(panel.getByRole('alert')).toContainText('could not answer this request');
  await expect(prompt).toHaveValue('Summarize current risk');
  await panel.getByRole('button', { name: 'Retry question' }).click();
  await expect.poll(() => requests).toBe(2);
  await expect(panel.getByRole('alert')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(launcher).toBeFocused();
});

test('import rejects workbooks and blocks unconfirmed or invalid rows before mutation', async ({
  page,
}) => {
  let opportunityPosts = 0;
  page.on('request', (request) => {
    if (
      request.method() === 'POST' &&
      new URL(request.url()).pathname === '/backend/opportunities'
    ) {
      opportunityPosts += 1;
    }
  });
  await signIn(page, adminEmail, adminPassword!);
  await page.goto('/app/import');

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: 'opportunities.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: Buffer.from('not-an-excel-workbook'),
  });
  await expect(page.getByRole('alert')).toContainText('Unsupported file type');
  await expect(page.getByText('Upload', { exact: true }).last()).toBeVisible();

  await fileInput.setInputFiles({
    name: 'opportunities.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(
      [
        'Opportunity,Customer,Stage,Amount,Expected close,Brand',
        'Synthetic blocked row,Unknown customer,Unknown stage,1000,2026-10-15,Unknown brand',
      ].join('\n'),
    ),
  });
  await expect(page.getByText('Template detection', { exact: true }).last()).toBeVisible();
  await page.getByRole('button', { name: /Continue/ }).click();
  await expect(page.getByText('Mapping validation: BLOCKED')).toBeVisible();
  await expect(page.getByRole('button', { name: /Continue/ })).toBeDisabled();

  const confirm = page.getByRole('button', { name: 'Confirm mapping' });
  while ((await confirm.count()) > 0) await confirm.first().click();
  await expect(page.getByText('Mapping validation: PASS')).toBeVisible();
  await page.getByRole('button', { name: /Continue/ }).click();
  await page.getByRole('button', { name: /Continue/ }).click();
  await expect(page.getByText('Data quality: BLOCKED')).toBeVisible();
  await expect(page.getByText('Every row is BLOCKED')).toBeVisible();
  await expect(page.getByRole('button', { name: /Continue/ })).toBeDisabled();
  expect(opportunityPosts).toBe(0);
});

test('appearance cycles through Light, Dark and System and persists', async ({ page }) => {
  await signIn(page, adminEmail, adminPassword!);
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
  await signIn(page, sellerEmail!, sellerPassword!);
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
