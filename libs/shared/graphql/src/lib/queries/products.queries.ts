import { gql } from 'apollo-angular';
import {
  productSelection,
  productSkuSelection,
  stockMovementSelection,
  tagMainSelection,
} from '../selections/product.selection';

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

export const GET_MAIN_TAGS_QUERY = gql`
  query GetMainTags($limit: Int) {
    getMainTags(limit: $limit) ${tagMainSelection}
  }
`;

export const GET_ALL_BY_TAG_QUERY = gql`
  query GetAllByTag($pagination: InfinityScrollInput!, $tagNameOrSlug: String!) {
    getAllByTag(pagination: $pagination, tagNameOrSlug: $tagNameOrSlug) {
      items ${productSelection}
      limit
      page
      total
    }
  }
`;

export const GET_ALL_BY_TAGS_QUERY = gql`
  query GetAllByTags($pagination: InfinityScrollInput!, $tagNamesOrSlugs: [String!]!) {
    getAllByTags(pagination: $pagination, tagNamesOrSlugs: $tagNamesOrSlugs) {
      items ${productSelection}
      limit
      page
      total
    }
  }
`;

export const GET_STOCK_BY_PRODUCT_QUERY = gql`
  query GetStockByProduct($idProduct: Int!) {
    getStockByProduct(idProduct: $idProduct) ${productSkuSelection}
  }
`;

export const GET_STOCK_HISTORY_QUERY = gql`
  query GetStockHistory($idProductSku: Int, $limit: Int, $offset: Int) {
    getStockHistory(idProductSku: $idProductSku, limit: $limit, offset: $offset) ${stockMovementSelection}
  }
`;
