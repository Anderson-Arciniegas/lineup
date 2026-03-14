import { gql } from 'apollo-angular';
import { socialNetworkBusinessSelection } from '../selections/social-network-business.selection';

/**
 * Mutation para crear una relación entre social network y business
 */
export const CREATE_SOCIAL_NETWORK_BUSINESS_MUTATION = gql`
  mutation CreateSocialNetworkBusiness($data: CreateSocialNetworkBusinessInput!) {
    createSocialNetworkBusiness(data: $data) ${socialNetworkBusinessSelection}
  }
`;

/**
 * Mutation para actualizar una relación entre social network y business
 */
export const UPDATE_SOCIAL_NETWORK_BUSINESS_MUTATION = gql`
  mutation UpdateSocialNetworkBusiness($data: UpdateSocialNetworkBusinessInput!) {
    updateSocialNetworkBusiness(data: $data) ${socialNetworkBusinessSelection}
  }
`;

/**
 * Mutation para eliminar una relación entre social network y business
 */
export const REMOVE_SOCIAL_NETWORK_BUSINESS_MUTATION = gql`
  mutation RemoveSocialNetworkBusiness($id: Int!) {
    removeSocialNetworkBusiness(id: $id)
  }
`;
