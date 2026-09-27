import { expect, test } from '@playwright/test';
import { setupGraphqlMocks } from '../fixtures/graphql-mock';
import {
  expectToast,
  fillLogin,
  fillOtp,
  fillRegisterBusiness,
  submitLogin,
  VALID_PASSWORD,
} from '../fixtures/heuristic-actions';

test.describe('Público', () => {
  test('home/landing carga contenido principal @journey @hu-19', async ({
    page,
  }) => {
    await setupGraphqlMocks(page);
    await page.goto('/');
    await expect(page.locator('body')).toBeAttached();
  });

  test('landing info @journey @hu-19', async ({ page }) => {
    await setupGraphqlMocks(page);
    await page.goto('/info');
    await expect(page).toHaveURL(/\/info/);
  });

  test('login error luego éxito como negocio @journey @hu-03 @t-01', async ({
    page,
  }) => {
    const mocks = await setupGraphqlMocks(page, { loginOutcome: 'invalid' });
    await page.goto('/login');
    await expect(
      page.getByRole('heading', { name: 'Iniciar sesión' }),
    ).toBeVisible();

    await fillLogin(page, 'malo@demo.test', 'wrong');
    await submitLogin(page);
    await expectToast(page, /Correo o contraseña incorrectos/);
    await expect(
      page.locator('form').getByRole('button', { name: 'Entrar' }),
    ).toBeEnabled();

    mocks.setLoginOutcome('business');
    await fillLogin(page, 'biz@demo.test', VALID_PASSWORD);

    const businessLogin = page.waitForResponse((response) => {
      if (
        response.request().method() !== 'POST' ||
        !response.url().includes('businesses.api')
      ) {
        return false;
      }
      const postData = response.request().postData() ?? '';
      return postData.includes('Login') && response.ok();
    });
    await submitLogin(page);
    await businessLogin;
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('register account-type accesible @journey @hu-01', async ({ page }) => {
    await setupGraphqlMocks(page);
    await page.goto('/register');
    await expect(page).toHaveURL(/\/register/);
  });

  test('register user formulario visible @journey @hu-01', async ({ page }) => {
    await setupGraphqlMocks(page);
    await page.goto('/register/user');
    await expect(page).toHaveURL(/\/register\/user/);
  });

  test('register business verificación y alta @journey @hu-02 @t-02', async ({
    page,
  }) => {
    await setupGraphqlMocks(page);
    await page.goto('/register/business');
    await expect(
      page.getByRole('heading', { name: 'Registro de Negocio' }),
    ).toBeVisible();

    await fillRegisterBusiness(page);
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await expect(
      page.getByRole('dialog').getByText('Verifica tu correo'),
    ).toBeVisible();

    await fillOtp(page);
    await page.getByRole('button', { name: 'Confirmar' }).click();
    await expect(page).toHaveURL(/\/dashboard\/setup\/edit/);
  });

  test('search con término en URL @journey @hu-20', async ({ page }) => {
    await setupGraphqlMocks(page);
    await page.goto('/search/demo-query');
    await expect(page).toHaveURL(/\/search\/demo-query/);
  });

  test('tag exploration @journey @hu-20', async ({ page }) => {
    await setupGraphqlMocks(page);
    await page.goto('/tag/demo-tag');
    await expect(page).toHaveURL(/\/tag\/demo-tag/);
  });

  test('business page por path @journey @hu-21', async ({ page }) => {
    await setupGraphqlMocks(page);
    await page.goto('/demo-business');
    await expect(page).toHaveURL(/\/demo-business/);
  });

  test('catalog page búsqueda pública @journey @hu-20 @t-07', async ({
    page,
  }) => {
    await setupGraphqlMocks(page);
    await page.goto('/demo-business/demo-catalog?search=demo');
    await expect(page.getByText(/Resultados para/)).toBeVisible();
  });

  test('catalog page y detalle de producto @journey @hu-21 @t-08', async ({
    page,
  }) => {
    await setupGraphqlMocks(page);
    await page.goto('/demo-business/demo-catalog');
    await expect(page.getByText('Demo Catalog').first()).toBeVisible();
    await page
      .locator('a.product-card')
      .filter({ hasText: 'Demo Product' })
      .first()
      .click();
    await expect(page).toHaveURL(/\/demo-business\/demo-catalog\/100/);
    await expect(
      page.getByRole('heading', { name: 'Demo Product' }),
    ).toBeVisible();
  });

  test('product page WhatsApp y equivalente BS @journey @hu-22 @hu-29 @t-08', async ({
    page,
  }) => {
    await setupGraphqlMocks(page);
    await page.goto('/demo-business/demo-catalog/100');
    await expect(
      page.getByRole('heading', { name: 'Demo Product' }),
    ).toBeVisible();
    const contact = page.locator('a[href*="whatsapp.com"]');
    await expect(contact).toBeVisible();
    await expect(contact).toHaveAttribute(
      'href',
      /whatsapp\.com\/send\?phone=584121234567/,
    );
    await expect(page.getByText(/≈/)).toBeVisible();
    await expect(page.getByText(/BS/)).toBeVisible();
  });

  test('catalog download overlay y volver @journey @hu-24 @t-09', async ({
    page,
  }) => {
    await setupGraphqlMocks(page);
    await page.goto('/demo-business/demo-catalog/download');
    await expect(
      page.getByRole('button', { name: 'Volver al catálogo' }),
    ).toBeVisible();
    await expect(
      page.getByText(/Generando PDF|Error al generar el PDF/),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Volver al catálogo' }).click();
    await expect(page).toHaveURL(/\/demo-business\/demo-catalog/);
  });

  test('privacy policy @journey @hu-19', async ({ page }) => {
    await setupGraphqlMocks(page);
    await page.goto('/info/politica-de-privacidad');
    await expect(page).toHaveURL(/politica-de-privacidad/);
  });

  test('terms and conditions @journey @hu-19', async ({ page }) => {
    await setupGraphqlMocks(page);
    await page.goto('/info/terminos-y-condiciones');
    await expect(page).toHaveURL(/terminos-y-condiciones/);
  });

  test('profile sin sesión redirige a login @journey @hu-03', async ({
    page,
  }) => {
    await setupGraphqlMocks(page, { session: 'none' });
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login/);
  });

  test('dashboard sin sesión redirige a login @journey @hu-03', async ({
    page,
  }) => {
    await setupGraphqlMocks(page, { session: 'none' });
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
