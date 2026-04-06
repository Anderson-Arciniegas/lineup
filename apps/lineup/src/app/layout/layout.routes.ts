import { Routes } from '@angular/router';

import { AppConfigService } from '@lineup/core';
import { UserAuthGuard } from '../core/guards/user-auth.guard';
import { UserLayout } from './components/user-layout/user-layout';

export const layoutRoutes: Routes = [
  {
    path: AppConfigService.config.routes.info,
    loadChildren: () =>
      import('../features/landing-page/landing-info.routes').then(
        (m) => m.landingInfoRoutes,
      ),
  },
  {
    path: AppConfigService.config.routes.login,
    loadChildren: () =>
      import('../features/auth/auth-login.routes').then(
        (m) => m.authLoginRoutes,
      ),
  },
  {
    path: AppConfigService.config.routes.register,
    loadChildren: () =>
      import('../features/auth/auth-register.routes').then(
        (m) => m.authRegisterRoutes,
      ),
  },
  {
    path: AppConfigService.config.routes.dashboard,
    loadChildren: () =>
      import('../features/control-panel/control-panel.routes').then(
        (m) => m.controlPanelRoutes,
      ),
  },
  {
    path: AppConfigService.config.routes.profile,
    canActivate: [UserAuthGuard],
    component: UserLayout,
    loadChildren: () =>
      import('../features/user/user.routes').then((m) => m.userRoutes),
  },
  {
    path: '',
    loadChildren: () =>
      import('../features/home/home-public.routes').then(
        (m) => m.homePublicRoutes,
      ),
  },
  {
    path: ':business',
    loadChildren: () =>
      import('../features/business/business.routes').then(
        (m) => m.businessRoutes,
      ),
    data: {
      prerender: true,
      getPrerenderParams: () => [
        {
          business: 'business-1',
        },
        {
          business: 'business-2',
        },
      ],
    },
  },
  {
    path: '**',
    redirectTo: '/',
    pathMatch: 'full',
  },
];
