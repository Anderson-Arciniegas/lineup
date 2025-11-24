import type { 
    CoordinateSchema,
    FileSchema,
    RoleSchema,
    UserRoleSchema
} from '.';
import type { ProvidersEnum, StatusEnum } from '../enums';

export interface UserSchema {
  createdRoles?: RoleSchema[];
  createdUserRoles?: UserRoleSchema[];
  creationCoordinate?: CoordinateSchema;
  creationDate?: string;
  creationIp?: string;
  email: string;
  emailValidated: boolean;
  files?: FileSchema[];
  firstName: string;
  id: number;
  lastName: string;
  modificationCoordinate?: CoordinateSchema;
  modificationDate?: string;
  modificationIp?: string;
  modifiedRoles?: RoleSchema[];
  provider: ProvidersEnum;
  status: StatusEnum;
  userRoles?: UserRoleSchema[];
  username: string;
}
