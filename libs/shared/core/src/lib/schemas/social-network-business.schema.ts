import { StatusEnum } from '../enums';
import { BusinessSchema } from './business.schema';
import { SocialNetworkSchema } from './social-network.schema';

export interface SocialNetworkBusinessSchema {
  business?: BusinessSchema;
  creationBusiness?: BusinessSchema;
  id: number;
  idCreationBusiness?: number;
  idSocialNetwork: number;
  modificationBusiness?: BusinessSchema;
  socialNetwork?: SocialNetworkSchema;
  status: StatusEnum;
  url: string;
  phone: string;
}
