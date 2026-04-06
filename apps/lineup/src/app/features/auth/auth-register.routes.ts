import { Routes } from '@angular/router';

import { AppConfigService } from '@lineup/core';
import { NoAuthGuard } from '../../core/guards/no-auth.guard';
import { AuthLayout } from '../../layout/components/auth-layout/auth-layout';
import { AccountTypePage } from './views/account-type-page/account-type-page';
import { RegisterBusinessPage } from './views/register-business-page/register-business-page';
import { RegisterUserPage } from './views/register-user-page/register-user-page';

export const authRegisterRoutes: Routes = [
  {
    path: '',
    canActivate: [NoAuthGuard],
    component: AuthLayout,
    children: [
      {
        path: '',
        component: AccountTypePage,
      },
      {
        path: AppConfigService.config.routes.user,
        component: RegisterUserPage,
      },
      {
        path: AppConfigService.config.routes.business,
        component: RegisterBusinessPage,
      },
    ],
  },
];
