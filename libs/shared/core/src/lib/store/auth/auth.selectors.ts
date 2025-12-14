import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectUser = createSelector(
  selectAuthState,
  (state: AuthState) => state.user,
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state: AuthState) => state.isAuthenticated,
);

export const selectBusiness = createSelector(
  selectAuthState,
  (state: AuthState) => state.business,
);

// export const selectTokens = createSelector(
//   selectAuthState,
//   (state: AuthState) => state.tokens
// );

// export const selectAccessToken = createSelector(
//   selectTokens,
//   (tokens) => tokens?.token || null
// );

// export const selectRefreshToken = createSelector(
//   selectTokens,
//   (tokens) => tokens?.refreshToken || null
// );
