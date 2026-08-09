import { test, expect } from '@playwright/test';
import { setupGraphqlMocks } from '../fixtures/graphql-mock';

test.describe('Público', () => {
  test.beforeEach(async ({ page }) => {
    await setupGraphqlMocks(page);
  });

  test('home/landing carga contenido principal @journey', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeAttached();
  });

  test('login muestra layout de autenticación @journey', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
  });

  test('register account-type accesible @journey', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveURL(/\/register/);
  });

  test('register user formulario visible @journey', async ({ page }) => {
    await page.goto('/register/user');
    await expect(page).toHaveURL(/\/register\/user/);
  });

  test('register business formulario visible @journey', async ({ page }) => {
    await page.goto('/register/business');
    await expect(page).toHaveURL(/\/register\/business/);
  });

  test('search con término en URL @journey', async ({ page }) => {
    await page.goto('/search/demo-query');
    await expect(page).toHaveURL(/\/search\/demo-query/);
  });

  test('business page por path @journey', async ({ page }) => {
    await page.goto('/demo-business');
    await expect(page).toHaveURL(/\/demo-business/);
  });

  test('catalog page @journey', async ({ page }) => {
    await page.goto('/demo-business/demo-catalog');
    await expect(page).toHaveURL(/\/demo-business\/demo-catalog/);
  });

  test('product page @journey', async ({ page }) => {
    await page.goto('/demo-business/demo-catalog/100');
    await expect(page).toHaveURL(/\/demo-business\/demo-catalog\/100/);
  });

  test('privacy policy @journey', async ({ page }) => {
    await page.goto('/info/politica-de-privacidad');
    await expect(page).toHaveURL(/politica-de-privacidad/);
  });

  test('terms and conditions @journey', async ({ page }) => {
    await page.goto('/info/terminos-y-condiciones');
    await expect(page).toHaveURL(/terminos-y-condiciones/);
  });

  test('catalog download vista @journey', async ({ page }) => {
    await page.goto('/demo-business/demo-catalog/download');
    await expect(page).toHaveURL(/\/download/);
  });
});
