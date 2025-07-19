import {
    Routes
} from '@angular/router';
import {
    BusinessPage
} from './views/business-page/business-page';

export const businessRoutes: Routes = [{
        path: '',
        component: BusinessPage,
    },
    {
        path: 'product/:id',
        loadComponent: () =>
        import('./views/product-page/product-page').then(m => m.ProductPage),
        data: {
            prerender: true,
            getPrerenderParams: () => [{
                    business: 'business-1',
                    product: 'product-a'
                },
                {
                    business: 'business-2',
                    product: 'product-b'
                }
            ]
        }
    },
    {
        path: '**',
        redirectTo: '/',
        pathMatch: 'full',
    },
]