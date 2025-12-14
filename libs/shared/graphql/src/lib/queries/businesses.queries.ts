import { gql } from 'apollo-angular';
import { businessMyBusinessSelection } from '../selections/businesses.selection';

/**
 * Query para obtener el business actual del usuario autenticado
 */
export const GET_MY_BUSINESS_QUERY = gql`
  query MyBusiness {
    myBusiness ${businessMyBusinessSelection}
  }
`;
