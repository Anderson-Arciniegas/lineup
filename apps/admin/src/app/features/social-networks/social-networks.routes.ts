import { Routes } from '@angular/router';

export const socialNetworksAdminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        './views/social-networks-admin-page/social-networks-admin-page'
      ).then((m) => m.SocialNetworksAdminPage),
  },
];
