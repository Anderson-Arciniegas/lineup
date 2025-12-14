import { createAction, props } from '@ngrx/store';
import { BusinessSchema, UserSchema } from '../../schemas';

export const SetUser = createAction(
  '[Auth] Set User',
  props<{ user: UserSchema }>(),
);

export const UnsetUser = createAction('[Auth] Unset User');

export const SetBusiness = createAction(
  '[Auth] Set Business',
  props<{ business: BusinessSchema }>(),
);

export const UnsetBusiness = createAction('[Auth] Unset Business');

// export const SetTokens = createAction(
//   '[Auth] Set Tokens',
//   props<{ tokens: { token: string; refreshToken: string } }>()
// );

// export const ClearTokens = createAction('[Auth] Clear Tokens');
