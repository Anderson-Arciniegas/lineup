import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { AppConfigService, UserGraphqlService } from '@lineup/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../services';

export const UserAuthGuard: CanActivateFn = ():
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | boolean
  | UrlTree => {
  const auth = inject(AuthService);
  const user = inject(UserGraphqlService);
  const router = inject(Router);
  console.log(auth.userValue);
  if (auth.userValue) {
    return of(true);
  }
  console.log('auth guard');
  return user.getMe().pipe(
    map((userData: any) => {
      console.log(userData);
      if (userData) {
        auth.setUser(userData);
        return true;
      } else {
        auth.removeUser(false);
        console.log('login');
        return router.createUrlTree([AppConfigService.config.routes.login]);
      }
    }),
    catchError((error) => {
      console.log(error);
      auth.removeUser(false);
      console.log('login');

      return of(router.createUrlTree([AppConfigService.config.routes.login]));
    }),
  );
};
