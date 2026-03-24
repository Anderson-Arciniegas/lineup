import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { AppConfigService, UserSchema, UserPublicService } from '@lineup/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../services';

/** Solo permite acceso si la sesión es de tipo user. Si hay sesión business redirige a dashboard; si no hay sesión, a login. */
export const UserAuthGuard: CanActivateFn = ():
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | boolean
  | UrlTree => {
  const auth = inject(AuthService);
  const userService = inject(UserPublicService);
  const router = inject(Router);
  const loginUrl = router.createUrlTree([AppConfigService.config.routes.login]);
  const dashboardUrl = router.createUrlTree([
    AppConfigService.config.routes.dashboard,
  ]);

  if (auth.businessValue) {
    return of(dashboardUrl);
  }
  if (auth.userValue) {
    return of(true);
  }

  return userService.getMe().pipe(
    map((userData: unknown) => {
      if (userData) {
        auth.setUser(userData as UserSchema);
        return true;
      }
      auth.removeUser(false);
      return loginUrl;
    }),
    catchError(() => {
      auth.removeUser(false);
      return of(loginUrl);
    }),
  );
};
