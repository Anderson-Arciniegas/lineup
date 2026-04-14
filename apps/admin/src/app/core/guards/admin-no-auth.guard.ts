import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  UrlTree,
} from '@angular/router';
import { ADMIN_ROUTE_SEGMENTS } from '../admin-routes';
import { AuthAdminService } from '../services/auth-admin.service';

/**
 * Solo invitados: si ya hay sesión admin (storage), redirige al dashboard.
 */
export const adminNoAuthGuard: CanActivateFn = (): boolean | UrlTree => {
  const authAdmin = inject(AuthAdminService);
  const router = inject(Router);

  if (!authAdmin.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/', ADMIN_ROUTE_SEGMENTS.dashboard]);
};
