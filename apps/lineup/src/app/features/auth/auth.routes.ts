import {
    Routes
} from '@angular/router';
import { LoginPage } from './views/login-page/login-page';

export const authRoutes: Routes = [
    {
        path: 'login',
        component: LoginPage,
    },
    {
        path: '**',
        redirectTo: '/',
        pathMatch: 'full',
    },
]