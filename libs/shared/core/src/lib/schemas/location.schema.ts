import type { BusinessSchema } from '.';
import type { StatusEnum } from '../enums';

export interface LocationSchema {
  address: string;
  addressComponents: string;
  business?: BusinessSchema;
  id: number;
  idCreationBusiness: number;
  modificationBusiness?: BusinessSchema;
  status: StatusEnum;
}
