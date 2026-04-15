import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ADMIN_ROUTE_SEGMENTS } from '../admin-routes';
import { AuthAdminService } from '../services/auth-admin.service';
import { AdminSessionStore } from '../../store/admin-session.store';

/**
 * Exige sesión admin válida: datos en `AdminSessionStore`, o flags en storage
 * verificados contra el servidor con `me` (usuario), o sesión business persistida.
 */
export const adminAuthGuard: CanActivateFn = ():
  | Observable<boolean | UrlTree>
  | boolean
  | UrlTree => {
  const adminSession = inject(AdminSessionStore);
  const authAdmin = inject(AuthAdminService);
  const router = inject(Router);
  const loginUrl = router.createUrlTree(['/', ADMIN_ROUTE_SEGMENTS.login]);

  if (adminSession.user() || adminSession.business()) {
    return true;
  }

  if (!authAdmin.isLoggedIn()) {
    return loginUrl;
  }

  const sessionType = authAdmin.getSessionType();
  if (sessionType === 'business') {
    return true;
  }

  return authAdmin.getMe().pipe(
    map((user) => {
      if (user) {
        return true;
      }
      authAdmin.clearLocalAdminSession();
      return loginUrl;
    }),
    catchError(() => {
      authAdmin.clearLocalAdminSession();
      return of(loginUrl);
    }),
  );
};
