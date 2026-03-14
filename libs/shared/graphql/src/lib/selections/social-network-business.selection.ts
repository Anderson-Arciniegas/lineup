import { businessBasicSelection } from './businesses.selection';
import { socialNetworkSelection } from './social-network.selection';

export const socialNetworkBusinessSelection = `{
  id
  idSocialNetwork
  idCreationBusiness
  url
  phone
  status
  business ${businessBasicSelection}
  creationBusiness ${businessBasicSelection}
  modificationBusiness ${businessBasicSelection}
  socialNetwork ${socialNetworkSelection}
}`;
