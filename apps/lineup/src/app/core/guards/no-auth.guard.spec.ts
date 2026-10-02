import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppConfigService } from '@lineup/core';
import { AuthService } from '../services';
import { NoAuthGuard, NoAuthGuardChild } from './no-auth.guard';

/**
 * En rutas públicas de auth: si ya hay sesión, redirige al área correspondiente.
 */
describe('NoAuthGuard', () => {
  let createUrlTree: jest.Mock;

  beforeEach(() => {
    createUrlTree = jest.fn((commands: unknown[]) => ({ commands } as any));
  });

  function runNoAuth() {
    return TestBed.runInInjectionContext(() => NoAuthGuard({} as any));
  }

  function runNoAuthChild() {
    return TestBed.runInInjectionContext(() => NoAuthGuardChild({} as any));
  }

  it('debe permitir acceso sin sesión', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: () => false,
          },
        },
        { provide: Router, useValue: { createUrlTree } },
      ],
    });

    expect(runNoAuth()).toBe(true);
    expect(createUrlTree).not.toHaveBeenCalled();
  });

  it('debe redirigir al dashboard con sesión business', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: () => true,
            getSessionType: () => 'business',
          },
        },
        { provide: Router, useValue: { createUrlTree } },
      ],
    });

    const result = runNoAuth();
    expect(createUrlTree).toHaveBeenCalledWith([
      AppConfigService.config.routes.dashboard,
    ]);
    expect(result).toEqual({
      commands: [AppConfigService.config.routes.dashboard],
    });
  });

  it('debe redirigir al profile con sesión user', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: () => true,
            getSessionType: () => 'user',
          },
        },
        { provide: Router, useValue: { createUrlTree } },
      ],
    });

    const result = runNoAuth();
    expect(createUrlTree).toHaveBeenCalledWith([
      AppConfigService.config.routes.profile,
    ]);
    expect(result).toEqual({
      commands: [AppConfigService.config.routes.profile],
    });
  });

  it('NoAuthGuardChild debe comportarse igual sin sesión', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: { isLoggedIn: () => false },
        },
        { provide: Router, useValue: { createUrlTree } },
      ],
    });

    expect(runNoAuthChild()).toBe(true);
  });
});
