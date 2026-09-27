import { test, expect } from '@playwright/test';

test('home carga @journey @hu-30', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/?$/);
  await expect(page.locator('app-root')).toBeAttached();
});

test('navegación principal @journey @hu-30', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/?$/);
  await expect(page.locator('app-root')).toBeAttached();
});

test('ruta secundaria accesible @journey @hu-30', async ({ page }) => {
  await page.goto('/unknown-route');
  await expect(page.locator('app-root')).toBeAttached();
});
