import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppConfigService, BusinessPrivateService } from '@lineup/core';
import { firstValueFrom, isObservable, of } from 'rxjs';
import { AuthService } from '../services';
import { BusinessAuthGuard } from './business-auth.guard';

/**
 * Protege rutas de panel de negocio: usuarios van a perfil; valida sesión con `myBusiness`.
 */
describe('BusinessAuthGuard', () => {
  let createUrlTree: jest.Mock;

  beforeEach(() => {
    createUrlTree = jest.fn((commands: unknown[]) => ({ commands } as any));
  });

  function runGuard() {
    return TestBed.runInInjectionContext(() =>
      BusinessAuthGuard({} as any, {} as any),
    );
  }

  it('debe redirigir a profile si hay sesión user', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            userValue: { id: 1 },
            businessValue: null,
          },
        },
        { provide: Router, useValue: { createUrlTree } },
        {
          provide: BusinessPrivateService,
          useValue: { myBusiness: jest.fn() },
        },
      ],
    });

    const result = runGuard();
    expect(isObservable(result)).toBe(false);
    expect(createUrlTree).toHaveBeenCalledWith([
      AppConfigService.config.routes.profile,
    ]);
    expect(result).toBeTruthy();
  });

  it('debe permitir acceso si business ya está en memoria', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            userValue: null,
            businessValue: { id: 2 },
            setBusiness: jest.fn(),
            removeUser: jest.fn(),
          },
        },
        { provide: Router, useValue: { createUrlTree } },
        {
          provide: BusinessPrivateService,
          useValue: { myBusiness: jest.fn() },
        },
      ],
    });

    expect(runGuard()).toBe(true);
  });

  it('debe redirigir a login si myBusiness no devuelve datos', async () => {
    const removeUser = jest.fn();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            userValue: null,
            businessValue: null,
            setBusiness: jest.fn(),
            removeUser,
          },
        },
        { provide: Router, useValue: { createUrlTree } },
        {
          provide: BusinessPrivateService,
          useValue: { myBusiness: () => of(null) },
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
