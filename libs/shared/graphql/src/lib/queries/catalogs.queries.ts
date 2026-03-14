import { gql } from 'apollo-angular';
import { catalogSelection } from '../selections/catalog.selection';

export const FIND_ALL_CATALOGS_QUERY = gql`
  query FindAllCatalogs($pagination: InfinityScrollInput!) {
    findAllCatalogs(pagination: $pagination) {
      items ${catalogSelection}
      limit
      page
      total
    }
  }
`;

export const FIND_ALL_MY_CATALOGS_QUERY = gql`
  query FindAllMyCatalogs($pagination: InfinityScrollInput!) {
    findAllMyCatalogs(pagination: $pagination) {
      items ${catalogSelection}
      limit
      page
      total
    }
  }
`;

export const FIND_CATALOGS_BY_BUSINESS_ID_QUERY = gql`
  query FindCatalogsByBusinessId($idBusiness: Int!, $pagination: InfinityScrollInput!) {
    findCatalogsByBusinessId(idBusiness: $idBusiness, pagination: $pagination) {
      items ${catalogSelection}
      limit
      page
      total
    }
  }
`;

export const FIND_ONE_CATALOG_QUERY = gql`
  query FindOneCatalog($id: Int!) {
    findOneCatalog(id: $id) ${catalogSelection}
  }
`;

export const FIND_ONE_CATALOG_BY_PATH_QUERY = gql`
  query FindOneCatalogByPath($path: String!) {
    findOneCatalogByPath(path: $path) ${catalogSelection}
  }
`;
