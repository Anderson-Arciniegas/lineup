import { Routes } from '@angular/router';
import { adminNoAuthGuard } from '../../core/guards/admin-no-auth.guard';
import { AuthAdminLayout } from '../../layout/components/auth-admin-layout/auth-admin-layout';

export const authRoutes: Routes = [
  {
    path: '',
    canActivate: [adminNoAuthGuard],
    component: AuthAdminLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./views/login-admin-page/login-admin-page').then(
            (m) => m.LoginAdminPage,
          ),
      },
    ],
  },
];
