import { Routes } from '@angular/router';

export const usersAdminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./views/users-admin-page/users-admin-page').then(
        (m) => m.UsersAdminPage,
      ),
  },
];
