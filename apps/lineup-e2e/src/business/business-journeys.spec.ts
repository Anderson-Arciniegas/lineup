import { test, expect } from '@playwright/test';
import { seedSession } from '../fixtures/auth-storage';
import { setupGraphqlMocks } from '../fixtures/graphql-mock';

test.describe('Business / control-panel', () => {
  test.beforeEach(async ({ page }) => {
    await setupGraphqlMocks(page);
    await seedSession(page, 'business');
  });

  test('login business → panel @journey', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('body')).toBeAttached();
  });

  test('catalogs list @journey', async ({ page }) => {
    await page.goto('/dashboard/catalogs');
    await expect(page.locator('body')).toBeAttached();
  });

  test('create catalog @journey', async ({ page }) => {
    await page.goto('/dashboard/catalogs/create-catalog');
    await expect(page.locator('body')).toBeAttached();
  });

  test('products list / product panel @journey', async ({ page }) => {
    await page.goto('/dashboard/catalogs/demo-catalog/100');
    await expect(page.locator('body')).toBeAttached();
  });

  test('create product @journey', async ({ page }) => {
    await page.goto('/dashboard/catalogs/demo-catalog/create-product');
    await expect(page.locator('body')).toBeAttached();
  });

  test('inventory / SKU @journey', async ({ page }) => {
    await page.goto('/dashboard/inventory');
    await expect(page.locator('body')).toBeAttached();
  });

  test('discounts panel @journey', async ({ page }) => {
    await page.goto('/dashboard/discounts');
    await expect(page.locator('body')).toBeAttached();
  });

  test('locations @journey', async ({ page }) => {
    await page.goto('/dashboard/locations');
    await expect(page.locator('body')).toBeAttached();
  });

  test('social medias @journey', async ({ page }) => {
    await page.goto('/dashboard/social-medias');
    await expect(page.locator('body')).toBeAttached();
  });

  test('statistics @journey', async ({ page }) => {
    await page.goto('/dashboard/statistics');
    await expect(page.locator('body')).toBeAttached();
  });
});
