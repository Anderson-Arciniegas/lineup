import { gql } from 'apollo-angular';
import {
  businessFullSelection,
  businessSearchSelection,
} from '../selections/businesses.selection';
import {
  catalogSearchSelection,
  catalogSelection,
} from '../selections/catalog.selection';
import { discountWithoutDiscountProductsSelection } from '../selections/discount.selection';
import {
  productCollectionSelection,
  productRatingSelection,
  productSearchSelection,
  productSelection,
} from '../selections/product.selection';
import {
  userBasicSelection,
  userFullSelection,
} from '../selections/users.selection';

/** Negocios seguidos con descuentos (el dashboard del usuario filtra promociones activas). */
const businessFollowedItemsSelection = `${businessFullSelection.slice(0, -1)}
  discounts ${discountWithoutDiscountProductsSelection}
}`;

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
 * Query unificada para obtener colecciones destacadas (negocios, catálogos, productos)
 */
export const FEATURED_COLLECTIONS_QUERY = gql`
  query Featured($pagination: InfinityScrollInput!) {
    featured(pagination: $pagination) {
      featuredBusinesses ${businessFullSelection}
      featuredCatalogs ${catalogSelection}
      featuredProducts ${productSelection}
      recentlyAddedProducts ${productSelection}
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
  query Search(
    $pagination: InfinityScrollInput!
    $target: SearchTargetEnum!
    $productFilters: ProductSearchFiltersInput
  ) {
    search(
      pagination: $pagination
      target: $target
      productFilters: $productFilters
    ) {
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
      items ${businessFollowedItemsSelection}
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

/**
 * Query para obtener valoraciones de un producto (paginadas)
 */
export const PRODUCT_RATINGS_QUERY = gql`
  query ProductRatings($idProduct: Int!, $pagination: InfinityScrollInput!) {
    productRatings(idProduct: $idProduct, pagination: $pagination) {
      items ${productRatingSelection}
      limit
      page
      total
    }
  }
`;

/**
 * Query para obtener colecciones de productos
 */
export const PRODUCT_COLLECTIONS_QUERY = gql`
  query ProductCollections {
    productCollections ${productCollectionSelection}
  }
`;
