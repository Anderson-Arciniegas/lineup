import { Routes } from '@angular/router';

import { AppConfigService, appRoutes } from '@lineup/core';
import { HomeLayout } from '../../layout/components/home-layout/home-layout';
import { LandingPage } from './views/landing-page/landing-page';
import { PrivacyPolicyPage } from './views/privacy-policy-page/privacy-policy-page';
import { TermsAndConditionsPage } from './views/terms-and-conditions-page/terms-and-conditions-page';

const routes = AppConfigService.config.routes ?? appRoutes;

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
      {
        path: routes.termsAndConditions,
        component: TermsAndConditionsPage,
        data: {
          title: 'legal.terms.title',
        },
      },
      {
        path: routes.privacyPolicy,
        component: PrivacyPolicyPage,
        data: {
          title: 'legal.privacy.title',
        },
      },
    ],
  },
];
