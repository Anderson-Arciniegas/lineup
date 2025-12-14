import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AppConfigService, UserGraphqlService, BusinessService } from '@lineup/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../services';

export const AuthGuard: CanActivateFn = ():
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | boolean
  | UrlTree => {
  const auth = inject(AuthService);
  const user = inject(UserGraphqlService);
  const business = inject(BusinessService);
  const router = inject(Router);
  const loginRedirect = (): UrlTree =>
    router.createUrlTree([AppConfigService.config.routes.login]);

  const checkUser = (): Observable<boolean | null> =>
    user.getMe().pipe(
      map((userData: any) => {
        if (userData) {
          auth.setUser(userData);
          return true;
        }
        return null;
      }),
    );

  const checkBusiness = (): Observable<boolean | UrlTree> =>
    business.myBusiness().pipe(
      map((biz: any) => {
        if (biz) {
          auth.setBusiness(biz);
          return true;
        }
        auth.removeUser(false);
        return loginRedirect();
      }),
      catchError(() => {
        auth.removeUser(false);
        return of(loginRedirect());
      }),
    );

  if (auth.userValue) {
    return of(true);
  }

  return checkUser().pipe(
    switchMap((res) => {
      if (res === true) {
        return of(true);
      }
      return checkBusiness();
    }),
    catchError(() => checkBusiness()),
  );
};
