import { UserSchema } from '../../schemas';

export interface AuthState {
  user: UserSchema | null;
  tokens: {
    token: string | null;
    refreshToken: string | null;
  } | null;
  isAuthenticated: boolean;
}

export const initialAuthState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
};

