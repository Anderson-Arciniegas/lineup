import { createReducer, on } from '@ngrx/store';
import { SetUser, UnsetUser, SetTokens, ClearTokens } from './auth.actions';
import { initialAuthState, AuthState } from './auth.state';

export const authReducer = createReducer(
  initialAuthState,
  on(SetUser, (state, { user }) => ({
    ...state,
    user,
    isAuthenticated: true,
  })),
  on(UnsetUser, (state) => ({
    ...state,
    user: null,
    isAuthenticated: false,
  })),
  on(SetTokens, (state, { tokens }) => ({
    ...state,
    tokens,
  })),
  on(ClearTokens, (state) => ({
    ...state,
    tokens: null,
  }))
);

