import type { 
    CoordinateSchema,
    UserSchema,
    PermissionSchema,
    RoleSchema
} from '.';

export interface RolePermissionSchema {
  creationCoordinate?: CoordinateSchema;
  creationDate?: string;
  creationIp?: string;
  creationUser?: UserSchema;
  idCreationUser: number;
  idPermission: number;
  idRole: number;
  modificationCoordinate?: CoordinateSchema;
  modificationDate?: string;
  modificationIp?: string;
  modificationUser?: UserSchema;
  permission?: PermissionSchema;
  role?: RoleSchema;
}
