import { Routes } from '@angular/router';

import { LandingPage } from './views/landing-page/landing-page';
import { HomeLayout } from '../../layout/components/home-layout/home-layout';

export const landingInfoRoutes: Routes = [
  {
    path: '',
    component: HomeLayout,
    children: [
      {
        path: '',
        component: LandingPage,
        data: {
          title: 'general.landingPage',
        },
      },
    ],
  },
];
