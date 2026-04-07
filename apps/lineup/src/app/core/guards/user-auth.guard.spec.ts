import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppConfigService, UserPublicService } from '@lineup/core';
import { firstValueFrom, isObservable, of } from 'rxjs';
import { AuthService } from '../services';
import { UserAuthGuard } from './user-auth.guard';

/**
 * Protege rutas solo para sesión de usuario: redirige negocios al dashboard y valida cookie vía `getMe`.
 */
describe('UserAuthGuard', () => {
  let createUrlTree: jest.Mock;

  beforeEach(() => {
    createUrlTree = jest.fn((commands: unknown[]) => ({ commands } as any));
  });

  function runGuard() {
    return TestBed.runInInjectionContext(() =>
      UserAuthGuard({} as any, {} as any),
    );
  }

  it('debe redirigir al dashboard si hay sesión business', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            businessValue: { id: 1 },
            userValue: null,
          },
        },
        { provide: Router, useValue: { createUrlTree } },
        {
          provide: UserPublicService,
          useValue: { getMe: jest.fn() },
        },
      ],
    });

    const result = runGuard();
    expect(isObservable(result)).toBe(false);
    expect(createUrlTree).toHaveBeenCalledWith([
      AppConfigService.config.routes.dashboard,
    ]);
    expect(result).toBeTruthy();
  });

  it('debe permitir acceso si ya hay user en memoria', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            businessValue: null,
            userValue: { id: 9 },
          },
        },
        { provide: Router, useValue: { createUrlTree } },
        {
          provide: UserPublicService,
          useValue: { getMe: jest.fn() },
        },
      ],
    });

    const result = runGuard();
    expect(result).toBe(true);
  });

  it('debe redirigir a login si getMe no devuelve usuario', async () => {
    const removeUser = jest.fn();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            businessValue: null,
            userValue: null,
            setUser: jest.fn(),
            removeUser,
          },
        },
        { provide: Router, useValue: { createUrlTree } },
        {
          provide: UserPublicService,
          useValue: { getMe: () => of(null) },
        },
      ],
    });

    await firstValueFrom(runGuard() as any);
    expect(removeUser).toHaveBeenCalledWith(false);
    expect(createUrlTree).toHaveBeenCalledWith([
      AppConfigService.config.routes.login,
    ]);
  });
});
