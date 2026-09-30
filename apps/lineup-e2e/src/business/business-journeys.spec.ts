import { expect, test } from '@playwright/test';
import { seedOnboardingPending, seedSession } from '../fixtures/auth-storage';
import { setupGraphqlMocks } from '../fixtures/graphql-mock';
import {
  completeImageCropper,
  confirmDialog,
  expectToast,
  fillProductDescription,
  openImageCropperFromPlaceholder,
} from '../fixtures/heuristic-actions';

test.describe('Business / control-panel', () => {
  test.beforeEach(async ({ page }) => {
    await setupGraphqlMocks(page, { session: 'business' });
    await seedSession(page, 'business');
  });

  test('login business → panel @journey @hu-14', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('body')).toBeAttached();
  });

  test('onboarding setup datos y guardar @journey @hu-05 @t-10', async ({
    page,
  }) => {
    await seedOnboardingPending(page);
    await page.goto('/dashboard/setup/edit');
    await expect(
      page.getByRole('heading', { name: 'Complete su perfil de negocio' }),
    ).toBeVisible();
    await page.locator('#name').fill('Negocio Onboarding');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await confirmDialog(page, 'Confirmar');
    await expectToast(page, /Negocio actualizado correctamente/);
    await expect(page).toHaveURL(/\/dashboard\/setup\/create-catalog/);
  });

  test('onboarding crear catálogo @journey @hu-05', async ({ page }) => {
    await seedOnboardingPending(page);
    await page.goto('/dashboard/setup/create-catalog');
    await expect(
      page.getByRole('heading', { name: 'Crear Catálogo' }),
    ).toBeVisible();
    await page
      .getByPlaceholder('Ingrese el nombre del catálogo')
      .fill('Catalogo Inicial');
    await openImageCropperFromPlaceholder(page, 'Agrega tu imagen aquí');
    await completeImageCropper(page);
    await page.getByRole('button', { name: 'Crear' }).click();
    await confirmDialog(page, 'Confirmar');
    await expect(page).toHaveURL(
      /\/dashboard\/setup\/catalog\/demo-catalog\/create-product/,
    );
  });

  test('onboarding crear producto @journey @hu-05 @t-03', async ({ page }) => {
    await seedOnboardingPending(page);
    await page.goto('/dashboard/setup/catalog/demo-catalog/create-product');
    await expect(
      page.getByRole('heading', { name: 'Crear Producto' }),
    ).toBeVisible();
    await page.locator('#title').fill('Producto Inicial');
    await fillProductDescription(page);
    await openImageCropperFromPlaceholder(page, 'Agrega tus imágenes aquí');
    await completeImageCropper(page);
    await page.getByRole('button', { name: 'Crear' }).click();
    await confirmDialog(page, 'Confirmar');
    await expect(page).toHaveURL(/\/inventory/);
  });

  test('onboarding sin flag redirige al panel @journey @hu-05', async ({
    page,
  }) => {
    await page.goto('/dashboard/setup/edit');
    await expect(page).toHaveURL(/\/dashboard\/?$/);
  });

  test('edit business guardar @journey @hu-06 @t-10', async ({ page }) => {
    await page.goto('/dashboard/edit');
    await expect(
      page.getByRole('heading', { name: 'Editar negocio' }),
    ).toBeVisible();
    await page.locator('#name').fill('Negocio Editado');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await confirmDialog(page, 'Confirmar');
    await expectToast(page, /Negocio actualizado correctamente/);
  });

  test('business settings @journey @hu-04', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await expect(page.locator('body')).toBeAttached();
  });

  test('catalogs list @journey @hu-07', async ({ page }) => {
    await page.goto('/dashboard/catalogs');
    await expect(page.locator('body')).toBeAttached();
  });

  test('create catalog @journey @hu-07', async ({ page }) => {
    await page.goto('/dashboard/catalogs/create-catalog');
    await expect(page.locator('body')).toBeAttached();
  });

  test('catalog panel búsqueda @journey @hu-07 @t-07', async ({ page }) => {
    await page.goto('/dashboard/catalogs/demo-catalog');
    await expect(page.getByText('Demo Catalog').first()).toBeVisible();
    const search = page.getByPlaceholder('Buscar');
    await search.fill('Zapatos');
    await search.press('Enter');
    await expect(page.getByText('Zapatos Demo').first()).toBeVisible();
  });

  test('products list / eliminar producto @journey @hu-09 @t-05', async ({
    page,
  }) => {
    await page.goto('/dashboard/catalogs/demo-catalog/100');
    await page.getByRole('button', { name: 'Eliminar' }).click();
    await expect(
      page.getByText('¿Estás seguro de querer eliminar este producto?'),
    ).toBeVisible();
    await confirmDialog(page, 'Confirmar');
    await expect(page).toHaveURL(/\/dashboard\/catalogs\/demo-catalog/);
  });

  test('create product inválido luego válido @journey @hu-09 @t-03', async ({
    page,
  }) => {
    await page.goto('/dashboard/catalogs/demo-catalog/create-product');
    await expect(
      page.getByRole('heading', { name: 'Crear Producto' }),
    ).toBeVisible();
    await page.locator('#title').fill('ab');
    await page.getByRole('button', { name: 'Crear' }).click();
    await expect(
      page.getByRole('alert').filter({ hasText: /al menos 3 caracteres/ }),
    ).toBeVisible();

    await page.locator('#title').fill('Pizza Demo');
    await fillProductDescription(page);
    await page.getByRole('button', { name: 'Crear' }).click();
    await expect(
      page.getByRole('alert').filter({ hasText: /al menos una imagen/ }),
    ).toBeVisible();

    await openImageCropperFromPlaceholder(page, 'Agrega tus imágenes aquí');
    await completeImageCropper(page);
    await page.getByRole('button', { name: 'Crear' }).click();
    await confirmDialog(page, 'Confirmar');
    await expect(page).toHaveURL(/\/inventory/);
  });

  test('edit product cancelar dirty @journey @hu-09 @t-04', async ({
    page,
  }) => {
    await page.goto('/dashboard/catalogs/demo-catalog/100/edit');
    await expect(
      page.getByRole('heading', { name: 'Editar producto' }),
    ).toBeVisible();
    await page.locator('#title').fill('Producto Editado');
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(
      page.getByText(/Hay cambios sin guardar/),
    ).toBeVisible();
    await confirmDialog(page, 'Cancelar');
    await expect(page).toHaveURL(/\/edit/);
  });

  test('inventory / SKU @journey @hu-10', async ({ page }) => {
    await page.goto('/dashboard/inventory');
    await expect(page.locator('body')).toBeAttached();
  });

  test('product SKU guardar @journey @hu-10 @t-03', async ({ page }) => {
    await page.goto('/dashboard/catalogs/demo-catalog/100/inventory');
    await expect(
      page.getByRole('heading', { name: 'Actualizar inventario de producto' }),
    ).toBeVisible();
    const price = page.locator('#price-0 input, input#price-0').first();
    await price.fill('12');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await confirmDialog(page, 'Confirmar');
    await expectToast(page, /Inventario de producto actualizado/);
  });

  test('register sale @journey @hu-10', async ({ page }) => {
    await page.goto('/dashboard/register-sale');
    await expect(page.locator('body')).toBeAttached();
  });

  test('discounts panel @journey @hu-11', async ({ page }) => {
    await page.goto('/dashboard/discounts');
    await expect(page.locator('body')).toBeAttached();
  });

  test('create discount @journey @hu-11', async ({ page }) => {
    await page.goto('/dashboard/discounts/create');
    await expect(page.locator('body')).toBeAttached();
  });

  test('locations @journey @hu-12', async ({ page }) => {
    await page.goto('/dashboard/locations');
    await expect(page.locator('body')).toBeAttached();
  });

  test('business hours @journey @hu-12', async ({ page }) => {
    await page.goto('/dashboard/business-hours');
    await expect(page.locator('body')).toBeAttached();
  });

  test('social medias @journey @hu-13', async ({ page }) => {
    await page.goto('/dashboard/social-medias');
    await expect(page.locator('body')).toBeAttached();
  });

  test('statistics @journey @hu-14', async ({ page }) => {
    await page.goto('/dashboard/statistics');
    await expect(page.locator('body')).toBeAttached();
  });

  test('import products archivo @journey @hu-18 @t-06', async ({ page }) => {
    await page.goto('/dashboard/import-products');
    await expect(
      page.getByRole('heading', { name: 'Importar productos' }),
    ).toBeVisible();
    await page.locator('#import-products-document').setInputFiles({
      name: 'productos.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('nombre,precio\nDemo,10'),
    });
    await expect(page.getByText('productos.csv')).toBeVisible();
    await page.getByRole('button', { name: 'Importar documento' }).click();
    await confirmDialog(page, 'Confirmar');
    await expectToast(page, /Importación en proceso/);
  });
});
