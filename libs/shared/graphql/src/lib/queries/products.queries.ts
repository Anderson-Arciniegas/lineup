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

export const GET_ALL_DRAFT_PRODUCTS_QUERY = gql`
  query GetAllDraftProducts($pagination: InfinityScrollInput!) {
    getAllDraftProducts(pagination: $pagination) {
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
  query GetAllByCatalog($idCatalog: Int!, $search: String) {
    getAllByCatalog(idCatalog: $idCatalog, search: $search) ${productSelection}
  }
`;

export const GET_ALL_BY_CATALOG_PAGINATED_QUERY = gql`
  query GetAllByCatalogPaginated($idCatalog: Int!, $pagination: InfinityScrollInput!) {
    getAllByCatalogPaginated(idCatalog: $idCatalog, pagination: $pagination) {
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
  query GetAllByTag(
    $idBusiness: Int
    $idProducts: [Int!]
    $pagination: InfinityScrollInput!
    $tagNameOrSlug: String!
  ) {
    getAllByTag(
      idBusiness: $idBusiness
      idProducts: $idProducts
      pagination: $pagination
      tagNameOrSlug: $tagNameOrSlug
    ) {
      items ${productSelection}
      limit
      page
      total
    }
  }
`;

export const GET_ALL_BY_TAGS_QUERY = gql`
  query GetAllByTags(
    $idBusiness: Int
    $idProducts: [Int!]
    $pagination: InfinityScrollInput!
    $tagNamesOrSlugs: [String!]!
  ) {
    getAllByTags(
      idBusiness: $idBusiness
      idProducts: $idProducts
      pagination: $pagination
      tagNamesOrSlugs: $tagNamesOrSlugs
    ) {
      items ${productSelection}
      limit
      page
      total
    }
  }
`;

export const GET_ALL_PRIMARY_PRODUCTS_BY_BUSINESS_QUERY = gql`
  query GetAllPrimaryProductsByBusiness($data: GetAllPrimaryProductsByBusinessInput!) {
    getAllPrimaryProductsByBusiness(data: $data) ${productSelection}
  }
`;

export const GET_ALL_BY_BUSINESS_QUERY = gql`
  query GetAllByBusiness($idBusiness: Int!, $pagination: InfinityScrollInput!) {
    getAllByBusiness(idBusiness: $idBusiness, pagination: $pagination) {
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
