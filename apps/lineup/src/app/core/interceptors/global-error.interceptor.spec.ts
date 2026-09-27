import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import {
  ApiErrorService,
  AppConfigService,
  skipGlobalErrorToastContext,
  ToastService,
} from '@lineup/core';
import { environment } from '@lineup/envs';
import { AuthService } from '../services/auth.service';
import {
  globalErrorInterceptor,
  isGraphqlRequest,
} from './global-error.interceptor';

describe('globalErrorInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let apiError: jest.Mock;
  let isCookieNotSentError: jest.Mock;
  let removeUser: jest.Mock;
  let routerUrl: string;

  beforeEach(() => {
    apiError = jest.fn();
    isCookieNotSentError = jest.fn(() => false);
    removeUser = jest.fn();
    routerUrl = '/';

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([globalErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: ToastService, useValue: { apiError } },
        {
          provide: ApiErrorService,
          useValue: { isCookieNotSentError },
        },
        { provide: AuthService, useValue: { removeUser } },
        {
          provide: Router,
          useValue: {
            get url() {
              return routerUrl;
            },
          },
        },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('muestra el toast y re-lanza el error en peticiones REST', () => {
    const onError = jest.fn();
    http.get('/api/rest/thing').subscribe({ error: onError });

    controller
      .expectOne('/api/rest/thing')
      .flush({ message: 'nope' }, { status: 500, statusText: 'Server Error' });

    expect(apiError).toHaveBeenCalledTimes(1);
    expect(apiError.mock.calls[0][0]).toBeInstanceOf(HttpErrorResponse);
    expect(onError).toHaveBeenCalledWith(expect.any(HttpErrorResponse));
  });

  it('no muestra toast cuando la petición lleva SKIP_GLOBAL_ERROR_TOAST', () => {
    const onError = jest.fn();
    http
      .get('/api/rest/upload', { context: skipGlobalErrorToastContext() })
      .subscribe({ error: onError });

    controller
      .expectOne('/api/rest/upload')
      .flush({}, { status: 400, statusText: 'Bad Request' });

    expect(apiError).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });

  it('no muestra toast para endpoints GraphQL (los gestiona el ErrorLink)', () => {
    const onError = jest.fn();
    http.post(environment.userApi, {}).subscribe({ error: onError });

    controller
      .expectOne(environment.userApi)
      .flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(apiError).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });

  it('no interviene en respuestas correctas', () => {
    const onNext = jest.fn();
    http.get('/api/rest/ok').subscribe({ next: onNext });

    controller.expectOne('/api/rest/ok').flush({ ok: true });

    expect(onNext).toHaveBeenCalledWith({ ok: true });
    expect(apiError).not.toHaveBeenCalled();
  });

  it('isGraphqlRequest ignora la barra final', () => {
    const req = { url: `${environment.businessApi.replace(/\/+$/, '')}/` };
    expect(isGraphqlRequest(req as never)).toBe(true);
    expect(isGraphqlRequest({ url: '/otra' } as never)).toBe(false);
  });

  it('limpia sesión en Cookie not sent dentro de ruta autenticada', () => {
    isCookieNotSentError.mockReturnValue(true);
    routerUrl = `/${AppConfigService.config.routes.profile}`;
    const onError = jest.fn();
    http.get('/api/rest/thing').subscribe({ error: onError });

    controller.expectOne('/api/rest/thing').flush(
      { message: 'Cookie not sent', code: 500 },
      { status: 500, statusText: 'Server Error' },
    );

    expect(removeUser).toHaveBeenCalledWith(true);
    expect(apiError).toHaveBeenCalled();
  });

  it('no limpia sesión en Cookie not sent en ruta pública', () => {
    isCookieNotSentError.mockReturnValue(true);
    routerUrl = '/';
    const onError = jest.fn();
    http.get('/api/rest/thing').subscribe({ error: onError });

    controller.expectOne('/api/rest/thing').flush(
      { message: 'Cookie not sent', code: 500 },
      { status: 500, statusText: 'Server Error' },
    );

    expect(removeUser).not.toHaveBeenCalled();
    expect(apiError).toHaveBeenCalled();
  });
});
