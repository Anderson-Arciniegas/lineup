jest.mock('@angular/common/locales/es', () => []);

import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { SEO_SITE_ORIGIN } from '@lineup/core';
import { environment } from '@lineup/envs';
import { appConfig } from './app.config';

function findSeoOriginProvider(
  providers: NonNullable<typeof appConfig.providers>,
): { useValue: string | undefined } | undefined {
  return providers.find(
    (provider): provider is { provide: typeof SEO_SITE_ORIGIN; useValue: string | undefined } =>
      typeof provider === 'object' &&
      provider !== null &&
      'provide' in provider &&
      provider.provide === SEO_SITE_ORIGIN,
  );
}

describe('admin appConfig', () => {
  it('registers application providers including Apollo clients', () => {
    TestBed.configureTestingModule({
      providers: [...(appConfig.providers ?? []), provideHttpClient()],
    });
    expect(appConfig.providers?.length).toBeGreaterThan(5);
  });

  it('SEO_SITE_ORIGIN provider normalizes publicSiteUrl', () => {
    const provider = findSeoOriginProvider(appConfig.providers ?? []);
    expect(provider?.useValue).toBe(
      environment.publicSiteUrl?.replace(/\/$/, '').trim() || undefined,
    );
  });

  it('SEO_SITE_ORIGIN provider is undefined without publicSiteUrl', async () => {
    jest.resetModules();
    jest.doMock('@lineup/envs', () => ({
      environment: { publicSiteUrl: '' },
    }));
    const { appConfig: reloadedConfig } = await import('./app.config');
    const provider = findSeoOriginProvider(reloadedConfig.providers ?? []);
    expect(provider?.useValue).toBeUndefined();
  });
});
