

import { Routes } from '@angular/router';
import { LandingPage } from '../features/landing-page/views/landing-page/landing-page';
import { HomeLayout } from './components/home-layout/home-layout';
export const layoutRoutes: Routes = [
  {
    path: '',
    component: HomeLayout,
    children: [
      {
        path: '',
        component: LandingPage,
        data: {
          title: 'general.home',
          breadcrumb: 'home',
        }
      },
    ]
  },
  {
    path: '**',
    redirectTo: '/',
    pathMatch: 'full',
  },
];