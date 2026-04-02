import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { AppConfigService, BusinessSchema, BusinessPrivateService } from '@lineup/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../services';

/** Solo permite acceso si la sesión es de tipo business. Si hay sesión user redirige a profile; si no hay sesión, a login. */
export const BusinessAuthGuard: CanActivateFn = ():
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | boolean
  | UrlTree => {
  const auth = inject(AuthService);
  const business = inject(BusinessPrivateService);
  const router = inject(Router);
  const loginUrl = router.createUrlTree([AppConfigService.config.routes.login]);
  const profileUrl = router.createUrlTree([AppConfigService.config.routes.profile]);

  if (auth.userValue) {
    return profileUrl;
  }
  if (auth.businessValue) {
    return true;
  }

  // No confiar solo en storage: la cookie puede haber expirado en el servidor.
  return business.myBusiness().pipe(
    map((businessData: unknown) => {
      if (businessData) {
        auth.setBusiness(businessData as BusinessSchema);
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
