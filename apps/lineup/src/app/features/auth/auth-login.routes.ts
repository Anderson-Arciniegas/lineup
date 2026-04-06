import { Routes } from '@angular/router';

import { NoAuthGuard } from '../../core/guards/no-auth.guard';
import { AuthLayout } from '../../layout/components/auth-layout/auth-layout';
import { LoginPage } from './views/login-page/login-page';

export const authLoginRoutes: Routes = [
  {
    path: '',
    canActivate: [NoAuthGuard],
    component: AuthLayout,
    children: [
      {
        path: '',
        component: LoginPage,
      },
    ],
  },
];
