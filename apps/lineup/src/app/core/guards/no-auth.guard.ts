import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateChildFn,
  CanActivateFn,
  UrlTree,
} from '@angular/router';
import { UtilsService } from '@lineup/core';
import { AuthService } from '../services';

export const NoAuthGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
): Promise<boolean | UrlTree> => {
  const _utils = inject(UtilsService);
  const _auth = inject(AuthService);
  console.log('no auth guard');
  if (_auth.isLoggedIn()) {
    _utils.navigate(['/']);
    return false;
  }
  return true;
};

export const NoAuthGuardChild: CanActivateChildFn = async (
  route: ActivatedRouteSnapshot,
): Promise<boolean | UrlTree> => {
  console.log('no auth guard child');
  const _utils = inject(UtilsService);
  const _auth = inject(AuthService);

  if (_auth.isLoggedIn()) {
    _utils.navigate(['/']);
    return false;
  }
  return true;
};
