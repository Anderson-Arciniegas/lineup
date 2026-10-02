import { Component, inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AppConfigService } from '@lineup/core';
import { AuthService } from '../services';

/**
 * Host vacío: `UnknownRouteGuard` siempre devuelve `UrlTree`, así que no se renderiza.
 */
@Component({
  standalone: true,
  selector: 'app-unreachable-route',
  template: '',
})
export class UnreachableRouteComponent {}

/**
 * Rutas inexistentes (`**`):
 * - sesión business → dashboard
 * - sesión user → profile (evitar BusinessAuthGuard → login)
 * - sin sesión → home pública
 * Nunca redirige a login.
 */
export const UnknownRouteGuard: CanActivateFn = (): UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/']);
  }

  const sessionType = auth.getSessionType();
  if (sessionType === 'user') {
    return router.createUrlTree([AppConfigService.config.routes.profile]);
  }
  return router.createUrlTree([AppConfigService.config.routes.dashboard]);
};
