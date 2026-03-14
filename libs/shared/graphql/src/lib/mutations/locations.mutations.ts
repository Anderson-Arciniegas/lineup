import { gql } from 'apollo-angular';
import { locationFullSelection } from '../selections/location.selection';

/**
 * Mutation para crear una nueva ubicación
 */
export const CREATE_LOCATION_MUTATION = gql`
  mutation CreateLocation($data: CreateLocationInput!) {
    createLocation(data: $data) ${locationFullSelection}
  }
`;

/**
 * Mutation para actualizar una ubicación
 */
export const UPDATE_LOCATION_MUTATION = gql`
  mutation UpdateLocation($data: UpdateLocationInput!) {
    updateLocation(data: $data) ${locationFullSelection}
  }
`;

/**
 * Mutation para eliminar una ubicación
 */
export const REMOVE_LOCATION_MUTATION = gql`
  mutation RemoveLocation($id: Float!) {
    removeLocation(id: $id)
  }
`;
