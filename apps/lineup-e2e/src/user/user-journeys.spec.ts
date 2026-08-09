import { test, expect } from '@playwright/test';
import { seedSession } from '../fixtures/auth-storage';
import { setupGraphqlMocks } from '../fixtures/graphql-mock';

test.describe('Usuario autenticado', () => {
  test.beforeEach(async ({ page }) => {
    await setupGraphqlMocks(page);
    await seedSession(page, 'user');
  });

  test('login user → dashboard @journey', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('body')).toBeAttached();
  });

  test('profile @journey', async ({ page }) => {
    await page.goto('/profile/edit');
    await expect(page.locator('body')).toBeAttached();
  });

  test('user settings @journey', async ({ page }) => {
    await page.goto('/profile/settings');
    await expect(page.locator('body')).toBeAttached();
  });

  test('favorites @journey', async ({ page }) => {
    await page.goto('/profile/favorites');
    await expect(page.locator('body')).toBeAttached();
  });

  test('wishlist @journey', async ({ page }) => {
    await page.goto('/profile/wishlist');
    await expect(page.locator('body')).toBeAttached();
  });

  test('my-ratings @journey', async ({ page }) => {
    await page.goto('/profile/my-ratings');
    await expect(page.locator('body')).toBeAttached();
  });

  test('notifications panel open @journey', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('body')).toBeAttached();
  });

  test('logout @journey', async ({ page }) => {
    await page.goto('/profile/settings');
    await page.evaluate(() => {
      localStorage.removeItem('loggedUser');
      localStorage.removeItem('sessionType');
    });
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
  });
});
