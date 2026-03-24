import { inject, Injectable } from '@angular/core';
import {
  FEATURED_PRODUCTS_QUERY,
  FIND_ALL_PRODUCTS_QUERY,
  FIND_LIKED_PRODUCTS_QUERY,
  FIND_ONE_PRODUCT_QUERY,
  GET_ALL_BY_CATALOG_QUERY,
  GET_ALL_BY_TAG_QUERY,
  GET_ALL_BY_TAGS_QUERY,
  GET_MAIN_TAGS_QUERY,
  HAS_LIKED_PRODUCT_QUERY,
  LIKE_PRODUCT_MUTATION,
  PRODUCT_COLLECTIONS_QUERY,
  UNLIKE_PRODUCT_MUTATION,
} from '@libs/graphql';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { InfinityScrollInput, PaginatedProducts } from '../../models';
import {
  ProductCollectionSchema,
  ProductReactionSchema,
  ProductSchema,
  TagSchema,
} from '../../schemas';

@Injectable({
  providedIn: 'root',
})
export class ProductPublicService {
  private apollo = inject(Apollo);

  featuredProducts(
    pagination: InfinityScrollInput
  ): Observable<PaginatedProducts> {
    return this.apollo
      .use('userAPI')
      .query<{ featuredProducts: PaginatedProducts }>({
        query: FEATURED_PRODUCTS_QUERY,
        variables: { pagination },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.featuredProducts));
  }

  findAllProducts(
    pagination: InfinityScrollInput
  ): Observable<PaginatedProducts> {
    return this.apollo
      .use('userAPI')
      .query<{ findAllProducts: PaginatedProducts }>({
        query: FIND_ALL_PRODUCTS_QUERY,
        variables: { pagination },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.findAllProducts));
  }

  findLikedProducts(
    pagination: InfinityScrollInput
  ): Observable<PaginatedProducts> {
    return this.apollo
      .use('userAPI')
      .query<{ findLikedProducts: PaginatedProducts }>({
        query: FIND_LIKED_PRODUCTS_QUERY,
        variables: { pagination },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.findLikedProducts));
  }

  findOneProduct(id: number): Observable<ProductSchema> {
    return this.apollo
      .use('userAPI')
      .query<{ findOneProduct: ProductSchema }>({
        query: FIND_ONE_PRODUCT_QUERY,
        variables: { id },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.findOneProduct));
  }

  getAllByCatalog(
    idCatalog: number,
    pagination: InfinityScrollInput
  ): Observable<PaginatedProducts> {
    return this.apollo
      .use('userAPI')
      .query<{ getAllByCatalog: PaginatedProducts }>({
        query: GET_ALL_BY_CATALOG_QUERY,
        variables: { idCatalog, pagination },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.getAllByCatalog));
  }

  getAllByTag(
    pagination: InfinityScrollInput,
    tagNameOrSlug: string
  ): Observable<PaginatedProducts> {
    return this.apollo
      .use('userAPI')
      .query<{ getAllByTag: PaginatedProducts }>({
        query: GET_ALL_BY_TAG_QUERY,
        variables: { pagination, tagNameOrSlug },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.getAllByTag));
  }

  getAllByTags(
    pagination: InfinityScrollInput,
    tagNamesOrSlugs: string[]
  ): Observable<PaginatedProducts> {
    return this.apollo
      .use('userAPI')
      .query<{ getAllByTags: PaginatedProducts }>({
        query: GET_ALL_BY_TAGS_QUERY,
        variables: { pagination, tagNamesOrSlugs },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.getAllByTags));
  }

  productCollections(): Observable<ProductCollectionSchema[]> {
    return this.apollo
      .use('userAPI')
      .query<{ productCollections: ProductCollectionSchema[] }>({
        query: PRODUCT_COLLECTIONS_QUERY,
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.productCollections));
  }

  getMainTags(limit?: number): Observable<TagSchema[]> {
    return this.apollo
      .use('userAPI')
      .query<{ getMainTags: TagSchema[] }>({
        query: GET_MAIN_TAGS_QUERY,
        variables: { limit },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.getMainTags));
  }

  hasLikedProduct(idProduct: number): Observable<boolean> {
    return this.apollo
      .use('userAPI')
      .query<{ hasLikedProduct: boolean }>({
        query: HAS_LIKED_PRODUCT_QUERY,
        variables: { idProduct },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.hasLikedProduct));
  }

  likeProduct(idProduct: number): Observable<ProductReactionSchema> {
    return this.apollo
      .use('userAPI')
      .mutate<{ likeProduct: ProductReactionSchema }>({
        mutation: LIKE_PRODUCT_MUTATION,
        variables: { idProduct },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.likeProduct));
  }

  unlikeProduct(idProduct: number): Observable<boolean> {
    return this.apollo
      .use('userAPI')
      .mutate<{ unlikeProduct: boolean }>({
        mutation: UNLIKE_PRODUCT_MUTATION,
        variables: { idProduct },
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data!.unlikeProduct));
  }
}
