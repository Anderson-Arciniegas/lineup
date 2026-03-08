import { gql } from 'apollo-angular';
import { socialNetworkBusinessSelection } from '../selections/social-network-business.selection';
import { socialNetworkSelection } from '../selections/social-network.selection';

export const GET_SOCIAL_NETWORKS_QUERY = gql`
  query FindAllSocialNetworks {
    findAllSocialNetworks ${socialNetworkSelection}
  }
`;

export const GET_MY_SOCIAL_NETWORK_BUSINESSES_QUERY = gql`
  query FindAllMySocialNetworkBusinesses {
    findAllMySocialNetworkBusinesses ${socialNetworkBusinessSelection}
  }
`;

export const GET_SOCIAL_NETWORK_BUSINESSES_BY_BUSINESS_QUERY = gql`
  query FindSocialNetworkBusinessesByBusiness($idBusiness: Int!) {
    findByBusiness(idBusiness: $idBusiness) ${socialNetworkBusinessSelection}
  }
`;
