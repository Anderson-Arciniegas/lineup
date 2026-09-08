import { Routes } from '@angular/router';

import { AppConfigService } from '@lineup/core';
import { BusinessAuthGuard } from '../../core';
import { BusinessOnboardingGuard } from '../../core/guards/business-onboarding.guard';
import { ControlPanelLayout } from '../../layout/components/control-panel-layout/control-panel-layout';
import { BusinessOnboardingLayout } from '../../layout/components/business-onboarding-layout/business-onboarding-layout';
import { BusinessHoursPage } from './views/business-hours-page/business-hours-page';
import { BusinessSettingsPage } from './views/business-settings-page/business-settings-page';
import { CatalogPanelPage } from './views/catalog-panel-page/catalog-panel-page';
import { CatalogsPage } from './views/catalogs-page/catalogs-page';
import { ControlPanelPage } from './views/control-panel-page/control-panel-page';
import { CreateCatalogPage } from './views/create-catalog-page/create-catalog-page';
import { CreateDiscountPage } from './views/create-discount-page/create-discount-page';
import { CreateProductPage } from './views/create-product-page/create-product-page';
import { DiscountPage } from './views/discount-page/discount-page';
import { DiscountsPanelPage } from './views/discounts-panel-page/discounts-panel-page';
import { EditBusinessPage } from './views/edit-business-page/edit-business-page';
import { ImportProductsPage } from './views/import-products-page/import-products-page';
import { InventoryPage } from './views/inventory-page/inventory-page';
import { LocationsPage } from './views/locations-page/locations-page';
import { ProductPanelPage } from './views/product-panel-page/product-panel-page';
import { RegisterSalePage } from './views/register-sale-page/register-sale-page';
import { SocialMediasPage } from './views/social-medias-page/social-medias-page';
import { StatisticsPage } from './views/statistics-page/statistics-page';
import { UpdateProductSkuPage } from './views/update-product-sku-page/update-product-sku-page';

export const controlPanelRoutes: Routes = [
  {
    path: AppConfigService.config.routes.setup,
    canActivate: [BusinessAuthGuard, BusinessOnboardingGuard],
    component: BusinessOnboardingLayout,
    data: { onboardingFlow: true },
    children: [
      {
        path: AppConfigService.config.routes.edit,
        component: EditBusinessPage,
      },
      {
        path: AppConfigService.config.routes.createCatalog,
        component: CreateCatalogPage,
      },
      {
        path: 'catalog/:catalogPath',
        children: [
          {
            path: AppConfigService.config.routes.createProduct,
            component: CreateProductPage,
          },
        ],
      },
      {
        path: '**',
        redirectTo: AppConfigService.config.routes.edit,
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
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
        path: AppConfigService.config.routes.inventory,
        component: InventoryPage,
      },
      {
        path: AppConfigService.config.routes.registerSale,
        component: RegisterSalePage,
      },
      {
        path: AppConfigService.config.routes.statistics,
        component: StatisticsPage,
      },
      {
        path: AppConfigService.config.routes.importProducts,
        component: ImportProductsPage,
      },
      {
        path:
          AppConfigService.config.routes.importProducts +
          '/:idProduct/' +
          AppConfigService.config.routes.edit,
        component: CreateProductPage,
      },
      {
        path: AppConfigService.config.routes.catalogs,
        children: [
          {
            path: '',
            component: CatalogsPage,
          },
          {
            path: AppConfigService.config.routes.createCatalog,
            component: CreateCatalogPage,
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
        path: AppConfigService.config.routes.businessHours,
        component: BusinessHoursPage,
      },
      {
        path: AppConfigService.config.routes.settings,
        component: BusinessSettingsPage,
      },
    ],
  },
];
