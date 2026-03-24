import { gql } from 'apollo-angular';
import {
  businessFullSelection,
  businessLoginResponseSelection,
  businessLoginResponseWithUserSelection,
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
      business ${businessFullSelection}
    }
  }
`;

/**
 * Mutation para actualizar un business
 */
export const UPDATE_BUSINESS_MUTATION = gql`
  mutation UpdateBusiness($data: UpdateBusinessInput!) {
    updateBusiness(data: $data) ${businessFullSelection}    
  }
`;

/**
 * Mutation para actualizar el email del business autenticado
 */
export const UPDATE_BUSINESS_EMAIL_MUTATION = gql`
  mutation UpdateBusinessEmail($data: UpdateBusinessEmailInput!) {
    updateBusinessEmail(data: $data) ${businessFullSelection}
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

/**
 * Mutation para cambiar la contraseña del business
 */
export const CHANGE_BUSINESS_PASSWORD_MUTATION = gql`
  mutation ChangeBusinessPassword($data: ChangePasswordInput!) {
    changeBusinessPassword(data: $data)
  }
`;

/**
 * Mutation para iniciar sesión como business con Google
 */
export const BUSINESS_LOGIN_WITH_GOOGLE_MUTATION = gql`
  mutation LoginWithGoogle($data: LoginGoogleInput!) {
    loginWithGoogle(data: $data) ${businessLoginResponseWithUserSelection}
  }
`;

/**
 * Mutation para registrar business con Google
 */
export const BUSINESS_REGISTER_WITH_GOOGLE_MUTATION = gql`
  mutation RegisterWithGoogle($data: RegisterGoogleBusinessInput!) {
    registerWithGoogle(data: $data) ${businessLoginResponseWithUserSelection}
  }
`;
