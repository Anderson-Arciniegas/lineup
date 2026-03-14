import { gql } from 'apollo-angular';
import { locationFullSelection } from '../selections/location.selection';

/**
 * Query para obtener todas las ubicaciones del business del usuario autenticado
 */
export const FIND_ALL_MY_LOCATIONS_QUERY = gql`
  query FindAllMyLocations {
    findAllMyLocations ${locationFullSelection}
  }
`;

/**
 * Query para obtener una ubicación por ID
 */
export const FIND_ONE_LOCATION_QUERY = gql`
  query FindOneLocation($id: Int!) {
    findOneLocation(id: $id) ${locationFullSelection}
  }
`;
