import {
    Routes
} from '@angular/router';
import {
    BusinessPage
} from './views/business-page/business-page';
import {
    ProductPage
} from './views/product-page/product-page';

export const businessRoutes: Routes = [
    {
        path: '',
        component: BusinessPage,
    },
    {
        path: ':product',
        component: ProductPage,
    },
    {
        path: '**',
        redirectTo: '/',
        pathMatch: 'full',
    },
]