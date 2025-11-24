import { Routes } from '@angular/router';

import { HomePage } from '../features/home/views/home-page/home-page';
export const layoutRoutes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: '**',
    redirectTo: '/',
    pathMatch: 'full',
  },
];
