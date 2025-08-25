import {
    Routes
} from '@angular/router';

import {
    AppConfigService
} from '../config/services/app-config.service';
import {
    AccountTypePage
} from '../features/auth/views/account-type-page/account-type-page';
import {
    LoginPage
} from '../features/auth/views/login-page/login-page';
import {
    RegisterBusinessPage
} from '../features/auth/views/register-business-page/register-business-page';
import {
    RegisterUserPage
} from '../features/auth/views/register-user-page/register-user-page';
import {
    ControlPanelPage
} from '../features/control-panel/views/control-panel-page/control-panel-page';
import { HomePage } from '../features/home/views/home-page/home-page';
import { SearchPage } from '../features/home/views/search-page/search-page';
import {
    LandingPage
} from '../features/landing-page/views/landing-page/landing-page';
import {
    AuthLayout
} from './components/auth-layout/auth-layout';
import {
    ControlPanelLayout
} from './components/control-panel-layout/control-panel-layout';
import {
    HomeLayout
} from './components/home-layout/home-layout';
export const layoutRoutes: Routes = [{
        path: 'info',
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
        path: 'login',
        component: AuthLayout,
        children: [{
            path: '',
            component: LoginPage
        }]
    },
    {
        path: 'register',
        component: AuthLayout,
        children: [{
                path: '',
                component: AccountTypePage
            },
            {
                path: 'user',
                component: RegisterUserPage
            },
            {
                path: 'business',
                component: RegisterBusinessPage
            }
        ]
    },
    {
        path: AppConfigService.config.routes.controlPanel,
        component: ControlPanelLayout,
        children: [{
            path: '',
            component: ControlPanelPage
        }]
    },
    {
        path: '',
        component: HomeLayout,
        children: [{
                path: '',
                component: HomePage,
                data: {
                    title: 'general.home',
                    breadcrumb: 'home',
                }
            },
            {
                path: 'search',
                component: SearchPage,
                data: {
                    title: 'general.search',
                    breadcrumb: 'search',
                }
            },
        ]
    },
    {
        path: ':business',
        // component: HomeLayout,
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