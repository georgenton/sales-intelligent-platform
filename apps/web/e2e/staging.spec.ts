import { expect, test, type BrowserContext, type Page } from '@playwright/test';

const baseUrl = process.env.STAGING_BASE_URL;
const adminEmail = process.env.STAGING_ADMIN_EMAIL ?? 'admin@techdistribution.demo';
const adminPassword = process.env.STAGING_ADMIN_PASSWORD;
const sellerEmail = process.env.STAGING_SELLER_EMAIL;
const sellerPassword = process.env.STAGING_SELLER_PASSWORD;
const vercelAutomationBypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

let adminContext: BrowserContext;
let adminPage: Page;
let sellerContext: BrowserContext | undefined;
let sellerPage: Page | undefined;

function browserContextOptions() {
  return {
    baseURL: baseUrl!,
    extraHTTPHeaders: vercelAutomationBypass
      ? { 'x-vercel-protection-bypass': vercelAutomationBypass }
      : undefined,
  };
}

test.beforeAll(async ({ browser }) => {
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

  adminContext = await browser.newContext(browserContextOptions());
  adminPage = await adminContext.newPage();
  await signIn(adminPage, adminEmail, adminPassword);
  await expect(adminPage).toHaveURL(/\/app\/dashboard$/);
});

test.afterAll(async () => {
  await sellerContext?.close();
  await adminContext?.close();
});

async function signIn(page: Page, email: string, password: string, locale: 'en' | 'es' = 'en') {
  await page.context().addCookies([{ name: 'sip_locale', value: locale, url: baseUrl! }]);
  await page.goto('/login', { waitUntil: 'networkidle' });
  const emailInput = page.getByLabel(locale === 'es' ? 'Correo electrónico' : 'Email', {
    exact: true,
  });
  const passwordInput = page.getByLabel(locale === 'es' ? 'Contraseña' : 'Password', {
    exact: true,
  });
  await emailInput.fill(email);
  await passwordInput.fill(password);
  await expect(emailInput).toHaveValue(email);
  await page
    .getByRole('button', { name: locale === 'es' ? 'Iniciar sesión' : 'Sign in', exact: true })
    .click();
}

