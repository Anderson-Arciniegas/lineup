import { SocialNetworkBusinessSchema } from '../schemas';

export interface SocialNetworkContactInput {
  url?: string;
  phone?: string;
}

export interface CreateSocialNetworkBusinessInput {
  contact: SocialNetworkContactInput;
  idSocialNetwork: number;
}

export interface UpdateSocialNetworkBusinessInput {
  contact: SocialNetworkContactInput;
  id: number;
}

export interface CreateSocialNetworkBusinessResponse {
  createSocialNetworkBusiness: SocialNetworkBusinessSchema;
}
