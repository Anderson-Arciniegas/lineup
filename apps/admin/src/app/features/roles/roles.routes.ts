import { Routes } from '@angular/router';

export const rolesAdminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./views/roles-admin-page/roles-admin-page').then(
        (m) => m.RolesAdminPage,
      ),
  },
];
