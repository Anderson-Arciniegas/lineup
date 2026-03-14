import { StatusEnum } from '../enums';
import { FileSchema } from './file.schema';
import { UserSchema } from './user.schema';

export interface SocialNetworkSchema {
  code: string;
  creationUser?: UserSchema;
  id: number;
  idCreationUser?: number;
  image?: FileSchema;
  imageCode?: string;
  modificationUser?: UserSchema;
  name: string;
  status: StatusEnum;
}
