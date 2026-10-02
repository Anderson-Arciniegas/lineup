import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppConfigService } from '@lineup/core';
import { AuthService } from '../services';
import { UnknownRouteGuard } from './unknown-route.guard';

describe('UnknownRouteGuard', () => {
  let createUrlTree: jest.Mock;

  beforeEach(() => {
    createUrlTree = jest.fn((commands: unknown[]) => ({ commands } as any));
  });

  function runGuard() {
    return TestBed.runInInjectionContext(() => UnknownRouteGuard({} as any, {} as any));
  }

  it('debe ir al home sin sesión', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isLoggedIn: () => false } },
        { provide: Router, useValue: { createUrlTree } },
      ],
    });

    expect(runGuard()).toEqual({ commands: ['/'] });
    expect(createUrlTree).toHaveBeenCalledWith(['/']);
  });

  it('debe ir al dashboard con sesión (nunca login)', () => {
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

    expect(runGuard()).toEqual({
      commands: [AppConfigService.config.routes.dashboard],
    });
    expect(createUrlTree).toHaveBeenCalledWith([
      AppConfigService.config.routes.dashboard,
    ]);
    expect(createUrlTree).not.toHaveBeenCalledWith([
      AppConfigService.config.routes.login,
    ]);
  });

  it('debe ir al profile con sesión user (no login ni dashboard business)', () => {
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

    expect(runGuard()).toEqual({
      commands: [AppConfigService.config.routes.profile],
    });
    expect(createUrlTree).not.toHaveBeenCalledWith([
      AppConfigService.config.routes.login,
    ]);
  });
});
