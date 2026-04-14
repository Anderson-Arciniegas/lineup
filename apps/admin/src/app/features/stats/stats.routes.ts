import { Routes } from '@angular/router';

export const statsAdminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./views/stats-admin-page/stats-admin-page').then(
        (m) => m.StatsAdminPage,
      ),
  },
];
