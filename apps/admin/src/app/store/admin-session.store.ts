import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import type { BusinessSchema, UserSchema } from '@lineup/core';

/** Estado de sesión del panel admin (aislado del `AuthStore` del marketplace). */
interface AdminSessionState {
  user: UserSchema | null;
  business: BusinessSchema | null;
  isAuthenticated: boolean;
}

const initialAdminSessionState: AdminSessionState = {
  user: null,
  business: null,
  isAuthenticated: false,
};

export const AdminSessionStore = signalStore(
  { providedIn: 'root' },
  withState(initialAdminSessionState),

  withComputed(({ user, business }) => ({
    isAdminUserLoggedIn: () => user() !== null,
    isAdminBusinessLoggedIn: () => business() !== null,
    adminCurrentAccount: () => business() ?? user(),
    adminSessionType: () =>
      business() !== null ? 'business' : user() !== null ? 'user' : null,
  })),

  withMethods((store) => ({
    setAdminUser: (user: UserSchema) => {
      patchState(store, {
        user,
        business: null,
        isAuthenticated: true,
      });
    },

    unsetAdminUser: () => {
      patchState(store, {
        user: null,
        isAuthenticated: store.business() !== null,
      });
    },

    setAdminBusiness: (business: BusinessSchema) => {
      patchState(store, {
        business,
        user: null,
        isAuthenticated: true,
      });
    },

    unsetAdminBusiness: () => {
      patchState(store, {
        business: null,
        isAuthenticated: store.user() !== null,
      });
    },

    clearAdminSession: () => {
      patchState(store, {
        user: null,
        business: null,
        isAuthenticated: false,
      });
    },
  })),
);
