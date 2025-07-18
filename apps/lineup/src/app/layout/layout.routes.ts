import {
  Routes
} from '@angular/router';

import {
  LandingPage
} from '../features/landing-page/views/landing-page/landing-page';
import {
  HomeLayout
} from './components/home-layout/home-layout';
export const layoutRoutes: Routes = [{
        path: '',
        component: HomeLayout,
        children: [{
            path: '',
            component: LandingPage,
            data: {
                title: 'general.landingPage',
            }
        }, ]
    },
    {
        path: 'home',
        component: HomeLayout,
        loadChildren: () => import('../features/home/home.routes').then(m => m.homeRoutes)
    },
    {
        path: ':business',
        component: HomeLayout,
        loadChildren: () => import('../features/business/business.routes').then(m => m.businessRoutes),
        data: {
            prerender: true,
            getPrerenderParams: () => [{
                    business: 'business-1'
                },
                {
                    business: 'business-2'
                }
            ]
        }
    },
    {
        path: '**',
        redirectTo: '/',
        pathMatch: 'full',
    },
];