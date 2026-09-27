import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CombinedGraphQLErrors, ServerError } from '@apollo/client/errors';
import type { GraphQLFormattedError } from 'graphql';
import {
  resolveBusinessErrorI18nKey,
  resolveMessageErrorI18nKey,
} from '../constants/business-error-codes.constants';
import { ApiError } from '../models/api-error.model';
import { AuthStore } from '../store/auth';

/**
 * Forma del error GraphQL tras el `formatError` del backend:
 * `{ code, status, message, businessCode? }` donde `code` es el status HTTP y
 * `businessCode` el código de negocio de `core/common/responses`.
 */
interface BackendGraphQLError extends GraphQLFormattedError {
  code?: number;
  status?: boolean;
  businessCode?: number;
}

/** Cuerpo habitual de un error REST (Nest): `{ statusCode, message, error, code }`. */
interface BackendRestErrorBody {
  statusCode?: number;
  code?: number;
  message?: string | string[];
  error?: string;
}

/** Mensaje literal del backend cuando falta la cookie de sesión. */
export const COOKIE_NOT_SENT_MESSAGE = 'Cookie not sent';

/** Códigos de negocio `token.cookieNotSent` (users / businesses). */
export const COOKIE_NOT_SENT_BUSINESS_CODES: ReadonlySet<number> = new Set([
  101000, 201000,
]);

/**
 * Normaliza cualquier error de API (Apollo/GraphQL, HttpClient/REST, red) en un `ApiError`
 * con la clave i18n que debe mostrarse al usuario.
 */
@Injectable({
  providedIn: 'root',
})
export class ApiErrorService {
  private readonly _authStore = inject(AuthStore);

  /** Convierte un error desconocido en un `ApiError` con `i18nKey` resuelta. */
  normalize(error: unknown): ApiError {
    const partial = this._extract(error);
    return {
      ...partial,
      i18nKey: this.resolveI18nKey(
        partial.httpStatus,
        partial.code,
        partial.message,
      ),
      original: error,
    };
  }

  /**
   * Indica si el error (crudo o ya normalizado) corresponde a "Cookie not sent"
   * del extractor JWT del backend.
   */
  isCookieNotSentError(error: unknown): boolean {
    if (this._isNormalizedApiError(error)) {
      return this._matchesCookieNotSent(error.message, error.code);
    }
    const partial = this._extract(error);
    return this._matchesCookieNotSent(partial.message, partial.code);
  }

  private _matchesCookieNotSent(
    message: string | undefined,
    businessCode: number | undefined,
  ): boolean {
    if (message === COOKIE_NOT_SENT_MESSAGE) return true;
    return (
      businessCode !== undefined &&
      COOKIE_NOT_SENT_BUSINESS_CODES.has(businessCode)
    );
  }

  private _isNormalizedApiError(value: unknown): value is ApiError {
    return (
      value !== null &&
      typeof value === 'object' &&
      'i18nKey' in value &&
      'message' in value &&
      'original' in value
    );
  }

  /**
   * Resuelve la clave de traducción: código de negocio, mensaje literal conocido
   * (`BACKEND_MESSAGE_ERROR_I18N_KEYS`) y, si no, status HTTP.
   */
  resolveI18nKey(
    httpStatus: number | undefined,
    businessCode?: number,
    message?: string,
  ): string {
    const businessKey = resolveBusinessErrorI18nKey(businessCode);
    if (businessKey) return businessKey;

    const messageKey = resolveMessageErrorI18nKey(message);
    if (messageKey) return messageKey;

    switch (httpStatus) {
      case 0:
        return 'errors.network';
      case 400:
      case 422:
        return 'errors.badRequest';
      case 401:
        return this._authStore.isAuthenticated()
          ? 'errors.sessionExpired'
          : 'errors.unauthorized';
      case 403:
        return 'errors.forbidden';
      case 404:
        return 'errors.notFound';
      case 408:
      case 504:
        return 'errors.timeout';
      case 409:
        return 'errors.conflict';
      case 429:
        return 'errors.tooManyRequests';
      case 500:
      case 502:
      case 503:
        return 'errors.server';
      default:
        return 'errors.generic';
    }
  }

  private _extract(error: unknown): Omit<ApiError, 'i18nKey' | 'original'> {
    if (CombinedGraphQLErrors.is(error)) {
      const first = error.errors[0] as BackendGraphQLError | undefined;
      const statusFromExtensions = this._statusFromExtensions(first);
      return {
        httpStatus:
          typeof first?.code === 'number' ? first.code : statusFromExtensions,
        code: this._businessCodeFromGraphQL(first),
        message: first?.message ?? error.message,
      };
    }

    if (error instanceof HttpErrorResponse) {
      const body = this._asRestBody(error.error);
      return {
        httpStatus: error.status,
        code: typeof body?.code === 'number' ? body.code : undefined,
        message: this._restMessage(body) ?? error.message,
      };
    }

    if (ServerError.is(error)) {
      return {
        httpStatus: error.statusCode,
        message: error.message,
      };
    }

    if (this._isNetworkFailure(error)) {
      return { httpStatus: 0, message: (error as Error).message };
    }

    if (error instanceof Error) {
      return { message: error.message };
    }

    return { message: typeof error === 'string' ? error : 'Unknown error' };
  }

  /**
   * Código de negocio del error GraphQL: `businessCode` plano (formatError) o, como
   * respaldo, `extensions.response.code` / `response.message.code` cuando Nest anida
   * el cuerpo de la excepción.
   */
  private _businessCodeFromGraphQL(
    error: BackendGraphQLError | undefined,
  ): number | undefined {
    if (typeof error?.businessCode === 'number') return error.businessCode;
    const response = error?.extensions?.['response'] as
      | { code?: unknown; message?: unknown }
      | undefined;
    if (typeof response?.code === 'number') return response.code;
    const nested = response?.message as { code?: unknown } | undefined;
    return typeof nested?.code === 'number' ? nested.code : undefined;
  }

  private _statusFromExtensions(
    error: BackendGraphQLError | undefined,
  ): number | undefined {
    const response = error?.extensions?.['response'] as
      | { statusCode?: number }
      | undefined;
    if (typeof response?.statusCode === 'number') {
      return response.statusCode;
    }
    switch (error?.extensions?.['code']) {
      case 'BAD_REQUEST':
      case 'BAD_USER_INPUT':
      case 'GRAPHQL_VALIDATION_FAILED':
        return 400;
      case 'UNAUTHENTICATED':
      case 'UNAUTHORIZED':
        return 401;
      case 'FORBIDDEN':
        return 403;
      case 'NOT_FOUND':
        return 404;
      case 'NOT_ACCEPTABLE':
        return 406;
      case 'INTERNAL_SERVER_ERROR':
        return 500;
      default:
        return undefined;
    }
  }

  private _asRestBody(body: unknown): BackendRestErrorBody | undefined {
    return body !== null && typeof body === 'object'
      ? (body as BackendRestErrorBody)
      : undefined;
  }

  private _restMessage(body: BackendRestErrorBody | undefined): string | undefined {
    if (!body?.message) return undefined;
    return Array.isArray(body.message) ? body.message.join('. ') : body.message;
  }

  private _isNetworkFailure(error: unknown): boolean {
    if (typeof ProgressEvent !== 'undefined' && error instanceof ProgressEvent) {
      return true;
    }
    return (
      error instanceof TypeError &&
      /failed to fetch|network|load failed/i.test(error.message)
    );
  }
}
