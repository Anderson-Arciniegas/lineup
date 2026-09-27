import { ApiErrorService, AppConfigService } from '@lineup/core';
import { Router } from '@angular/router';
import {
  handleCookieNotSentSession,
  isAuthRequiredUrl,
} from './cookie-not-sent-session';

describe('isAuthRequiredUrl', () => {
  const { dashboard, profile } = AppConfigService.config.routes;

  it('reconoce dashboard y profile (con o sin hijos / query)', () => {
    expect(isAuthRequiredUrl(`/${dashboard}`)).toBe(true);
    expect(isAuthRequiredUrl(`/${dashboard}/inventory`)).toBe(true);
    expect(isAuthRequiredUrl(`/${profile}`)).toBe(true);
    expect(isAuthRequiredUrl(`/${profile}/settings?x=1`)).toBe(true);
  });

  it('no marca rutas públicas', () => {
    expect(isAuthRequiredUrl('/')).toBe(false);
    expect(isAuthRequiredUrl('/login')).toBe(false);
    expect(isAuthRequiredUrl('/some-business/catalog')).toBe(false);
  });
});

describe('handleCookieNotSentSession', () => {
  let isCookieNotSentError: jest.Mock;
  let clearSession: jest.Mock;
  let routerUrl: string;

  const deps = () => ({
    apiError: { isCookieNotSentError } as unknown as ApiErrorService,
    router: {
      get url() {
        return routerUrl;
      },
    } as Router,
    clearSession,
  });

  beforeEach(() => {
    isCookieNotSentError = jest.fn(() => false);
    clearSession = jest.fn();
    routerUrl = `/${AppConfigService.config.routes.dashboard}`;
  });

  it('no hace nada si el error no es cookie not sent', () => {
    handleCookieNotSentSession(new Error('other'), deps());
    expect(clearSession).not.toHaveBeenCalled();
  });

  it('limpia sesión y redirige en ruta autenticada', () => {
    isCookieNotSentError.mockReturnValue(true);
    handleCookieNotSentSession({ message: 'Cookie not sent' }, deps());
    expect(clearSession).toHaveBeenCalledTimes(1);
  });

  it('no redirige en ruta pública aunque sea cookie not sent', () => {
    isCookieNotSentError.mockReturnValue(true);
    routerUrl = '/login';
    handleCookieNotSentSession({ message: 'Cookie not sent' }, deps());
    expect(clearSession).not.toHaveBeenCalled();
  });
});
