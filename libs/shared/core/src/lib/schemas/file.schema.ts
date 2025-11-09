import type { CoordinateSchema, UserSchema } from '.';

export interface FileSchema {
  creationCoordinate?: CoordinateSchema;
  creationDate?: string;
  creationIp?: string;
  creationUser?: UserSchema;
  directory: string;
  extension: string;
  idCreationUser: number;
  modificationCoordinate?: CoordinateSchema;
  modificationDate?: string;
  modificationIp?: string;
  name: string;
  url: string;
}
