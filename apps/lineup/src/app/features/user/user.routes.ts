import { Routes } from '@angular/router';
import { AppConfigService } from '@lineup/core';
import { FavoritesPage } from './views/favorites-page/favorites-page';
import { MyRatingsPage } from './views/my-ratings-page/my-ratings-page';
import { ProfilePage } from './views/profile-page/profile-page';
import { UserDashboardPage } from './views/user-dashboard-page/user-dashboard-page';
import { UserSettingsPage } from './views/user-settings-page/user-settings-page';
import { WishlistPage } from './views/wishlist-page/wishlist-page';

export const userRoutes: Routes = [
  {
    path: '',
    component: UserDashboardPage,
  },
  {
    path: AppConfigService.config.routes.edit,
    component: ProfilePage,
  },
  {
    path: AppConfigService.config.routes.favorites,
    component: FavoritesPage,
  },
  {
    path: AppConfigService.config.routes.wishlist,
    component: WishlistPage,
  },
  {
    path: AppConfigService.config.routes.myRatings,
    component: MyRatingsPage,
  },
  {
    path: AppConfigService.config.routes.settings,
    component: UserSettingsPage,
  },
  {
    path: '**',
    redirectTo: '/',
    pathMatch: 'full',
  },
];
