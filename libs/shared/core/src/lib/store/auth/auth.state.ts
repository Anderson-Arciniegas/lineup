import { BusinessSchema, UserSchema } from '../../schemas';

export interface AuthState {
  user: UserSchema | null;
  business: BusinessSchema | null;
  isAuthenticated: boolean;
}

export const initialAuthState: AuthState = {
  user: null,
  business: null,
  isAuthenticated: false,
};
