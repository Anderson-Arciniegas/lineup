import { gql } from 'apollo-angular';
import {
  businessFullSelection,
  businessMyBusinessSelection,
} from '../selections/businesses.selection';

/**
 * Query para obtener el business actual del usuario autenticado
 */
export const GET_MY_BUSINESS_QUERY = gql`
  query MyBusiness {
    myBusiness ${businessMyBusinessSelection}
  }
`;

/**
 * Query para obtener un business por ID
 */
export const GET_BUSINESS_BY_PATH = gql`
  query FindBusinessByPath($path: String!) {
    findBusinessByPath(path: $path) ${businessFullSelection}
  }
`;
