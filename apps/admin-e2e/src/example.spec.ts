import { test, expect } from '@playwright/test';

test('carga la app admin y muestra el login', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('admin');
  await expect(page.locator('app-admin')).toBeVisible();
  await expect(page.locator('#admin-email')).toBeVisible();
});
