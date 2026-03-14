import type {
  CoordinateSchema,
  FileSchema,
  RoleSchema,
  StateSchema,
  UserRoleSchema,
} from '.';
import type { ProvidersEnum, StatusEnum } from '../enums';

export interface UserSchema {
  createdRoles?: RoleSchema[];
  createdUserRoles?: UserRoleSchema[];
  creationCoordinate?: CoordinateSchema;
  creationDate?: string;
  creationIp?: string;
  email: string;
  emailValidated?: boolean;
  files?: FileSchema[];
  firstName: string;
  id: number;
  idState?: number;
  imageCode?: string;
  lastName: string;
  modificationCoordinate?: CoordinateSchema;
  modificationDate?: string;
  modificationIp?: string;
  modifiedRoles?: RoleSchema[];
  profileImage?: FileSchema;
  provider: ProvidersEnum;
  state?: StateSchema;
  status: StatusEnum;
  userRoles?: UserRoleSchema[];
  username: string;
}
