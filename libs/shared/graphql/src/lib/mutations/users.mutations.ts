import { gql } from 'apollo-angular';
import {
  loginResponseSelection,
  userBasicSelection,
} from '../selections/users.selection';

/**
 * Mutation para iniciar sesión
 */
export const LOGIN_MUTATION = gql`
  mutation Login($login: LoginDto!) {
    login(login: $login) ${loginResponseSelection}
  }
`;

/**
 * Mutation para refrescar el token de autenticación
 */
export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken {
    refreshToken ${loginResponseSelection}
  }
`;

/**
 * Mutation para crear un nuevo usuario
 */
export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($data: CreateUserInput!) {
    createUser(data: $data) {
      code
      status
      user ${userBasicSelection}
    }
  }
`;

export const USER_LOGOUT_MUTATION = gql`
  mutation UserLogout {
    logout {
      code
      message
      status
    }
  }
`;
