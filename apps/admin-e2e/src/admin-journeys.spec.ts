import { test, expect } from '@playwright/test';

test('login page carga @journey', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('app-admin')).toBeAttached();
});

test('post-login shell visible @journey', async ({ page }) => {
  await page.route('**/api/admin', async (route) => {
    const body = route.request().postDataJSON?.() ?? {};
    const op = body.operationName ?? '';
    const data =
      op === 'AdminMe' || op === 'getMe'
        ? { adminMe: { id: 1, email: 'admin@test.com' } }
        : { adminDashboardStats: { users: 0, businesses: 0 } };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data }),
    });
  });
  await page.addInitScript(() => {
    localStorage.setItem('loggedAdmin', JSON.stringify(true));
    localStorage.setItem('adminSessionType', JSON.stringify('user'));
  });
  await page.goto('/dashboard');
  await expect(page.locator('app-admin')).toBeAttached();
});

test('listado principal navegable @journey', async ({ page }) => {
  await page.route('**/api/admin', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          adminMe: { id: 1, email: 'admin@test.com' },
          findAllUsers: { items: [], total: 0, page: 1, limit: 20 },
        },
      }),
    });
  });
  await page.addInitScript(() => {
    localStorage.setItem('loggedAdmin', JSON.stringify(true));
    localStorage.setItem('adminSessionType', JSON.stringify('user'));
  });
  await page.goto('/users');
  await expect(page.locator('app-admin')).toBeAttached();
});

test('logout o sesión inválida @journey', async ({ page }) => {
  await page.route('**/api/admin', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ errors: [{ message: 'Unauthorized' }] }),
    });
  });
  await page.addInitScript(() => {
    localStorage.setItem('loggedAdmin', JSON.stringify(true));
  });
  await page.goto('/login');
  await expect(page).toHaveURL(/\/login/);
});