test('login defaults to Spanish and preserves locale, route, theme and authentication', async ({
  browser,
}) => {
  const context = await browser.newContext(browserContextOptions());
  const page = await context.newPage();
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/login', { waitUntil: 'networkidle' });

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(
    page.getByRole('heading', {
      name: 'Convierte tu pipeline en decisiones comerciales más claras.',
    }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Bienvenido', exact: true })).toBeVisible();
  await expect(page.getByLabel('Idioma')).toHaveValue('es');
  await expect(page.getByText('Forecast y cumplimiento')).toBeHidden();
  expect(
    await page.evaluate(() => ({
      width: window.innerWidth,
      scrollWidth: document.body.scrollWidth,
    })),
  ).toMatchObject({ width: 390, scrollWidth: 390 });

  await page.evaluate(() => localStorage.setItem('sip-appearance', 'DARK'));
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByLabel('Idioma').selectOption('en');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('heading', { name: 'Welcome', exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('sip-appearance'))).toBe('DARK');

  await page.evaluate(() => localStorage.setItem('sip-appearance', 'LIGHT'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByLabel('Language').selectOption('es');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByLabel('Idioma').selectOption('en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  await page.getByLabel('Email', { exact: true }).fill(adminEmail);
  await page.getByLabel('Password', { exact: true }).fill(adminPassword!);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/app\/dashboard$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Welcome', exact: true })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  const localeCookie = (await context.cookies()).find(({ name }) => name === 'sip_locale');
  expect(localeCookie?.value).toBe('en');
  expect(consoleErrors).toEqual([]);

  await context.close();
});

test('admin can manage a synthetic opportunity', async () => {
  const page = adminPage;
  const title = `E2E staging opportunity ${Date.now()}`;
  const closeDate = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);

  await page.goto('/app/dashboard');
  await expect(page.getByRole('heading', { name: 'Will the team reach quota?' })).toBeVisible();
  await expect(page.getByText('Team quota attainment')).toBeVisible();

  await page.keyboard.press('Control+k');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.getByLabel('Opportunity title', { exact: true }).fill(title);
  await page.getByLabel('Estimated amount', { exact: true }).fill('12500');
  await page.getByLabel('GM %', { exact: true }).fill('20');
  await page.getByLabel('Expected close', { exact: true }).fill(closeDate);
  await page.getByLabel('Description 1', { exact: true }).fill('Synthetic E2E line item');
  await page.getByLabel('Amount 1', { exact: true }).fill('12500');
  await page.getByLabel('Cost 1', { exact: true }).fill('10000');
  await page.getByRole('button', { name: 'Create opportunity' }).click();

  await expect(page).toHaveURL(/\/app\/opportunities\/[0-9a-f-]+$/);
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
  await page
    .getByRole('combobox', { name: 'Stage', exact: true })
    .selectOption({ label: '40% · Qualification' });
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toHaveText('Changes saved.');
  await expect(page.getByText('40% · Qualification').first()).toBeVisible();
  await expect(page.getByText('20.0%').first()).toBeVisible();

  const stage = page.getByRole('combobox', { name: 'Stage', exact: true });
  const category = page.getByRole('combobox', { name: 'Forecast category', exact: true });
  await expect(stage.locator('option[value]').filter({ hasText: '100% · Billed' })).toHaveCount(0);
  await stage.selectOption({ label: '60% · Proposal' });
  await category.selectOption('BEST_CASE');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toHaveText('Opportunity could not be updated.');

  const completeGate = async (code: '60' | '80') => {
    const gate = page.locator(`section[aria-labelledby="gate-${code}"]`);
    const rows = gate.locator(':scope > div.space-y-3 > div');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) {
      const row = rows.nth(index);
      await row.locator('input').fill(`E2E qualification evidence ${code}-${index + 1}`);
      await row.getByRole('combobox').selectOption('YES');
      await expect(gate.getByText(new RegExp(`${index + 1}/${count}`))).toBeVisible();
    }
  };

  await completeGate('60');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toHaveText('Changes saved.');
  await expect(page.getByText('60% · Proposal').first()).toBeVisible();

  await completeGate('80');
  await stage.selectOption({ label: '80% · Negotiation' });
  await category.selectOption('COMMIT');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toHaveText('Changes saved.');
  await expect(page.getByText('80% · Negotiation').first()).toBeVisible();
  await expect(page.getByText(/OPPORTUNITY STAGE CHANGED/).first()).toBeVisible();
});

test('manager drills into the funnel, opens context and closes with Escape', async () => {
  const page = adminPage;
  await page.goto('/app/dashboard');

  const negotiation = page.getByRole('button', { name: /^Negotiation:/ }).first();
  await expect(negotiation).toBeVisible();
  await negotiation.click();
  await expect(page.getByText(/Negotiation · \d+ opportunities/)).toBeVisible();

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

test('funnel semantics stay accessible without horizontal page overflow', async () => {
  const page = adminPage;
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/app/dashboard', { waitUntil: 'networkidle' });

  const scenarios = [
    { width: 390, height: 844, locale: 'es', appearance: 'LIGHT' },
    { width: 390, height: 844, locale: 'es', appearance: 'DARK' },
    { width: 390, height: 844, locale: 'en', appearance: 'LIGHT' },
    { width: 375, height: 812, locale: 'es', appearance: 'LIGHT' },
    { width: 360, height: 800, locale: 'es', appearance: 'LIGHT' },
    { width: 1024, height: 768, locale: 'es', appearance: 'LIGHT' },
    { width: 1440, height: 1024, locale: 'es', appearance: 'LIGHT' },
  ] as const;

  for (const scenario of scenarios) {
    await page.setViewportSize({ width: scenario.width, height: scenario.height });
    const currentLocale = await page.locator('html').getAttribute('lang');
    await page
      .getByLabel(currentLocale === 'es' ? 'Idioma' : 'Language')
      .selectOption(scenario.locale);
    await expect(page.locator('html')).toHaveAttribute('lang', scenario.locale);
    await page.evaluate(
      (appearance) => localStorage.setItem('sip-appearance', appearance),
      scenario.appearance,
    );
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme',
      scenario.appearance.toLowerCase(),
    );

    const widths = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
    }));
    expect(widths.documentWidth).toBeLessThanOrEqual(widths.innerWidth);
    expect(widths.bodyWidth).toBeLessThanOrEqual(widths.innerWidth);
  }

  const semanticTable = page.getByRole('table', { name: 'Datos del embudo de ventas' });
  await expect(semanticTable).toBeAttached();
  await expect(semanticTable.getByRole('row')).toHaveCount(5);
  await expect(
    semanticTable.getByRole('cell', { name: 'Negociación', exact: true }),
  ).toBeAttached();
  expect(
    await semanticTable
      .locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
      .count(),
  ).toBe(0);

  const hiddenContainer = semanticTable.locator('..');
  const hiddenContainerStyles = await hiddenContainer.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      position: style.position,
      width: style.width,
      height: style.height,
      padding: style.padding,
      margin: style.margin,
      overflow: style.overflow,
      clip: style.clip,
      clipPath: style.clipPath,
      whiteSpace: style.whiteSpace,
      borderWidth: style.borderWidth,
    };
  });
  expect(hiddenContainerStyles).toMatchObject({
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0px',
    margin: '-1px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    borderWidth: '0px',
  });
  expect(hiddenContainerStyles.clip !== 'auto' || hiddenContainerStyles.clipPath !== 'none').toBe(
    true,
  );
  await expect
    .poll(async () => hiddenContainer.boundingBox())
    .toMatchObject({ width: 1, height: 1 });

  const negotiation = page.getByRole('button', { name: /^Negociación:/ }).first();
  await negotiation.focus();
  await expect(negotiation).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByText(/Negociación · \d+ oportunidades/)).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.getByText(/Negociación · \d+ oportunidades/)).toBeHidden();

  await page.getByLabel('Apariencia').selectOption('SYSTEM');
  await page.getByLabel('Idioma').selectOption('en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.setViewportSize({ width: 1440, height: 1024 });
});

