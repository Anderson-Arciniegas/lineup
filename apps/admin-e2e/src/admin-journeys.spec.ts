import { test, expect, type Page } from '@playwright/test';

async function seedAdminSession(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('loggedAdmin', JSON.stringify(true));
    localStorage.setItem('adminSessionType', JSON.stringify('user'));
  });
}

async function mockAdminGraphql(page: Page): Promise<void> {
  await page.route('**/api/admin', async (route) => {
    const body = route.request().postDataJSON?.() ?? {};
    const op = body.operationName ?? '';
    const data: Record<string, unknown> = {
      adminMe: { id: 1, email: 'admin@test.com' },
      adminDashboardStats: { users: 0, businesses: 0 },
      findAllUsers: { items: [], total: 0, page: 1, limit: 20 },
      findAllBusinesses: { items: [], total: 0, page: 1, limit: 20 },
      getAllRoles: [],
      findAllSocialNetworks: { items: [], total: 0 },
    };
    if (op === 'AdminMe' || op === 'getMe') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { adminMe: data['adminMe'] } }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data }),
    });
  });
}

test('login page carga @journey @hu-26', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('app-admin')).toBeAttached();
});

test('post-login shell visible @journey @hu-27', async ({ page }) => {
  await mockAdminGraphql(page);
  await seedAdminSession(page);
  await page.goto('/dashboard');
  await expect(page.locator('app-admin')).toBeAttached();
});

test('listado usuarios admin @journey @hu-26', async ({ page }) => {
  await mockAdminGraphql(page);
  await seedAdminSession(page);
  await page.goto('/users');
  await expect(page.locator('app-admin')).toBeAttached();
});

test('listado negocios admin @journey @hu-26', async ({ page }) => {
  await mockAdminGraphql(page);
  await seedAdminSession(page);
  await page.goto('/businesses');
  await expect(page.locator('app-admin')).toBeAttached();
});

test('stats admin @journey @hu-27', async ({ page }) => {
  await mockAdminGraphql(page);
  await seedAdminSession(page);
  await page.goto('/stats');
  await expect(page.locator('app-admin')).toBeAttached();
});

test('roles admin @journey @hu-27', async ({ page }) => {
  await mockAdminGraphql(page);
  await seedAdminSession(page);
  await page.goto('/roles');
  await expect(page.locator('app-admin')).toBeAttached();
});

test('social networks admin @journey @hu-27', async ({ page }) => {
  await mockAdminGraphql(page);
  await seedAdminSession(page);
  await page.goto('/social-networks');
  await expect(page.locator('app-admin')).toBeAttached();
});

test('logout o sesión inválida @journey @hu-26', async ({ page }) => {
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
