import { Routes } from '@angular/router';
import { AppConfigService } from '../../config/services/app-config.service';
import { BusinessPage } from './views/business-page/business-page';
import { CreateCatalogPage } from './views/create-catalog-page/create-catalog-page';
import { CreateProductPage } from './views/create-product-page/create-product-page';

export const businessRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: BusinessPage,
      },
      {
        path: AppConfigService.config.routes.createCatalog,
        component: CreateCatalogPage,
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
        path: AppConfigService.config.routes.createProduct,
        component: CreateProductPage,
      },
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
