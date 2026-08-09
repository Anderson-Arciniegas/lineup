/* eslint-disable @nx/enforce-module-boundaries */
import { workspaceRoot } from '@nx/devkit';
import { nxE2EPreset } from '@nx/playwright/preset';
import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env['BASE_URL'] || 'http://127.0.0.1:4200';
const isCi = !!process.env['CI'];

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  timeout: 45_000,
  expect: { timeout: 12_000 },
  fullyParallel: false,
  workers: 1,
  retries: isCi ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    headless: true,
    navigationTimeout: 20_000,
    actionTimeout: 12_000,
  },
  webServer: {
    command:
      'node scripts/e2e-static-server.mjs dist/apps/lineup/browser 4200',
    url: 'http://127.0.0.1:4200',
    reuseExistingServer: !isCi,
    cwd: workspaceRoot,
    timeout: 60_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
