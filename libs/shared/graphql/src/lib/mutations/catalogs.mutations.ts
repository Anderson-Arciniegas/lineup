import { gql } from 'apollo-angular';
import { catalogSelection } from '../selections/catalog.selection';

/**
 * Mutation para crear un catálogo
 */
export const CREATE_CATALOG_MUTATION = gql`
  mutation CreateCatalog($data: CreateCatalogInput!) {
    createCatalog(data: $data) ${catalogSelection}
  }
`;

/**
 * Mutation para eliminar un catálogo
 */
export const REMOVE_CATALOG_MUTATION = gql`
  mutation RemoveCatalog($id: Float!) {
    removeCatalog(id: $id) ${catalogSelection}
  }
`;

/**
 * Mutation para actualizar un catálogo
 */
export const UPDATE_CATALOG_MUTATION = gql`
  mutation UpdateCatalog($data: UpdateCatalogInput!) {
    updateCatalog(data: $data) ${catalogSelection}
  }
`;
