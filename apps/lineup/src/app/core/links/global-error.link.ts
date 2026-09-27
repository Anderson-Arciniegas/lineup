import { Injector } from '@angular/core';
import { Router } from '@angular/router';
import {
  ApiErrorService,
  shouldSkipGlobalErrorToast,
  ToastService,
} from '@lineup/core';
import { ErrorLink } from '@apollo/client/link/error';
import { AuthService } from '../services/auth.service';
import { handleCookieNotSentSession } from '../utils/cookie-not-sent-session';

export interface GlobalErrorLinkDeps {
  toast: ToastService;
  apiError: ApiErrorService;
  router: Router;
  /** Se usa para resolver `AuthService` solo al manejar el error (evita ciclo DI con Apollo). */
  injector: Injector;
}

/**
 * Crea el `ErrorLink` de Apollo que muestra el toast estándar ante cualquier error
 * GraphQL o de red, salvo que la operación lleve `skipGlobalErrorToast: true` en su `context`.
 *
 * Ante "Cookie not sent" en rutas autenticadas, limpia la sesión y redirige al login
 * (el toast de ese error ya lo silencia `ToastService.apiError`).
 *
 * No devuelve nada desde el handler: el error sigue propagándose a la vista.
 */
export function createGlobalErrorLink(deps: GlobalErrorLinkDeps): ErrorLink {
  const { toast, apiError, router, injector } = deps;
  const sessionDeps = {
    apiError,
    router,
    clearSession: () => injector.get(AuthService).removeUser(true),
  };

  return new ErrorLink(({ error, operation }) => {
    handleCookieNotSentSession(error, sessionDeps);
    if (shouldSkipGlobalErrorToast(operation.getContext())) {
      return;
    }
    toast.apiError(error);
  });
}
