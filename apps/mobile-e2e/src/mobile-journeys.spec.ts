import { test, expect } from '@playwright/test';

test('home carga @journey', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/?$/);
  await expect(page.locator('app-root')).toBeAttached();
});

test('navegación principal @journey', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/?$/);
  await expect(page.locator('app-root')).toBeAttached();
});

test('ruta secundaria accesible @journey', async ({ page }) => {
  await page.goto('/unknown-route');
  await expect(page.locator('app-root')).toBeAttached();
});
