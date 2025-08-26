import {
    Routes
} from '@angular/router';
import { AppConfigService } from '../../config/services/app-config.service';
import {
    BusinessPage
} from './views/business-page/business-page';
import { CreateProductPage } from './views/create-product-page/create-product-page';

export const businessRoutes: Routes = [
    {
        path: '',
        component: BusinessPage,
    },
    {
        path: 'lineup/:name',
        data: {
            prerender: true,
            getPrerenderParams: () => [{
                    business: 'business-1',
                    name: '1-catalog'
                },
                {
                    business: 'business-2',
                    name: '2-catalog'
                }
            ]
        },
        children: [{
                path: '',
                loadComponent: () => import('./views/catalog-page/catalog-page').then(m => m.CatalogPage),
            },
            {
                path: AppConfigService.config.routes.createProduct,
                component: CreateProductPage
            },
            {
                path: ':idProduct',
                loadComponent: () => import('./views/product-page/product-page').then(m => m.ProductPage),
                data: {
                    prerender: true,
                    getPrerenderParams: () => [{
                            business: 'business-1',
                            name: '1-catalog',
                            idProduct: '1'
                        },
                        {
                            business: 'business-2',
                            name: '2-catalog',
                            idProduct: '2'
                        }
                    ]
                },
            },
        ]
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
]