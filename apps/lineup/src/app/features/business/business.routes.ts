import { Routes } from '@angular/router';
import { AppConfigService } from '@lineup/core';
import { BusinessPage } from './views/business-page/business-page';
import { CatalogDownloadPage } from './views/catalog-download-page/catalog-download-page';

export const businessRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: BusinessPage,
      },
    ],
  },
  {
    path: ':catalogPath',
    data: {
      prerender: true,
      getPrerenderParams: () => [
        {
          business: 'business-1',
          catalogPath: 'catalog-1',
        },
        {
          business: 'business-2',
          catalogPath: 'catalog-2',
        },
      ],
    },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./views/catalog-page/catalog-page').then(
            (m) => m.CatalogPage,
          ),
      },
      {
        path: AppConfigService.config.routes.download,
        component: CatalogDownloadPage,
      },
      // {
      //   canActivate: [BusinessAuthGuard],
      //   path: ':idProduct/' + AppConfigService.config.routes.inventory,
      //   component: UpdateProductSkuPage,
      // },
      // {
      //   canActivate: [BusinessAuthGuard],
      //   path: ':idProduct/' + AppConfigService.config.routes.edit,
      //   component: CreateProductPage,
      // },
      {
        path: ':idProduct',
        loadComponent: () =>
          import('./views/product-page/product-page').then(
            (m) => m.ProductPage,
          ),
        data: {
          prerender: true,
          getPrerenderParams: () => [
            {
              business: 'business-1',
              catalogPath: 'catalog-1',
              idProduct: '1',
            },
            {
              business: 'business-2',
              catalogPath: 'catalog-2',
              idProduct: '2',
            },
          ],
        },
      },
    ],
  },
  // {
  //     path: 'product/:id',
  //     loadComponent: () =>
  //         import('./views/product-page/product-page').then(m => m.ProductPage),
  //     data: {
  //         prerender: true,
  //         getPrerenderParams: () => [{
  //                 business: 'business-1',
  //                 product: 'product-a'
  //             },
  //             {
  //                 business: 'business-2',
  //                 product: 'product-b'
  //             }
  //         ]
  //     }
  // },
  {
    path: '**',
    redirectTo: '/',
    pathMatch: 'full',
  },
];
