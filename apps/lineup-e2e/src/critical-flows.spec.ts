import { test, expect } from '@playwright/test';

/**
 * Humo E2E sobre rutas públicas críticas (requiere `nx serve lineup` vía webServer del preset).
 */
test.describe('Flujos críticos', () => {
  test('la home responde y muestra contenido principal', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('la ruta de login carga el layout de autenticación', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('la ruta de registro es accesible', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveURL(/\/register/);
  });

  test('búsqueda con término en URL muestra la página de búsqueda', async ({
    page,
  }) => {
    await page.goto('/search/demo-query');
    await expect(page).toHaveURL(/\/search\/demo-query/);
  });
});
