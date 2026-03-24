import { inject, Injectable } from '@angular/core';

import {
  ADJUST_STOCK_MUTATION,
  CREATE_PRODUCT_MUTATION,
  FIND_ALL_PRODUCTS_QUERY,
  FIND_ONE_PRODUCT_QUERY,
  GET_ALL_BY_CATALOG_QUERY,
  GET_ALL_BY_TAG_QUERY,
  GET_STOCK_BY_PRODUCT_QUERY,
  GET_STOCK_HISTORY_QUERY,
  REMOVE_PRODUCT_MUTATION,
  UPDATE_PRODUCT_MUTATION,
  UPDATE_PRODUCT_SKUS_MUTATION,
} from '@libs/graphql';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClient } from '.';
import {
  AdjustStockInput,
  CreateProductInput,
  InfinityScrollInput,
  PaginatedProducts,
  UpdateProductInput,
  UpdateProductSkusInput,
} from '../../models/product.model';
import {
  ProductSchema,
  ProductSkuSchema,
  StockMovementSchema,
} from '../../schemas';

@Injectable({
  providedIn: 'root',
})
export class ProductPrivateService {
  private apollo = inject(Apollo);

  findAllProducts(
    pagination: InfinityScrollInput,
  ): Observable<PaginatedProducts> {
    return this.apollo
      .use(ApiClient.BUSINESS)
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

  getAllByCatalog(
    idCatalog: number,
    pagination: InfinityScrollInput,
  ): Observable<PaginatedProducts> {
    return this.apollo
      .use(ApiClient.BUSINESS)
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
    tagNameOrSlug: string,
  ): Observable<PaginatedProducts> {
    return this.apollo
      .use(ApiClient.BUSINESS)
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

  findOneProduct(id: number): Observable<ProductSchema> {
    return this.apollo
      .use(ApiClient.BUSINESS)
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

  createProduct(data: CreateProductInput): Observable<ProductSchema> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .mutate<{ createProduct: ProductSchema }>({
        mutation: CREATE_PRODUCT_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(
        map((result) => {
          if (!result.data) {
            throw new Error('No data returned from mutation');
          }
          return result.data.createProduct;
        }),
      );
  }

  updateProduct(data: UpdateProductInput): Observable<ProductSchema> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .mutate<{ updateProduct: ProductSchema }>({
        mutation: UPDATE_PRODUCT_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(
        map((result) => {
          if (!result.data) {
            throw new Error('No data returned from mutation');
          }
          return result.data.updateProduct;
        }),
      );
  }

  removeProduct(id: number): Observable<boolean> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .mutate<{ removeProduct: boolean }>({
        mutation: REMOVE_PRODUCT_MUTATION,
        variables: { id: Math.trunc(id) },
        context: {
          withCredentials: true,
        },
      })
      .pipe(
        map((result) => {
          if (!result.data) {
            throw new Error('No data returned from mutation');
          }
          return result.data.removeProduct;
        }),
      );
  }

  getStockByProduct(idProduct: number): Observable<ProductSkuSchema[]> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .query<{ getStockByProduct: ProductSkuSchema[] }>({
        query: GET_STOCK_BY_PRODUCT_QUERY,
        variables: { idProduct: Math.trunc(idProduct) },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.getStockByProduct));
  }

  getStockHistory(
    idProductSku: number | null,
    limit = 50,
    offset = 0,
  ): Observable<StockMovementSchema[]> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .query<{ getStockHistory: StockMovementSchema[] }>({
        query: GET_STOCK_HISTORY_QUERY,
        variables: {
          idProductSku: idProductSku ?? undefined,
          limit,
          offset,
        },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.getStockHistory));
  }

  adjustStock(data: AdjustStockInput): Observable<ProductSkuSchema> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .mutate<{ adjustStock: ProductSkuSchema }>({
        mutation: ADJUST_STOCK_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(
        map((result) => {
          if (!result.data) {
            throw new Error('No data returned from mutation');
          }
          return result.data.adjustStock;
        }),
      );
  }

  updateProductSkus(
    data: UpdateProductSkusInput,
  ): Observable<ProductSkuSchema[]> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .mutate<{ updateProductSkus: ProductSkuSchema[] }>({
        mutation: UPDATE_PRODUCT_SKUS_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(
        map((result) => {
          if (!result.data) {
            throw new Error('No data returned from mutation');
          }
          return result.data.updateProductSkus;
        }),
      );
  }
}
