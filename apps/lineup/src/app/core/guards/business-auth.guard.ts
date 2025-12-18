import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { AppConfigService, BusinessService } from '@lineup/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../services';

export const BusinessAuthGuard: CanActivateFn = ():
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | boolean
  | UrlTree => {
  const auth = inject(AuthService);
  const business = inject(BusinessService);
  const router = inject(Router);

  console.log(auth.businessValue);
  if (auth.businessValue) {
    console.log('business value');
    return of(true);
  }
  console.log('business guard');

  return business.myBusiness().pipe(
    map((businessData: any) => {
      console.log(businessData);
      if (businessData) {
        auth.setBusiness(businessData);
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
