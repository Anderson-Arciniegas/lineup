import { Routes } from '@angular/router';

import { AppConfigService } from '@lineup/core';
import { BusinessAuthGuard } from '../core';
import { NoAuthGuard } from '../core/guards/no-auth.guard';
import { UserAuthGuard } from '../core/guards/user-auth.guard';
import { AccountTypePage } from '../features/auth/views/account-type-page/account-type-page';
import { LoginPage } from '../features/auth/views/login-page/login-page';
import { RegisterBusinessPage } from '../features/auth/views/register-business-page/register-business-page';
import { RegisterUserPage } from '../features/auth/views/register-user-page/register-user-page';
import { BusinessSettingsPage } from '../features/control-panel/views/business-settings-page/business-settings-page';
import { CatalogPanelPage } from '../features/control-panel/views/catalog-panel-page/catalog-panel-page';
import { CatalogsPage } from '../features/control-panel/views/catalogs-page/catalogs-page';
import { ControlPanelPage } from '../features/control-panel/views/control-panel-page/control-panel-page';
import { CreateCatalogPage } from '../features/control-panel/views/create-catalog-page/create-catalog-page';
import { CreateDiscountPage } from '../features/control-panel/views/create-discount-page/create-discount-page';
import { CreateProductPage } from '../features/control-panel/views/create-product-page/create-product-page';
import { DiscountPage } from '../features/control-panel/views/discount-page/discount-page';
import { DiscountsPanelPage } from '../features/control-panel/views/discounts-panel-page/discounts-panel-page';
import { EditBusinessPage } from '../features/control-panel/views/edit-business-page/edit-business-page';
import { LocationsPage } from '../features/control-panel/views/locations-page/locations-page';
import { ProductPanelPage } from '../features/control-panel/views/product-panel-page/product-panel-page';
import { SocialMediasPage } from '../features/control-panel/views/social-medias-page/social-medias-page';
import { StatisticsPage } from '../features/control-panel/views/statistics-page/statistics-page';
import { UpdateProductSkuPage } from '../features/control-panel/views/update-product-sku-page/update-product-sku-page';
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
        path: AppConfigService.config.routes.user,
        component: RegisterUserPage,
      },
      {
        path: AppConfigService.config.routes.business,
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
      {
        path: AppConfigService.config.routes.discounts,
        children: [
          {
            path: '',
            component: DiscountsPanelPage,
          },
          {
            path: AppConfigService.config.routes.create,
            component: CreateDiscountPage,
          },
          {
            path: ':idDiscount',
            component: DiscountPage,
          },
          {
            path: ':idDiscount/' + AppConfigService.config.routes.edit,
            component: CreateDiscountPage,
          },
        ],
      },
      {
        path: AppConfigService.config.routes.statistics,
        component: StatisticsPage,
      },
      {
        path: AppConfigService.config.routes.catalogs,
        children: [
          {
            path: '',
            component: CatalogsPage,
          },
          {
            path: ':catalogPath',
            children: [
              {
                path: '',
                component: CatalogPanelPage,
              },
              {
                path: AppConfigService.config.routes.edit,
                component: CreateCatalogPage,
              },
              {
                path: AppConfigService.config.routes.createProduct,
                component: CreateProductPage,
              },
              {
                path: ':idProduct/' + AppConfigService.config.routes.edit,
                component: CreateProductPage,
              },
              {
                path: ':idProduct/' + AppConfigService.config.routes.inventory,
                component: UpdateProductSkuPage,
              },
              {
                path: ':idProduct',
                component: ProductPanelPage,
              },
            ],
          },
        ],
      },
      {
        path: AppConfigService.config.routes.settings,
        component: BusinessSettingsPage,
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
          searchMode: 'search',
        },
      },
      {
        path: AppConfigService.config.routes.search + '/:query',
        component: SearchPage,
        data: {
          title: 'general.search',
          breadcrumb: 'search',
          searchMode: 'search',
        },
      },
      {
        path: AppConfigService.config.routes.tag,
        component: SearchPage,
        data: {
          title: 'general.search',
          breadcrumb: 'search',
          searchMode: 'tag',
        },
      },
      {
        path: AppConfigService.config.routes.tag + '/:tag',
        component: SearchPage,
        data: {
          title: 'general.search',
          breadcrumb: 'search',
          searchMode: 'tag',
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
