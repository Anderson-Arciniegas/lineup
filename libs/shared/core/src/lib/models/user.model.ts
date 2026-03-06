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
  // The server returns a LoginResponse-like object for createUser
  createUser: {
    code?: string;
    status?: string;
    user: UserSchema;
  };
}

export interface UpdateUserInput {
  id: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  imgCode?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}
