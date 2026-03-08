import { Routes } from '@angular/router';
import { FavoritesPage } from './views/favorites-page/favorites-page';
import { MyRatingsPage } from './views/my-ratings-page/my-ratings-page';
import { ProfilePage } from './views/profile-page/profile-page';
import { UserSettingsPage } from './views/user-settings-page/user-settings-page';
import { WishlistPage } from './views/wishlist-page/wishlist-page';

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
    path: 'wishlist',
    component: WishlistPage,
  },
  {
    path: 'my-ratings',
    component: MyRatingsPage,
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
