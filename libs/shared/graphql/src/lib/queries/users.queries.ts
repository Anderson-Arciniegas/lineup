import { gql } from 'apollo-angular';
import {
  businessFullSelection,
  businessSearchSelection,
} from '../selections/businesses.selection';
import {
  catalogSearchSelection,
  catalogSelection,
} from '../selections/catalog.selection';
import {
  productRatingSelection,
  productSearchSelection,
  productSelection,
} from '../selections/product.selection';
import {
  userBasicSelection,
  userFullSelection,
} from '../selections/users.selection';

/**
 * Query para obtener el usuario actual autenticado
 */
export const GET_ME_QUERY = gql`
  query Me {
    me ${userFullSelection}
  }
`;

/**
 * Query para obtener un usuario por ID
 */
export const GET_USER_BY_ID_QUERY = gql`
  query GetUser($id: Int!) {
    userById(id: $id) ${userBasicSelection}
  }
`;

/**
 * Query para comprobar si el usuario sigue un negocio
 */
export const IS_FOLLOWING_BUSINESS_QUERY = gql`
  query IsFollowingBusiness($idBusiness: Int!) {
    isFollowingBusiness(idBusiness: $idBusiness)
  }
`;

/**
 * Query para comprobar si el usuario ha dado like a un producto
 */
export const HAS_LIKED_PRODUCT_QUERY = gql`
  query HasLikedProduct($idProduct: Int!) {
    hasLikedProduct(idProduct: $idProduct)
  }
`;

/**
 * Query para obtener negocios destacados
 */
export const FEATURED_BUSINESSES_QUERY = gql`
  query FeaturedBusinesses($pagination: InfinityScrollInput!) {
    featuredBusinesses(pagination: $pagination) {
      items ${businessFullSelection}
      limit
      page
      total
    }
  }
`;

/**
 * Query para obtener catálogos destacados
 */
export const FEATURED_CATALOGS_QUERY = gql`
  query FeaturedCatalogs($pagination: InfinityScrollInput!) {
    featuredCatalogs(pagination: $pagination) {
      items ${catalogSelection}
      limit
      page
      total
    }
  }
`;

/**
 * Query para obtener productos destacados
 */
export const FEATURED_PRODUCTS_QUERY = gql`
  query FeaturedProducts($pagination: InfinityScrollInput!) {
    featuredProducts(pagination: $pagination) {
      items ${productSelection}
      limit
      page
      total
    }
  }
`;

/**
 * Query para búsqueda unificada (negocios, catálogos, productos)
 */
export const SEARCH_QUERY = gql`
  query Search($pagination: InfinityScrollInput!, $target: SearchTargetEnum!) {
    search(pagination: $pagination, target: $target) {
      items {
        __typename
        ... on BusinessSchema ${businessSearchSelection}
        ... on CatalogSchema ${catalogSearchSelection}
        ... on ProductSchema ${productSearchSelection}
      }
      limit
      page
      total
    }
  }
`;

/**
 * Query para obtener productos que el usuario ha dado like
 */
export const FIND_LIKED_PRODUCTS_QUERY = gql`
  query FindLikedProducts($pagination: InfinityScrollInput!) {
    findLikedProducts(pagination: $pagination) {
      items ${productSelection}
      limit
      page
      total
    }
  }
`;

/**
 * Query para obtener negocios que el usuario sigue
 */
export const FIND_FOLLOWED_BUSINESSES_QUERY = gql`
  query FindFollowedBusinesses($pagination: InfinityScrollInput!) {
    findFollowedBusinesses(pagination: $pagination) {
      items ${businessFullSelection}
      limit
      page
      total
    }
  }
`;

/**
 * Query para obtener las valoraciones de productos del usuario
 */
export const MY_PRODUCT_RATINGS_QUERY = gql`
  query MyProductRatings($pagination: InfinityScrollInput!) {
    myProductRatings(pagination: $pagination) {
      items ${productRatingSelection}
      limit
      page
      total
    }
  }
`;

/**
 * Query para obtener una valoración de producto por id de producto
 */
export const MY_PRODUCT_RATING_QUERY = gql`
  query MyProductRating($idProduct: Int!) {
    myProductRating(idProduct: $idProduct) ${productRatingSelection}
  }
`;
