import { Router } from '@angular/router';
import { ApiErrorService, AppConfigService } from '@lineup/core';

/** Dependencias para reaccionar a "Cookie not sent" en handlers globales. */
export interface CookieNotSentSessionDeps {
  apiError: ApiErrorService;
  router: Router;
  /** Limpia sesión y redirige; se resuelve de forma diferida para evitar ciclos DI. */
  clearSession: () => void;
}

/** Indica si la URL actual exige autenticación (dashboard o profile). */
export function isAuthRequiredUrl(url: string): boolean {
  const path = url.split('?')[0].split('#')[0];
  const { dashboard, profile } = AppConfigService.config.routes;
  const prefixes = [`/${dashboard}`, `/${profile}`];
  return prefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

/**
 * Si el error es "Cookie not sent" y la ruta actual requiere autenticación,
 * limpia la sesión por completo y redirige al login.
 */
export function handleCookieNotSentSession(
  error: unknown,
  deps: CookieNotSentSessionDeps,
): void {
  if (!deps.apiError.isCookieNotSentError(error)) return;
  if (!isAuthRequiredUrl(deps.router.url)) return;
  deps.clearSession();
}
