import { createReducer, on } from '@ngrx/store';
import { SetBusiness, SetUser, UnsetBusiness, UnsetUser } from './auth.actions';
import { AuthState, initialAuthState } from './auth.state';

export const authReducer = createReducer(
  initialAuthState,
  on(SetUser, (state, { user }) => ({
    ...state,
    user,
    isAuthenticated: true,
  })),
  on(UnsetUser, (state) => ({
    ...state,
    user: null as AuthState['user'],
    isAuthenticated: false,
  })),
  on(SetBusiness, (state, { business }) => ({
    ...state,
    business,
    isAuthenticated: true,
  })),
  on(UnsetBusiness, (state) => ({
    ...state,
    business: null as AuthState['business'],
    isAuthenticated: false,
  })),
);
