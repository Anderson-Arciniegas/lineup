import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { AppConfigService, StorageService } from '@lineup/core';
import { BusinessOnboardingGuard } from './business-onboarding.guard';

describe('BusinessOnboardingGuard', () => {
  let createUrlTree: jest.Mock;
  let storageGet: jest.Mock;

  beforeEach(() => {
    createUrlTree = jest.fn(
      (commands: unknown[]) => ({ commands } as unknown as UrlTree),
    );
    storageGet = jest.fn();
  });

  function runGuard(platformId: object = 'browser') {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: platformId },
        {
          provide: StorageService,
          useValue: { get: storageGet },
        },
        { provide: Router, useValue: { createUrlTree } },
      ],
    });

    return TestBed.runInInjectionContext(() =>
      BusinessOnboardingGuard({} as never, {} as never),
    );
  }

  it('debe permitir acceso si onboarding está pendiente', () => {
    storageGet.mockReturnValue(true);
    const result = runGuard();
    expect(result).toBe(true);
    expect(storageGet).toHaveBeenCalledWith('businessOnboardingPending');
  });

  it('debe redirigir al dashboard si no hay onboarding pendiente', () => {
    storageGet.mockReturnValue(null);
    const result = runGuard();
    expect(createUrlTree).toHaveBeenCalledWith([
      AppConfigService.config.routes.dashboard,
    ]);
    expect(result).toBeTruthy();
  });

  it('debe redirigir al dashboard en SSR', () => {
    storageGet.mockReturnValue(true);
    const result = runGuard('server');
    expect(createUrlTree).toHaveBeenCalledWith([
      AppConfigService.config.routes.dashboard,
    ]);
    expect(result).not.toBe(true);
  });
});
