import { Routes } from '@angular/router';

import { AppConfigService } from '@lineup/core';
import { HomePage } from './views/home-page/home-page';
import { SearchPage } from './views/search-page/search-page';
import { HomeLayout } from '../../layout/components/home-layout/home-layout';

export const homePublicRoutes: Routes = [
  {
    path: '',
    component: HomeLayout,
    children: [
      {
        path: '',
        component: HomePage,
        data: {
          title: 'general.home',
          breadcrumb: 'home',
        },
      },
      {
        path: AppConfigService.config.routes.search,
        component: SearchPage,
        data: {
          title: 'general.search',
          breadcrumb: 'search',
          searchMode: 'search',
        },
      },
      {
        path: AppConfigService.config.routes.search + '/:query',
        component: SearchPage,
        data: {
          title: 'general.search',
          breadcrumb: 'search',
          searchMode: 'search',
        },
      },
      {
        path: AppConfigService.config.routes.tag,
        component: SearchPage,
        data: {
          title: 'general.search',
          breadcrumb: 'search',
          searchMode: 'tag',
        },
      },
      {
        path: AppConfigService.config.routes.tag + '/:tag',
        component: SearchPage,
        data: {
          title: 'general.search',
          breadcrumb: 'search',
          searchMode: 'tag',
        },
      },
    ],
  },
];
