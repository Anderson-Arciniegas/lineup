import { ProvidersEnum, RolesCodesEnum } from '../enums';
import { UserSchema } from '../schemas';

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  provider?: ProvidersEnum;
  password: string;
  role: RolesCodesEnum;
}

export interface CreateUserResponse {
  createUser: UserSchema;
}
