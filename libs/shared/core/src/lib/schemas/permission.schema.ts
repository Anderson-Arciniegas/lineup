import type { CoordinateSchema, UserSchema, RolePermissionSchema } from '.';
import { StatusEnum } from '../enums';

export interface PermissionSchema {
  code: string;
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
}
