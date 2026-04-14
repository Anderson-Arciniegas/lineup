import { gql } from 'apollo-angular';
import { adminSocialNetworkSelection } from '../selections/admin-social-network.selection';

export const ADMIN_CREATE_SOCIAL_NETWORK_MUTATION = gql`
  mutation AdminCreateSocialNetwork($data: CreateSocialNetworkInput!) {
    createSocialNetwork(data: $data) ${adminSocialNetworkSelection}
  }
`;

export const ADMIN_UPDATE_SOCIAL_NETWORK_MUTATION = gql`
  mutation AdminUpdateSocialNetwork($data: UpdateSocialNetworkInput!) {
    updateSocialNetwork(data: $data) ${adminSocialNetworkSelection}
  }
`;

export const ADMIN_REMOVE_SOCIAL_NETWORK_MUTATION = gql`
  mutation AdminRemoveSocialNetwork($id: Int!) {
    removeSocialNetwork(id: $id)
  }
`;
