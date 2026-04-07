import { TestBed } from '@angular/core/testing';
import { AppConfigService, UtilsService } from '@lineup/core';
import { AuthService } from '../services';
import { NoAuthGuard, NoAuthGuardChild } from './no-auth.guard';

/**
 * En rutas públicas de auth: si ya hay sesión, redirige al área correspondiente.
 */
describe('NoAuthGuard', () => {
  let navigate: jest.Mock;

  beforeEach(() => {
    navigate = jest.fn();
  });

  async function runNoAuth() {
    return TestBed.runInInjectionContext(() =>
      NoAuthGuard({} as any),
    );
  }

  async function runNoAuthChild() {
    return TestBed.runInInjectionContext(() =>
      NoAuthGuardChild({} as any),
    );
  }

  it('debe permitir acceso sin sesión', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: () => false,
          },
        },
        { provide: UtilsService, useValue: { navigate } },
      ],
    });

    expect(await runNoAuth()).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('debe redirigir al dashboard con sesión business', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: () => true,
            getSessionType: () => 'business',
          },
        },
        { provide: UtilsService, useValue: { navigate } },
      ],
    });

    expect(await runNoAuth()).toBe(false);
    expect(navigate).toHaveBeenCalledWith([
      AppConfigService.config.routes.dashboard,
    ]);
  });

  it('debe redirigir al profile con sesión user', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: () => true,
            getSessionType: () => 'user',
          },
        },
        { provide: UtilsService, useValue: { navigate } },
      ],
    });

    expect(await runNoAuth()).toBe(false);
    expect(navigate).toHaveBeenCalledWith([
      AppConfigService.config.routes.profile,
    ]);
  });

  it('NoAuthGuardChild debe comportarse igual sin sesión', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: { isLoggedIn: () => false },
        },
        { provide: UtilsService, useValue: { navigate } },
      ],
    });

    expect(await runNoAuthChild()).toBe(true);
  });
});
