import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { AppConfigService, UserGraphqlService } from '@lineup/core';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services';

export const AuthGuard: CanActivateFn = ():
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | boolean
  | UrlTree => {
  const auth = inject(AuthService);
  const user = inject(UserGraphqlService);
  const router = inject(Router);
  console.log(auth.userValue);
  //   if (auth.userValue) {
  //     return of(true);
  //   }
  return user.getMe().pipe(
    switchMap((user: any) => {
      console.log(user);
      if (user) {
        auth.setUser(user);
        return of(true);
      } else {
        auth.removeUser(false);
        return of(router.createUrlTree([AppConfigService.config.routes.login]));
      }
    }),
    catchError((error) => {
      console.log(error);
      auth.removeUser(false);
      return of(router.createUrlTree([AppConfigService.config.routes.login]));
    }),
  );
};
