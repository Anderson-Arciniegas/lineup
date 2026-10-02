import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateChildFn,
  CanActivateFn,
  Router,
  UrlTree,
} from '@angular/router';
import { AppConfigService } from '@lineup/core';
import { AuthService } from '../services';

/** Destino cuando ya hay sesión: UrlTree (sin navegar por side-effect). */
function redirectIfAuthenticated(auth: AuthService, router: Router): true | UrlTree {
  if (!auth.isLoggedIn()) {
    return true;
  }
  const sessionType = auth.getSessionType();
  if (sessionType === 'business') {
    return router.createUrlTree([AppConfigService.config.routes.dashboard]);
  }
  if (sessionType === 'user') {
    return router.createUrlTree([AppConfigService.config.routes.profile]);
  }
  return router.createUrlTree(['/']);
}

/** Si ya hay sesión (user o business), redirige al área correspondiente. */
export const NoAuthGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
): boolean | UrlTree => {
  return redirectIfAuthenticated(inject(AuthService), inject(Router));
};

export const NoAuthGuardChild: CanActivateChildFn = (
  _route: ActivatedRouteSnapshot,
): boolean | UrlTree => {
  return redirectIfAuthenticated(inject(AuthService), inject(Router));
};
