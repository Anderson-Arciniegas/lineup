import type { RolesCodesEnum, StatusEnum } from '../enums';
import type { 
    CoordinateSchema,
    UserSchema,
    RolePermissionSchema,
    UserRoleSchema
} from '.';

export interface RoleSchema {
  code: RolesCodesEnum;
  creationCoordinate?: CoordinateSchema;
  creationDate?: string;
  creationIp?: string;
  creationUser?: UserSchema;
  description: string;
  id: number;
  idCreationUser: number;
  modificationCoordinate?: CoordinateSchema;
  modificationDate?: string;
  modificationIp?: string;
  modificationUser?: UserSchema;
  rolePermissions?: RolePermissionSchema[];
  status: StatusEnum;
  userRoles?: UserRoleSchema[];
}