test('manager review advances only after an explicit decision', async () => {
  const page = adminPage;
  await page.goto('/app/dashboard');
  await page.getByRole('button', { name: 'Forecast review' }).click();
  await expect(
    page.getByText(/classifications change only after an explicit action/i),
  ).toBeVisible();
  const headingBefore = await page.getByRole('heading', { level: 1 }).textContent();
  const keep = page.getByRole('button', { name: 'Keep Commit' });
  await expect(keep).toBeVisible();
  await keep.click();
  await expect(page.getByRole('heading', { level: 1 })).not.toHaveText(headingBefore ?? '');

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

test('critical Copilot and server import contracts block unsafe interaction', async () => {
  const page = adminPage;
  await page.setViewportSize({ width: 1024, height: 768 });
  let requests = 0;
  const intentIds: string[] = [];
  await page.route('**/backend/ai/manager-brief', async (route) => {
    requests += 1;
    const body = route.request().postDataJSON() as { intentId?: string };
    intentIds.push(body.intentId ?? '');
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Synthetic provider failure' }),
    });
  });
  await page.goto('/app/dashboard');

  const launcher = page.locator(
    'button[aria-controls="contextual-copilot-panel"][aria-expanded="false"]',
  );
  await expect(launcher).toBeVisible();
  await launcher.click();
  const panel = page.getByRole('dialog', { name: 'Sales Copilot' });
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
  expect(intentIds).toEqual(['CUSTOM', 'CUSTOM']);
  await expect(panel.getByRole('alert')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(launcher).toBeFocused();

  let executePosts = 0;
  page.on('request', (request) => {
    if (
      request.method() === 'POST' &&
      new URL(request.url()).pathname === '/backend/imports/execute'
    ) {
      executePosts += 1;
    }
  });
  await page.goto('/app/import');

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: 'opportunities.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: Buffer.from('not-an-excel-workbook'),
  });
  await expect(page.getByRole('alert').filter({ hasText: 'could not be analyzed' })).toBeVisible();

  await fileInput.setInputFiles({
    name: 'opportunities.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(
      [
        'Opportunity,Customer,Stage,Amount,Expected close,Brand,Seller email',
        'Synthetic blocked row,Unknown customer,Unknown stage,1000,2026-10-15,Unknown brand,missing@example.test',
      ].join('\n'),
    ),
  });
  await expect(page.getByRole('heading', { name: 'Column mapping confirmation' })).toBeVisible();
  const mappingConfirmations = page.getByRole('checkbox');
  const confirmationCount = await mappingConfirmations.count();
  expect(confirmationCount).toBeGreaterThan(0);
  for (let index = 0; index < confirmationCount; index += 1) {
    await mappingConfirmations.nth(index).check();
  }
  await page.getByRole('button', { name: 'Validate confirmed mapping' }).click();
  await expect(page.getByRole('heading', { name: 'Dry-run validation' })).toBeVisible();
  await expect(page.getByText('BLOCKED', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Execute validated import' })).toBeDisabled();
  expect(executePosts).toBe(0);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/app/dashboard');
  const mobileLauncher = page.locator(
    'button[aria-controls="contextual-copilot-panel"][aria-expanded="false"]',
  );
  await mobileLauncher.click();
  const mobilePanel = page.getByRole('dialog', { name: 'Sales Copilot' });
  await expect(mobilePanel).toBeVisible();
  await expect
    .poll(async () => mobilePanel.boundingBox())
    .toMatchObject({ x: 0, y: 0, width: 390, height: 844 });
  await page.keyboard.press('Escape');
  await expect(mobileLauncher).toBeFocused();

  await page.setViewportSize({ width: 1440, height: 1024 });
  await expect(page.getByRole('region', { name: 'Sales Copilot' })).toBeVisible();
  await page.getByRole('button', { name: 'Forecast review' }).click();
  await expect(page.getByText('System confidence not yet computed').first()).toBeVisible();
});

