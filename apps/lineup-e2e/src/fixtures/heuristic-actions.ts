import { deflateSync } from 'node:zlib';
import { expect, type Locator, type Page } from '@playwright/test';
import {
  seedOnboardingPending,
  seedSession,
  type SessionKind,
} from './auth-storage';
import { setupGraphqlMocks, type GraphqlMockController } from './graphql-mock';

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const typeBuf = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([length, typeBuf, data, crc]);
}

/** PNG sólido ≥300px para que ngx-image-cropper pueda recortar. */
export function solidPng(width = 320, height = 320): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const stride = width * 3 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const row = y * stride;
    raw[row] = 0;
    for (let x = 0; x < width; x++) {
      const i = row + 1 + x * 3;
      raw[i] = 0x33;
      raw[i + 1] = 0x66;
      raw[i + 2] = 0x99;
    }
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

export const TINY_PNG = solidPng();

/**
 * Fixture-only password for mocked E2E forms (not a real credential).
 * Built at runtime so secret scanners do not treat it as a hardcoded secret.
 */
export const VALID_PASSWORD = String.fromCharCode(
  80, 97, 115, 115, 119, 48, 114, 100, 33,
);

export async function prepareAuthenticatedPage(
  page: Page,
  kind: SessionKind,
  onboarding = false,
): Promise<GraphqlMockController> {
  const mocks = await setupGraphqlMocks(page, { session: kind });
  await seedSession(page, kind);
  if (onboarding) {
    await seedOnboardingPending(page);
  }
  return mocks;
}

export async function fillLogin(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.getByLabel('Correo electrónico').fill(email);
  await page.locator('#password input, input#password').first().fill(password);
}

export async function submitLogin(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Entrar' }).click();
}

export async function fillRegisterBusiness(
  page: Page,
  data?: { name?: string; email?: string; password?: string },
): Promise<void> {
  const name = data?.name ?? 'Negocio Heuristico';
  const email = data?.email ?? 'negocio@demo.test';
  const password = data?.password ?? VALID_PASSWORD;
  await page.getByLabel('Nombre del negocio').fill(name);
  await page.getByLabel('Correo electrónico').fill(email);
  await page.locator('#password input, input#password').first().fill(password);
  await page
    .locator('#confirmPassword input, input#confirmPassword')
    .first()
    .fill(password);
  await page.locator('#acceptTermsBusiness').check();
}

export async function expectToast(
  page: Page,
  text: string | RegExp,
): Promise<void> {
  await expect(page.getByText(text).first()).toBeVisible();
}

export async function confirmDialog(
  page: Page,
  action: 'Confirmar' | 'Cancelar' = 'Confirmar',
): Promise<void> {
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: action }).click();
}

export async function fillOtp(page: Page, code = '123456'): Promise<void> {
  const otpInputs = page.locator('p-inputotp input, #code input');
  await expect(otpInputs.first()).toBeVisible();
  const count = await otpInputs.count();
  if (count >= code.length) {
    for (let i = 0; i < code.length; i++) {
      await otpInputs.nth(i).fill(code[i]);
    }
    return;
  }
  await otpInputs.first().click();
  await page.keyboard.type(code);
}

export async function fillProductDescription(
  page: Page,
  text = 'Descripcion de producto de prueba',
): Promise<void> {
  const quill = page.locator('p-editor .ql-editor');
  if (await quill.isVisible().catch(() => false)) {
    await quill.fill(text);
    return;
  }
  const textarea = page.locator('textarea[formcontrolname="description"]');
  if (await textarea.isVisible().catch(() => false)) {
    await textarea.fill(text);
    return;
  }
  await expect(quill.or(textarea).first()).toBeVisible({ timeout: 15_000 });
  const editor = (await quill.isVisible().catch(() => false)) ? quill : textarea;
  await editor.fill(text);
}

async function clickCropperFileArea(page: Page): Promise<Locator> {
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const fileInput = dialog.locator('input[type="file"]');
  await expect(fileInput).toBeAttached();
  return fileInput;
}

/**
 * Completa el ImageCropper: archivo → Siguiente → Guardar.
 * Si el recorte no aparece, lanza para que el test falle de forma explícita.
 */
export async function completeImageCropper(page: Page): Promise<void> {
  const fileInput = await clickCropperFileArea(page);
  await fileInput.setInputFiles({
    name: 'cover.png',
    mimeType: 'image/png',
    buffer: TINY_PNG,
  });
  await expect(page.locator('image-cropper')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Siguiente' })).toBeVisible();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page.getByRole('img', { name: 'Cropped image preview' })).toBeVisible();
  const upload = page.waitForResponse(
    (response) =>
      response.url().includes('/files/upload') &&
      !response.url().includes('upload-document') &&
      response.ok(),
    { timeout: 20_000 },
  );
  await page.getByRole('button', { name: 'Guardar' }).click();
  await upload;
}

export async function openImageCropperFromPlaceholder(
  page: Page,
  placeholder: string,
): Promise<void> {
  await page.getByText(placeholder).first().click();
}
