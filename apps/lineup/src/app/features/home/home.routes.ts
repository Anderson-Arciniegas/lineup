import {
    Routes
} from '@angular/router';
import { HomePage } from './views/home-page/home-page';

export const homeRoutes: Routes = [
    {
        path: 'explore',
        component: HomePage,
        data: {
            title: 'general.home',
            breadcrumb: 'home',
        }
    },
    {
        path: '**',
        redirectTo: '/',
        pathMatch: 'full',
    },
]