import { Routes } from '@angular/router';
import { FavoritesPage } from './views/favorites-page/favorites-page';
import { ProfilePage } from './views/profile-page/profile-page';
import { UserSettingsPage } from './views/user-settings-page/user-settings-page';

export const userRoutes: Routes = [
  {
    path: '',
    component: ProfilePage,
  },
  {
    path: 'favorites',
    component: FavoritesPage,
  },
  {
    path: 'settings',
    component: UserSettingsPage,
  },
  {
    path: '**',
    redirectTo: '/',
    pathMatch: 'full',
  },
];
