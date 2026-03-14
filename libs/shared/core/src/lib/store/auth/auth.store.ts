import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { BusinessSchema, UserSchema } from '../../schemas';

interface AuthState {
  user: UserSchema | null;
  business: BusinessSchema | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  business: null,
  isAuthenticated: false,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  // Computed signals (equivalente a selectors)
  withComputed(({ user, business }) => ({
    isUserLoggedIn: () => user() !== null,
    isBusinessLoggedIn: () => business() !== null,
    currentAccount: () => business() ?? user(),
    /** Solo puede existir una sesión: 'user' | 'business' | null */
    sessionType: () =>
      business() !== null ? 'business' : user() !== null ? 'user' : null,
  })),

  // Methods (equivalente a actions + reducers)
  // Sesión única: al establecer user se limpia business y viceversa.
  withMethods((store) => ({
    setUser: (user: UserSchema) => {
      patchState(store, {
        user,
        business: null,
        isAuthenticated: true,
      });
    },

    unsetUser: () => {
      patchState(store, {
        user: null,
        isAuthenticated: store.business() !== null,
      });
    },

    setBusiness: (business: BusinessSchema) => {
      patchState(store, {
        business,
        user: null,
        isAuthenticated: true,
      });
    },

    unsetBusiness: () => {
      patchState(store, {
        business: null,
        isAuthenticated: store.user() !== null,
      });
    },

    // Método para limpiar todo el estado de autenticación
    clearAuth: () => {
      patchState(store, {
        user: null,
        business: null,
        isAuthenticated: false,
      });
    },
  })),
);
