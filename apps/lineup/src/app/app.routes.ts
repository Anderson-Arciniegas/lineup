import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadChildren: () => import('./layout/layout.routes').then(m => m.layoutRoutes)
  },
  {
      path: '**',
      redirectTo: '/',
      pathMatch: 'full',
  },
];
