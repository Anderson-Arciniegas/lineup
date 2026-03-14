import type { CoordinateSchema, UserSchema } from '.';
import type { StatusEnum } from '../enums';

export interface StateSchema {
  capital?: string;
  code?: string;
  creationCoordinate?: CoordinateSchema;
  creationDate?: string;
  creationIp?: string;
  creationUser?: UserSchema;
  id: number;
  idCreationUser: number;
  modificationCoordinate?: CoordinateSchema;
  modificationDate?: string;
  modificationIp?: string;
  modificationUser?: UserSchema;
  name: string;
  status: StatusEnum;
}
