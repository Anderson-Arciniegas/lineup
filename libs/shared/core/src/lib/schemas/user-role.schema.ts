import type { 
    CoordinateSchema,
    UserSchema,
    RoleSchema,
} from '.';
import { StatusEnum } from '../enums';

export interface UserRoleSchema {
  creationCoordinate?: CoordinateSchema;
  creationDate?: string;
  creationIp?: string;
  creationUser?: UserSchema;
  idCreationUser: number;
  idRole: number;
  idUser: number;
  modificationCoordinate?: CoordinateSchema;
  modificationDate?: string;
  modificationIp?: string;
  role?: RoleSchema;
  status: StatusEnum;
  user?: UserSchema;
}
