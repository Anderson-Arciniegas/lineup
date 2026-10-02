import { Route } from '@angular/router';
import {
  UnknownRouteGuard,
  UnreachableRouteComponent,
} from './core/guards/unknown-route.guard';

export const appRoutes: Route[] = [
  {
    path: '',
    loadChildren: () =>
      import('./layout/layout.routes').then((m) => m.layoutRoutes),
  },
  {
    path: '**',
    canActivate: [UnknownRouteGuard],
    component: UnreachableRouteComponent,
  },
];
