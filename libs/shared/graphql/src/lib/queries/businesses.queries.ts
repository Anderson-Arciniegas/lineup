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
 * Query para obtener un business por path
 */
export const GET_BUSINESS_BY_PATH = gql`
  query FindBusinessByPath($path: String!) {
    findBusinessByPath(path: $path) ${businessFullSelection}
  }
`;

/**
 * Query para obtener todos los negocios con paginación
 */
export const FIND_ALL_BUSINESSES_QUERY = gql`
  query FindAllBusinesses($pagination: InfinityScrollInput!) {
    findAllBusinesses(pagination: $pagination) {
      items ${businessFullSelection}
      limit
      page
      total
    }
  }
`;

/**
 * Query para obtener un business por ID
 */
export const FIND_ONE_BUSINESS_QUERY = gql`
  query FindOneBusiness($id: Int!) {
    findOneBusiness(id: $id) ${businessFullSelection}
  }
`;
