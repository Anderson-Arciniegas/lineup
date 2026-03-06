import type { BusinessSchema } from '.';
import type { StatusEnum } from '../enums';

export interface LocationSchema {
  address: string;
  formattedAddress: string;
  name: string;
  addressComponents: string;
  lat: number;
  lng: number;
  business?: BusinessSchema;
  id: number;
  idCreationBusiness: number;
  modificationBusiness?: BusinessSchema;
  status: StatusEnum;
}
