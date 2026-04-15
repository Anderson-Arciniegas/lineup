import { Routes } from '@angular/router';

export const businessesAdminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        './views/businesses-admin-page/businesses-admin-page'
      ).then((m) => m.BusinessesAdminPage),
  },
];
