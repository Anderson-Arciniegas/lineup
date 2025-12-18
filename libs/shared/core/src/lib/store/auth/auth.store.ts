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
  withComputed(({ user, business, isAuthenticated }) => ({
    isUserLoggedIn: () => user() !== null,
    isBusinessLoggedIn: () => business() !== null,
    currentAccount: () => business() ?? user(),
  })),

  // Methods (equivalente a actions + reducers)
  withMethods((store) => ({
    setUser: (user: UserSchema) => {
      patchState(store, {
        user,
        isAuthenticated: true,
      });
    },

    unsetUser: () => {
      patchState(store, {
        user: null,
        isAuthenticated: false,
      });
    },

    setBusiness: (business: BusinessSchema) => {
      patchState(store, {
        business,
        isAuthenticated: true,
      });
    },

    unsetBusiness: () => {
      patchState(store, {
        business: null,
        isAuthenticated: false,
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
