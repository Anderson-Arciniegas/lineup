import { createAction, props } from '@ngrx/store';
import { UserSchema } from '../../schemas';

export const SetUser = createAction(
  '[Auth] Set User',
  props<{ user: UserSchema }>()
);

export const UnsetUser = createAction('[Auth] Unset User');

export const SetTokens = createAction(
  '[Auth] Set Tokens',
  props<{ tokens: { token: string; refreshToken: string } }>()
);

export const ClearTokens = createAction('[Auth] Clear Tokens');

