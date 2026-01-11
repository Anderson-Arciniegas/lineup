import { Routes } from '@angular/router';

import { AppConfigService } from '../config/services/app-config.service';
import { BusinessAuthGuard } from '../core';
import { NoAuthGuard } from '../core/guards/no-auth.guard';
import { UserAuthGuard } from '../core/guards/user-auth.guard';
import { AccountTypePage } from '../features/auth/views/account-type-page/account-type-page';
import { LoginPage } from '../features/auth/views/login-page/login-page';
import { RegisterBusinessPage } from '../features/auth/views/register-business-page/register-business-page';
import { RegisterUserPage } from '../features/auth/views/register-user-page/register-user-page';
import { ControlPanelPage } from '../features/control-panel/views/control-panel-page/control-panel-page';
import { EditBusinessPage } from '../features/control-panel/views/edit-business-page/edit-business-page';
import { LocationsPage } from '../features/control-panel/views/locations-page/locations-page';
import { SocialMediasPage } from '../features/control-panel/views/social-medias-page/social-medias-page';
import { HomePage } from '../features/home/views/home-page/home-page';
import { SearchPage } from '../features/home/views/search-page/search-page';
import { LandingPage } from '../features/landing-page/views/landing-page/landing-page';
import { AuthLayout } from './components/auth-layout/auth-layout';
import { ControlPanelLayout } from './components/control-panel-layout/control-panel-layout';
import { HomeLayout } from './components/home-layout/home-layout';
import { UserLayout } from './components/user-layout/user-layout';
export const layoutRoutes: Routes = [
  {
    path: AppConfigService.config.routes.info,
    component: HomeLayout,
    children: [
      {
        path: '',
        component: LandingPage,
        data: {
          title: 'general.landingPage',
        },
      },
    ],
  },
  {
    path: AppConfigService.config.routes.login,
    canActivate: [NoAuthGuard],
    component: AuthLayout,
    children: [
      {
        path: '',
        component: LoginPage,
      },
    ],
  },
  {
    path: AppConfigService.config.routes.register,
    canActivate: [NoAuthGuard],
    component: AuthLayout,
    children: [
      {
        path: '',
        component: AccountTypePage,
      },
      {
        path: 'user',
        component: RegisterUserPage,
      },
      {
        path: 'business',
        component: RegisterBusinessPage,
      },
    ],
  },
  {
    path: AppConfigService.config.routes.dashboard,
    canActivate: [BusinessAuthGuard],
    component: ControlPanelLayout,
    children: [
      {
        path: '',
        component: ControlPanelPage,
      },
      {
        path: AppConfigService.config.routes.edit,
        component: EditBusinessPage,
      },
      {
        path: AppConfigService.config.routes.socialMedias,
        component: SocialMediasPage,
      },
      {
        path: AppConfigService.config.routes.locations,
        component: LocationsPage,
      },
    ],
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
    component: HomeLayout,
    children: [
      {
        path: '',
        component: HomePage,
        data: {
          title: 'general.home',
          breadcrumb: 'home',
        },
      },
      {
        path: AppConfigService.config.routes.search,
        component: SearchPage,
        data: {
          title: 'general.search',
          breadcrumb: 'search',
        },
      },
    ],
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
