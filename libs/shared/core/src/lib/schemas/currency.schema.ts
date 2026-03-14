import type { UserSchema } from './user.schema';
import type { StatusEnum } from '../enums';

export interface CurrencySchema {
  code: string;
  creationUser?: UserSchema;
  id: number;
  idCreationUser: number;
  name: string;
  status: StatusEnum;
}
