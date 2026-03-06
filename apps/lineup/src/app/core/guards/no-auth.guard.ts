import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateChildFn,
  CanActivateFn,
  UrlTree,
} from '@angular/router';
import { AppConfigService, UtilsService } from '@lineup/core';
import { AuthService } from '../services';

/** Si ya hay sesión (user o business), redirige al área correspondiente. */
export const NoAuthGuard: CanActivateFn = async (
  _route: ActivatedRouteSnapshot,
): Promise<boolean | UrlTree> => {
  const utils = inject(UtilsService);
  const auth = inject(AuthService);

  if (!auth.isLoggedIn()) {
    return true;
  }
  const sessionType = auth.getSessionType();
  if (sessionType === 'business') {
    utils.navigate([AppConfigService.config.routes.dashboard]);
  } else if (sessionType === 'user') {
    utils.navigate([AppConfigService.config.routes.profile]);
  } else {
    utils.navigate(['/']);
  }
  return false;
};

export const NoAuthGuardChild: CanActivateChildFn = async (
  _route: ActivatedRouteSnapshot,
): Promise<boolean | UrlTree> => {
  const utils = inject(UtilsService);
  const auth = inject(AuthService);

  if (!auth.isLoggedIn()) {
    return true;
  }
  const sessionType = auth.getSessionType();
  if (sessionType === 'business') {
    utils.navigate([AppConfigService.config.routes.dashboard]);
  } else if (sessionType === 'user') {
    utils.navigate([AppConfigService.config.routes.profile]);
  } else {
    utils.navigate(['/']);
  }
  return false;
};
