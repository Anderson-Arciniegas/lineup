import { gql } from 'apollo-angular';
import {
  businessBasicSelection,
  businessLoginResponseSelection,
} from '../selections/businesses.selection';

/**
 * Mutation para iniciar sesión como business
 */
export const BUSINESS_LOGIN_MUTATION = gql`
  mutation Login($login: LoginDto!) {
    login(login: $login) ${businessLoginResponseSelection}
  }
`;

/**
 * Mutation para refrescar el token de autenticación de business
 */
export const BUSINESS_REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken {
    refreshToken ${businessLoginResponseSelection}
  }
`;

/**
 * Mutation para crear un nuevo business
 */
export const CREATE_BUSINESS_MUTATION = gql`
  mutation CreateBusiness($data: CreateBusinessInput!) {
    createBusiness(data: $data) {
      code
      status
      business ${businessBasicSelection}
    }
  }
`;

/**
 * Mutation para actualizar un business
 */
export const UPDATE_BUSINESS_MUTATION = gql`
  mutation UpdateBusiness($data: UpdateBusinessInput!) {
    updateBusiness(data: $data) ${businessBasicSelection}    
  }
`;

export const BUSINESS_LOGOUT_MUTATION = gql`
  mutation BusinessLogout {
    logout {
      code
      message
      status
    }
  }
`;
