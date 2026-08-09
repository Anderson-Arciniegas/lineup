import type { EnvironmentConfig } from './environments';
import { environment, PROD } from './environments';

const REQUIRED_KEYS: (keyof EnvironmentConfig)[] = [
  'production',
  'businessApi',
  'adminApi',
  'userApi',
  'userApiFile',
  'businessApiFile',
  'adminApiFile',
  'google',
  'crypto',
  'publicSiteUrl',
  'notificationsSocketUrl',
];

function assertEnvironmentShape(label: string, env: EnvironmentConfig): void {
  REQUIRED_KEYS.forEach((key) => {
    expect(env[key]).toBeDefined();
  });

  expect(env.google.GOOGLE_ID).toBeTruthy();
  expect(env.google.GOOGLE_MAPS_API_KEY).toBeTruthy();
  expect(env.crypto.seed).toBeTruthy();
  expect(env.crypto.secret).toBeTruthy();
  expect(typeof env.production).toBe('boolean');
  expect(label).toBeTruthy();
}

describe('environments', () => {
  it('environment has required API keys and config', () => {
    assertEnvironmentShape('environment', environment);
  });

  it('PROD has required API keys and config', () => {
    assertEnvironmentShape('PROD', PROD);
    expect(PROD.production).toBe(true);
  });

  it('defaults export matches environment', async () => {
    const mod = await import('./environments');
    expect(mod.default).toEqual(environment);
  });

  it('resolvePublicSiteUrl prefers PUBLIC_SITE_URL', async () => {
    const previous = process.env['PUBLIC_SITE_URL'];
    process.env['PUBLIC_SITE_URL'] = 'https://custom.test/';
    jest.resetModules();
    const { environment: reloaded } = await import('./environments');
    expect(reloaded.publicSiteUrl).toBe('https://custom.test');
    if (previous === undefined) {
      delete process.env['PUBLIC_SITE_URL'];
    } else {
      process.env['PUBLIC_SITE_URL'] = previous;
    }
    jest.resetModules();
  });

  it('resolvePublicSiteUrl falls back when env vars are absent', async () => {
    const keys = ['PUBLIC_SITE_URL', 'URL', 'DEPLOY_PRIME_URL'] as const;
    const saved = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
    keys.forEach((k) => delete process.env[k]);
    jest.resetModules();
    const { environment: reloaded } = await import('./environments');
    expect(reloaded.publicSiteUrl).toBe('https://lineup.com.ve');
    keys.forEach((k) => {
      if (saved[k] === undefined) {
        delete process.env[k];
      } else {
        process.env[k] = saved[k];
      }
    });
    jest.resetModules();
  });
});
