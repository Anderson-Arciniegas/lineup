import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { CombinedGraphQLErrors, ServerError } from '@apollo/client/errors';
import { AuthStore } from '../store/auth';
import { ApiErrorService } from './api-error.service';

describe('ApiErrorService', () => {
  let service: ApiErrorService;
  let isAuthenticated: jest.Mock;

  beforeEach(() => {
    isAuthenticated = jest.fn(() => false);
    TestBed.configureTestingModule({
      providers: [{ provide: AuthStore, useValue: { isAuthenticated } }],
    });
    service = TestBed.inject(ApiErrorService);
  });

  describe('resolveI18nKey', () => {
    it.each([
      [0, 'errors.network'],
      [400, 'errors.badRequest'],
      [422, 'errors.badRequest'],
      [403, 'errors.forbidden'],
      [404, 'errors.notFound'],
      [408, 'errors.timeout'],
      [504, 'errors.timeout'],
      [409, 'errors.conflict'],
      [429, 'errors.tooManyRequests'],
      [500, 'errors.server'],
      [502, 'errors.server'],
      [503, 'errors.server'],
      [418, 'errors.generic'],
      [undefined, 'errors.generic'],
    ])('mapea %s a %s', (status, key) => {
      expect(service.resolveI18nKey(status as number | undefined)).toBe(key);
    });

    it('401 sin sesión devuelve unauthorized', () => {
      expect(service.resolveI18nKey(401)).toBe('errors.unauthorized');
    });

    it('401 con sesión devuelve sessionExpired', () => {
      isAuthenticated.mockReturnValue(true);
      expect(service.resolveI18nKey(401)).toBe('errors.sessionExpired');
    });

    it('un businessCode mapeado tiene prioridad sobre el status', () => {
      expect(service.resolveI18nKey(401, 100000)).toBe('auth.invalidCredentials');
      expect(service.resolveI18nKey(500, 2501099)).toBe(
        'general.errorRatingProduct',
      );
    });

    it('un mensaje literal conocido tiene prioridad sobre el status HTTP', () => {
      expect(
        service.resolveI18nKey(500, undefined, 'The mail is already registered.'),
      ).toBe('errors.email.alreadyRegistered');
    });

    it('un businessCode no mapeado no altera el resultado por status', () => {
      expect(service.resolveI18nKey(404, 999999)).toBe('errors.notFound');
    });
  });

  describe('isCookieNotSentError', () => {
    it('detecta el mensaje literal Cookie not sent (sin businessCode)', () => {
      const error = new CombinedGraphQLErrors({
        data: null,
        errors: [
          {
            message: 'Cookie not sent',
            code: 500,
            status: false,
          } as never,
        ],
      });

      expect(service.isCookieNotSentError(error)).toBe(true);
      expect(service.isCookieNotSentError(service.normalize(error))).toBe(true);
    });

    it('detecta businessCode 101000 y 201000', () => {
      const userCookie = new CombinedGraphQLErrors({
        data: null,
        errors: [
          {
            message: 'other',
            code: 401,
            status: false,
            businessCode: 101000,
          } as never,
        ],
      });
      const businessCookie = new CombinedGraphQLErrors({
        data: null,
        errors: [
          {
            message: 'other',
            code: 401,
            status: false,
            businessCode: 201000,
          } as never,
        ],
      });

      expect(service.isCookieNotSentError(userCookie)).toBe(true);
      expect(service.isCookieNotSentError(businessCookie)).toBe(true);
    });

    it('no marca otros errores como cookie not sent', () => {
      expect(service.isCookieNotSentError(new Error('boom'))).toBe(false);
      expect(
        service.isCookieNotSentError(
          new CombinedGraphQLErrors({
            data: null,
            errors: [{ message: 'Unauthorized', code: 401 } as never],
          }),
        ),
      ).toBe(false);
    });
  });

  describe('normalize', () => {
    it('lee code y message del primer error GraphQL (formatError del backend)', () => {
      const error = new CombinedGraphQLErrors({
        data: null,
        errors: [
          {
            message: 'Invalid username or password.',
            code: 401,
            status: false,
          } as never,
        ],
      });

      const result = service.normalize(error);

      expect(result.httpStatus).toBe(401);
      expect(result.code).toBeUndefined();
      expect(result.message).toBe('Invalid username or password.');
      expect(result.i18nKey).toBe('errors.unauthorized');
      expect(result.original).toBe(error);
    });

    it('mapea correo ya registrado aunque solo llegue el mensaje (sin businessCode)', () => {
      const error = new CombinedGraphQLErrors({
        data: null,
        errors: [
          {
            message: 'The mail is already registered.',
            code: 500,
            status: false,
          } as never,
        ],
      });

      const result = service.normalize(error);

      expect(result.httpStatus).toBe(500);
      expect(result.code).toBeUndefined();
      expect(result.i18nKey).toBe('errors.email.alreadyRegistered');
    });

    it('lee businessCode anidado en extensions.response.message', () => {
      const error = new CombinedGraphQLErrors({
        data: null,
        errors: [
          {
            message: 'The mail is already registered.',
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
              response: {
                statusCode: 406,
                message: {
                  code: 100302,
                  status: false,
                  message: 'The mail is already registered.',
                },
              },
            },
          },
        ],
      });

      const result = service.normalize(error);

      expect(result.httpStatus).toBe(406);
      expect(result.code).toBe(100302);
      expect(result.i18nKey).toBe('errors.email.alreadyRegistered');
    });

    it('prioriza businessCode (formatError) sobre el status HTTP', () => {
      const error = new CombinedGraphQLErrors({
        data: null,
        errors: [
          {
            message: 'Previous password invalid.',
            code: 403,
            status: false,
            businessCode: 100702,
          } as never,
        ],
      });

      const result = service.normalize(error);

      expect(result.httpStatus).toBe(403);
      expect(result.code).toBe(100702);
      expect(result.i18nKey).toBe('errors.password.previousInvalid');
    });

    it('lee extensions.response.code como respaldo del businessCode', () => {
      const error = new CombinedGraphQLErrors({
        data: null,
        errors: [
          {
            message: 'Verification code has expired.',
            extensions: {
              code: 'BAD_REQUEST',
              response: { statusCode: 400, code: 2400101 },
            },
          },
        ],
      });

      const result = service.normalize(error);

      expect(result.httpStatus).toBe(400);
      expect(result.code).toBe(2400101);
      expect(result.i18nKey).toBe('errors.verificationCode.expired');
    });

    it('cae al status HTTP si el businessCode no está mapeado', () => {
      const error = new CombinedGraphQLErrors({
        data: null,
        errors: [
          {
            message: 'Business not found.',
            code: 404,
            status: false,
            businessCode: 200301,
          } as never,
        ],
      });

      const result = service.normalize(error);

      expect(result.code).toBe(200301);
      expect(result.i18nKey).toBe('errors.notFound');
    });

    it('usa extensions.code cuando no hay code plano', () => {
      const error = new CombinedGraphQLErrors({
        data: null,
        errors: [{ message: 'Nope', extensions: { code: 'FORBIDDEN' } }],
      });

      expect(service.normalize(error).i18nKey).toBe('errors.forbidden');
    });

    it('normaliza HttpErrorResponse con cuerpo Nest', () => {
      const error = new HttpErrorResponse({
        status: 409,
        error: { statusCode: 409, code: 700200, message: ['a', 'b'] },
      });

      const result = service.normalize(error);

      expect(result.httpStatus).toBe(409);
      expect(result.code).toBe(700200);
      expect(result.message).toBe('a. b');
      expect(result.i18nKey).toBe('errors.conflict');
    });

    it('mapea el código de negocio de un error REST (subida de archivos)', () => {
      const error = new HttpErrorResponse({
        status: 406,
        error: { statusCode: 406, code: 700102, message: 'ext' },
      });

      expect(service.normalize(error).i18nKey).toBe('errors.file.invalidExtension');
    });

    it('no usa statusCode del cuerpo REST como código de negocio', () => {
      const error = new HttpErrorResponse({
        status: 400,
        error: { statusCode: 400, message: 'Bad' },
      });

      expect(service.normalize(error).code).toBeUndefined();
    });

    it('trata status 0 como fallo de red', () => {
      const error = new HttpErrorResponse({ status: 0, statusText: 'Unknown' });
      expect(service.normalize(error).i18nKey).toBe('errors.network');
    });

    it('normaliza ServerError de Apollo', () => {
      const error = new ServerError('Bad gateway', {
        response: { status: 502 } as Response,
        bodyText: '',
      });

      const result = service.normalize(error);

      expect(result.httpStatus).toBe(502);
      expect(result.i18nKey).toBe('errors.server');
    });

    it('trata ProgressEvent como fallo de red', () => {
      expect(service.normalize(new ProgressEvent('error')).i18nKey).toBe(
        'errors.network',
      );
    });

    it('trata TypeError "Failed to fetch" como fallo de red', () => {
      expect(service.normalize(new TypeError('Failed to fetch')).i18nKey).toBe(
        'errors.network',
      );
    });

    it('cae en generic para errores desconocidos', () => {
      expect(service.normalize(new Error('boom'))).toMatchObject({
        message: 'boom',
        i18nKey: 'errors.generic',
      });
      expect(service.normalize('texto')).toMatchObject({
        message: 'texto',
        i18nKey: 'errors.generic',
      });
      expect(service.normalize(undefined).message).toBe('Unknown error');
    });
  });
});
