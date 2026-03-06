import { StatusEnum } from '../enums/status.enum';
import { BusinessSchema } from './business.schema';
import { UserSchema } from './user.schema';

export interface BusinessFollowerSchema {
  business: BusinessSchema;
  creationUser: UserSchema;
  id: number;
  idBusiness: number;
  idCreationUser: number;
  status: StatusEnum;
}
