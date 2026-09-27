import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import {
  ApiErrorService,
  SKIP_GLOBAL_ERROR_TOAST,
  ToastService,
} from '@lineup/core';
import { environment } from '@lineup/envs';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { handleCookieNotSentSession } from '../utils/cookie-not-sent-session';

/** Normaliza una URL para comparar endpoints sin importar la barra final. */
const normalizeUrl = (url: string | undefined): string =>
  (url ?? '').replace(/\/+$/, '');

/** Endpoints GraphQL: sus errores los gestiona el `ErrorLink` de Apollo, no este interceptor. */
const GRAPHQL_ENDPOINTS: ReadonlySet<string> = new Set(
  [environment.userApi, environment.businessApi].map(normalizeUrl),
);

/** Indica si la petición va a un endpoint GraphQL. */
export const isGraphqlRequest = (req: HttpRequest<unknown>): boolean =>
  GRAPHQL_ENDPOINTS.has(normalizeUrl(req.url));

/**
 * Interceptor global de errores HTTP (REST).
 *
 * Muestra el toast estándar para cualquier `HttpErrorResponse` salvo que:
 * - la petición lleve `SKIP_GLOBAL_ERROR_TOAST` en su `HttpContext`, o
 * - sea una petición a un endpoint GraphQL (gestionada por el `ErrorLink`).
 *
 * Ante "Cookie not sent" en rutas autenticadas, limpia la sesión y redirige al login.
 *
 * Nunca captura el error: siempre se re-lanza para que la vista pueda reaccionar.
 */
export const globalErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const apiError = inject(ApiErrorService);
  const router = inject(Router);
  const injector = inject(Injector);

  return next(req).pipe(
    catchError((error: unknown) => {
      const shouldSkip =
        req.context.get(SKIP_GLOBAL_ERROR_TOAST) || isGraphqlRequest(req);

      if (error instanceof HttpErrorResponse) {
        handleCookieNotSentSession(error, {
          apiError,
          router,
          clearSession: () => injector.get(AuthService).removeUser(true),
        });
        if (!shouldSkip) {
          toast.apiError(error);
        }
      }
      return throwError(() => error);
    }),
  );
};