test('seller completes Focus and advances the Guided queue', async ({ browser }) => {
  test.skip(!sellerEmail || !sellerPassword, 'Seller staging credentials are optional');
  sellerContext = await browser.newContext(browserContextOptions());
  sellerPage = await sellerContext.newPage();
  await signIn(sellerPage, sellerEmail!, sellerPassword!);
  await expect(sellerPage).toHaveURL(/\/app\/dashboard$/);
  const page = sellerPage!;
  await page.goto('/app/dashboard');
  await expect(page.getByText('Not available', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Seller quota is not exposed by the API')).toBeVisible();
  await expect(
    page.getByText('A personal quota is required before a reliable gap can be calculated.'),
  ).toBeVisible();
  await page.getByLabel('Cognitive mode').selectOption('FOCUS');
  await expect(page.getByRole('heading', { name: '3 priorities today' })).toBeVisible();
  const priority = page.getByRole('button', { name: /Complete priority 1/ });
  if ((await priority.count()) > 0) {
    await priority.click();
  } else {
    await expect(page.getByText('Only 0 evidence-backed priorities are available.')).toBeVisible();
  }
  await page.getByRole('button', { name: /Start guided queue/ }).click();
  const recommendation = page.getByRole('button', { name: /Choose recommendation/ });
  if ((await recommendation.count()) > 0) {
    await recommendation.click();
    await expect(page.getByText(/session decisions/)).toBeVisible();
  } else {
    await expect(page.getByRole('heading', { name: 'Guided queue is clear' })).toBeVisible();
  }
});

test('language persists without changing route, theme, mode or session boundaries', async () => {
  const page = adminPage;
  await page.goto('/app/dashboard', { waitUntil: 'networkidle' });
  await page.getByLabel('Appearance').selectOption('DARK');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByLabel('Cognitive mode').selectOption('REVIEW');
  const route = new URL(page.url()).pathname;

  await page.getByLabel('Language').selectOption('es');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page).toHaveURL(new RegExp(`${route}$`));
  await expect(page.getByRole('heading', { name: /Q\d .* \d+ de \d+/ })).toBeVisible();
  await expect(page.getByLabel('Apariencia')).toHaveValue('DARK');
  await expect(page.getByLabel('Modo cognitivo')).toHaveValue('REVIEW');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  const localeCookie = (await page.context().cookies()).find(({ name }) => name === 'sip_locale');
  expect(localeCookie?.value).toBe('es');

  await page.getByLabel('Idioma').selectOption('en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page).toHaveURL(new RegExp(`${route}$`));
  await expect(page.getByLabel('Appearance')).toHaveValue('DARK');
  await expect(page.getByLabel('Cognitive mode')).toHaveValue('REVIEW');
  await page.getByLabel('Language').selectOption('es');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByLabel('Idioma')).toHaveValue('es');
  await expect(page.getByLabel('Apariencia')).toHaveValue('DARK');

  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Bienvenido', exact: true })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');

  await page.goto('/app/dashboard');
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel('Correo electrónico', { exact: true }).fill(adminEmail);
  await page.getByLabel('Contraseña', { exact: true }).fill(adminPassword!);
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(page).toHaveURL(/\/app\/dashboard$/);
  await expect(page.getByRole('heading', { name: '¿Alcanzará el equipo la cuota?' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
});
