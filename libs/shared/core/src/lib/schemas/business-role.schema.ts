import type { 
    BusinessSchema,
    CoordinateSchema,
    RoleSchema
} from '.';
import type { StatusEnum } from '../enums';

export interface BusinessRoleSchema {
  business?: BusinessSchema;
  creationCoordinate?: CoordinateSchema;
  creationDate?: string;
  creationIp?: string;
  idCreationBusiness?: number;
  idRole?: number;
  modificationCoordinate?: CoordinateSchema;
  modificationDate?: string;
  modificationIp?: string;
  role?: RoleSchema;
  status?: StatusEnum;
}
