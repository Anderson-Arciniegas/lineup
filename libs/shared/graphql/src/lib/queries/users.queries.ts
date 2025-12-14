import { gql } from 'apollo-angular';
import {
  userBasicSelection,
  userFullSelection,
} from '../selections/users.selection';

/**
 * Query para obtener el usuario actual autenticado
 */
export const GET_ME_QUERY = gql`
  query Me {
    me ${userFullSelection}
  }
`;

/**
 * Query para obtener un usuario por ID
 */
export const GET_USER_BY_ID_QUERY = gql`
  query GetUser($id: Int!) {
    userById(id: $id) ${userBasicSelection}
  }
`;
