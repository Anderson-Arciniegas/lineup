import { Routes } from '@angular/router';
import { AppConfigService } from '@lineup/core';
import { HomePage } from './views/home-page/home-page';
import { SearchPage } from './views/search-page/search-page';

export const homeRoutes: Routes = [
  {
    path: '',
    component: HomePage,
    data: {
      title: 'general.home',
      breadcrumb: 'home',
    },
  },
  {
    path: AppConfigService.config.routes.search + '/:query',
    component: SearchPage,
    data: {
      title: 'general.search',
      breadcrumb: 'search',
    },
  },
  {
    path: '**',
    redirectTo: '/',
    pathMatch: 'full',
  },
];
