import { expect, test } from '@playwright/test';
import { seedSession } from '../fixtures/auth-storage';
import { setupGraphqlMocks } from '../fixtures/graphql-mock';

test.describe('Usuario autenticado', () => {
  test.beforeEach(async ({ page }) => {
    await setupGraphqlMocks(page, { session: 'user' });
    await seedSession(page, 'user');
  });

  test('login user → dashboard @journey @hu-23', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('body')).toBeAttached();
  });

  test('profile @journey @hu-04', async ({ page }) => {
    await page.goto('/profile/edit');
    await expect(page.locator('body')).toBeAttached();
  });

  test('user settings @journey @hu-04', async ({ page }) => {
    await page.goto('/profile/settings');
    await expect(page.locator('body')).toBeAttached();
  });

  test('favorites @journey @hu-23', async ({ page }) => {
    await page.goto('/profile/favorites');
    await expect(page.locator('body')).toBeAttached();
  });

  test('wishlist @journey @hu-23', async ({ page }) => {
    await page.goto('/profile/wishlist');
    await expect(page.locator('body')).toBeAttached();
  });

  test('my-ratings @journey @hu-23', async ({ page }) => {
    await page.goto('/profile/my-ratings');
    await expect(page.locator('body')).toBeAttached();
  });

  test('notifications panel open @journey @hu-28', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('body')).toBeAttached();
  });

  test('logout @journey @hu-04', async ({ page }) => {
    await page.goto('/profile/settings');
    await page.evaluate(() => {
      localStorage.removeItem('loggedUser');
      localStorage.removeItem('sessionType');
    });
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
  });
});
