import { Routes } from '@angular/router';
import { ADMIN_ROUTE_SEGMENTS } from '../core/admin-routes';
import { adminAuthGuard } from '../core/guards/admin-auth.guard';

export const layoutRoutes: Routes = [
  {
    path: ADMIN_ROUTE_SEGMENTS.login,
    loadChildren: () =>
      import('../features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: '',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./components/shell-admin-layout/shell-admin-layout').then(
        (m) => m.ShellAdminLayout,
      ),
    children: [
      {
        path: '',
        redirectTo: ADMIN_ROUTE_SEGMENTS.dashboard,
        pathMatch: 'full',
      },
      {
        path: ADMIN_ROUTE_SEGMENTS.dashboard,
        loadComponent: () =>
          import(
            '../features/dashboard/views/dashboard-admin-page/dashboard-admin-page'
          ).then((m) => m.DashboardAdminPage),
      },
      {
        path: ADMIN_ROUTE_SEGMENTS.stats,
        loadChildren: () =>
          import('../features/stats/stats.routes').then(
            (m) => m.statsAdminRoutes,
          ),
      },
      {
        path: ADMIN_ROUTE_SEGMENTS.users,
        loadChildren: () =>
          import('../features/users/users.routes').then(
            (m) => m.usersAdminRoutes,
          ),
      },
      {
        path: ADMIN_ROUTE_SEGMENTS.businesses,
        loadChildren: () =>
          import('../features/businesses/businesses.routes').then(
            (m) => m.businessesAdminRoutes,
          ),
      },
      {
        path: ADMIN_ROUTE_SEGMENTS.roles,
        loadChildren: () =>
          import('../features/roles/roles.routes').then(
            (m) => m.rolesAdminRoutes,
          ),
      },
      {
        path: ADMIN_ROUTE_SEGMENTS.socialNetworks,
        loadChildren: () =>
          import('../features/social-networks/social-networks.routes').then(
            (m) => m.socialNetworksAdminRoutes,
          ),
      },
      {
        path: ADMIN_ROUTE_SEGMENTS.settings,
        loadComponent: () =>
          import(
            '../features/settings/views/settings-admin-page/settings-admin-page'
          ).then((m) => m.SettingsAdminPage),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
