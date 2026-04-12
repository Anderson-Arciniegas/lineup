import { inject, Injectable } from '@angular/core';
import {
  FEATURED_PRODUCTS_QUERY,
  FIND_ALL_PRODUCTS_QUERY,
  FIND_LIKED_PRODUCTS_QUERY,
  FIND_ONE_PRODUCT_QUERY,
  GET_ALL_BY_CATALOG_PAGINATED_QUERY,
  GET_ALL_BY_CATALOG_QUERY,
  GET_ALL_BY_TAG_QUERY,
  GET_ALL_BY_TAGS_QUERY,
  GET_ALL_BY_BUSINESS_QUERY,
  GET_ALL_PRIMARY_PRODUCTS_BY_BUSINESS_QUERY,
  GET_MAIN_TAGS_QUERY,
  HAS_LIKED_PRODUCT_QUERY,
  LIKE_PRODUCT_MUTATION,
  PRODUCT_COLLECTIONS_QUERY,
  UNLIKE_PRODUCT_MUTATION,
} from '@libs/graphql';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type {
  GetAllPrimaryProductsByBusinessInput,
  InfinityScrollInput,
  PaginatedProducts,
} from '../../models';
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
    pagination: InfinityScrollInput,
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
    pagination: InfinityScrollInput,
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
    pagination: InfinityScrollInput,
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
    search?: string | null,
  ): Observable<ProductSchema[]> {
    return this.apollo
      .use('userAPI')
      .query<{ getAllByCatalog: ProductSchema[] }>({
        query: GET_ALL_BY_CATALOG_QUERY,
        variables: {
          idCatalog,
          ...(search != null && search !== '' ? { search } : {}),
        },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.getAllByCatalog));
  }

  getAllByCatalogPaginated(
    idCatalog: number,
    pagination: InfinityScrollInput,
  ): Observable<PaginatedProducts> {
    return this.apollo
      .use('userAPI')
      .query<{ getAllByCatalogPaginated: PaginatedProducts }>({
        query: GET_ALL_BY_CATALOG_PAGINATED_QUERY,
        variables: { idCatalog, pagination },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.getAllByCatalogPaginated));
  }

  getAllByTag(
    pagination: InfinityScrollInput,
    tagNameOrSlug: string,
    options?: {
      idBusiness?: number | null;
      idProducts?: number[] | null;
    },
  ): Observable<PaginatedProducts> {
    return this.apollo
      .use('userAPI')
      .query<{ getAllByTag: PaginatedProducts }>({
        query: GET_ALL_BY_TAG_QUERY,
        variables: {
          pagination,
          tagNameOrSlug,
          ...(options?.idBusiness != null ? { idBusiness: options.idBusiness } : {}),
          ...(options?.idProducts != null ? { idProducts: options.idProducts } : {}),
        },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.getAllByTag));
  }

  getAllByTags(
    pagination: InfinityScrollInput,
    tagNamesOrSlugs: string[],
    options?: {
      idBusiness?: number | null;
      idProducts?: number[] | null;
    },
  ): Observable<PaginatedProducts> {
    return this.apollo
      .use('userAPI')
      .query<{ getAllByTags: PaginatedProducts }>({
        query: GET_ALL_BY_TAGS_QUERY,
        variables: {
          pagination,
          tagNamesOrSlugs,
          ...(options?.idBusiness != null ? { idBusiness: options.idBusiness } : {}),
          ...(options?.idProducts != null ? { idProducts: options.idProducts } : {}),
        },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.getAllByTags));
  }

  getAllPrimaryProductsByBusiness(
    data: GetAllPrimaryProductsByBusinessInput,
  ): Observable<ProductSchema[]> {
    const payload: GetAllPrimaryProductsByBusinessInput = {
      idBusiness: Math.trunc(data.idBusiness),
      ...(data.idCatalog != null
        ? { idCatalog: Math.trunc(data.idCatalog) }
        : {}),
    };
    return this.apollo
      .use('userAPI')
      .query<{ getAllPrimaryProductsByBusiness: ProductSchema[] }>({
        query: GET_ALL_PRIMARY_PRODUCTS_BY_BUSINESS_QUERY,
        variables: { data: payload },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.getAllPrimaryProductsByBusiness));
  }

  getAllByBusiness(
    idBusiness: number,
    pagination: InfinityScrollInput,
  ): Observable<PaginatedProducts> {
    return this.apollo
      .use('userAPI')
      .query<{ getAllByBusiness: PaginatedProducts }>({
        query: GET_ALL_BY_BUSINESS_QUERY,
        variables: { idBusiness: Math.trunc(idBusiness), pagination },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.getAllByBusiness));
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
      .pipe(
        map((result) => {
          if (!result.data) {
            throw new Error('No data returned from mutation');
          }
          return result.data.likeProduct;
        }),
      );
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
      .pipe(
        map((result) => {
          if (!result.data) {
            throw new Error('No data returned from mutation');
          }
          return result.data.unlikeProduct;
        }),
      );
  }
}
