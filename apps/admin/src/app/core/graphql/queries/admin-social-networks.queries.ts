import { gql } from 'apollo-angular';
import { adminSocialNetworkSelection } from '../selections/admin-social-network.selection';

export const ADMIN_FIND_ALL_SOCIAL_NETWORKS_QUERY = gql`
  query AdminFindAllSocialNetworks {
    findAllSocialNetworks ${adminSocialNetworkSelection}
  }
`;

export const ADMIN_FIND_SOCIAL_NETWORK_BY_CODE_QUERY = gql`
  query AdminFindSocialNetworkByCode($code: SocialMediasEnum!) {
    findSocialNetworkByCode(code: $code) ${adminSocialNetworkSelection}
  }
`;

export const ADMIN_FIND_SOCIAL_NETWORK_BY_ID_QUERY = gql`
  query AdminFindSocialNetworkById($id: Int!) {
    findSocialNetworkById(id: $id) ${adminSocialNetworkSelection}
  }
`;
