import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

const pages = [
  '/',
  '/en/',
  '/contratar/',
  '/en/hire/',
  '/proyectos/the-nightbounds/',
  '/en/projects/voxelnest/',
  '/404.html',
];

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  return errors;
}

for (const path of pages) {
  test(`${path} renders without errors or accessibility violations`, async ({ page }) => {
    test.setTimeout(120_000);
    const errors = trackErrors(page);
    const response = await page.goto(`${path}?quality=low`);
    expect(response?.ok() || path === '/404.html').toBe(true);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toBeVisible();
    const results = await new AxeBuilder({ page }).exclude('.experience-canvas').analyze();
    expect(results.violations.map((violation) => violation.id)).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('the language switch keeps the current chapter', async ({ page }) => {
  await page.goto('/?quality=low#voxelnest');
  const english = page.locator('[data-language-link="en"]');
  await expect(english).toHaveAttribute('href', '/en/#voxelnest');
  await english.click();
  await expect(page).toHaveURL(/\/en\/#voxelnest$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('a project card opens an accessible sheet that closes with Escape', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = trackErrors(page);
  await page.goto('/?quality=low');
  const trigger = page.locator('.archive-item__open').first();
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  const sheet = page.getByRole('dialog', { name: 'Apangora' });
  await expect(sheet).toBeVisible();
  await expect(sheet.locator('.gallery__item')).toHaveCount(4);
  const results = await new AxeBuilder({ page }).include('#sheet-apangora').analyze();
  expect(results.violations.map((violation) => violation.id)).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(sheet).toBeHidden();
  await expect(trigger).toBeFocused();
  expect(errors).toEqual([]);
});

test('dragging the 3D view does not select the chapter text', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Mouse drag only');
  test.setTimeout(120_000);
  await page.goto('/?quality=low#sobre-mi');
  await expect(page.locator('[data-loader]')).toHaveAttribute('data-state', 'complete', {
    timeout: 90_000,
  });
  const viewport = page.viewportSize() ?? { width: 1280, height: 720 };
  await page.mouse.move(viewport.width * 0.8, viewport.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(viewport.width * 0.05, viewport.height * 0.4, { steps: 12 });
  await page.mouse.up();
  expect(await page.evaluate('String(getSelection() ?? "")')).toBe('');
});

test('the index opens as a popover and closes with Escape', async ({ page }) => {
  await page.goto('/contratar/');
  await page.locator('.menu-toggle').click();
  const menu = page.locator('#site-menu');
  await expect(menu).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
});

test('the hiring form validates steps and summarizes prices', async ({ page }) => {
  await page.goto('/contratar/');
  const next = page.locator('[data-hire-next]');
  await next.click();
  await expect(page.locator('[data-error-for="services"]')).not.toBeEmpty();

  await page.locator('input[name="services"][value="web-3d-experience"]').check();
  await next.click();
  await expect(page.locator('[data-field="designStatus"]')).toBeVisible();
  await expect(page.locator('[data-field="platforms"]')).toBeHidden();

  await page.locator('#field-projectType').selectOption('new');
  await page
    .locator('#field-description')
    .fill(
      'Experiencia web 3D para presentar una colección de arte digital con recorrido interactivo.',
    );
  await page.locator('input[name="designStatus"][value="none"]').check();
  await next.click();
  await expect(page.locator('[data-add-service]')).toBeVisible();
  await page.locator('[data-add-service]').click();
  await next.click();

  await page.locator('#field-budget').selectOption('5000-10000');
  await page.locator('#field-timeline').selectOption('1-3-months');
  await next.click();
  await page.locator('#field-name').fill('Estudio Prueba');
  await page.locator('#field-email').fill('hola@example.com');
  await page.locator('#field-consent').check();
  await next.click();

  const summary = page.locator('[data-hire-summary]');
  await expect(summary).toContainText('6.800 USD');
  await expect(summary).toContainText('Diseño de experiencia web');
  await expect(page.locator('[data-hire-submit]')).toBeEnabled();
  await expect(page.locator('[data-hire-submit]')).toHaveText('Enviar por correo');
  await page.locator('[data-hire-submit]').click();
  const fallback = page.locator('[data-hire-fallback]');
  await expect(fallback).toBeVisible();
  await expect(fallback.locator('textarea')).toHaveValue(/Experiencia web 3D/);
  await expect(page.locator('[data-hire-status]')).toContainText('@');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('content stays readable and the loader stays out of the way', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-loader]')).toBeHidden();
    await expect(page.locator('#sobre-mi p').first()).toBeVisible();
  });
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('skips the custom cursor', async ({ page }) => {
    await page.goto('/contratar/');
    await expect(page.locator('.cursor')).toHaveCount(0);
  });
});
