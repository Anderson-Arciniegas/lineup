import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

// Puerto distinto del default de Angular (4200), que suele usar `lineup` en local.
const e2ePort = process.env['MOBILE_E2E_PORT'] || '4202';
const baseURL =
  process.env['BASE_URL'] || `http://localhost:${e2ePort}`;
const isCi = !!process.env['CI'];

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    headless: true,
  },
  /**
   * `mobile-e2e:e2e` declara `dependsOn: ["mobile:build"]` para que en CI no compitan en paralelo
   * `mobile:build` y el `nx serve` del webServer (ECONNREFUSED).
   */
  webServer: {
    command: `npx nx serve mobile --port=${e2ePort}`,
    url: baseURL,
    reuseExistingServer: !isCi,
    cwd: workspaceRoot,
    timeout: isCi ? 300 * 1000 : 120 * 1000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Uncomment for mobile browsers support
    /* {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    }, */

    // Uncomment for branded browsers
    /* {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    } */
  ],
});
