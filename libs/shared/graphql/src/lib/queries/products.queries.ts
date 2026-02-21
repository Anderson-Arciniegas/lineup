import { gql } from 'apollo-angular';
import { productSelection } from '../selections/product.selection';

export const FIND_ALL_PRODUCTS_QUERY = gql`
  query FindAllProducts($pagination: InfinityScrollInput!) {
    findAllProducts(pagination: $pagination) {
      items ${productSelection}
      limit
      page
      total
    }
  }
`;

export const FIND_ONE_PRODUCT_QUERY = gql`
  query FindOneProduct($id: Int!) {
    findOneProduct(id: $id) ${productSelection}
  }
`;

export const GET_ALL_BY_CATALOG_QUERY = gql`
  query GetAllByCatalog($idCatalog: Int!, $pagination: InfinityScrollInput!) {
    getAllByCatalog(idCatalog: $idCatalog, pagination: $pagination) {
      items ${productSelection}
      limit
      page
      total
    }
  }
`;
