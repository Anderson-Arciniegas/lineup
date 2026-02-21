import { inject, Injectable } from '@angular/core';

import {
  CREATE_PRODUCT_MUTATION,
  FIND_ALL_PRODUCTS_QUERY,
  FIND_ONE_PRODUCT_QUERY,
  GET_ALL_BY_CATALOG_QUERY,
  REMOVE_PRODUCT_MUTATION,
  UPDATE_PRODUCT_MUTATION,
} from '@libs/graphql';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClient } from '.';
import {
  CreateProductInput,
  InfinityScrollInput,
  PaginatedProducts,
  UpdateProductInput,
} from '../models/product.model';
import { ProductSchema } from '../schemas';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apollo = inject(Apollo);

  findAllProducts(
    pagination: InfinityScrollInput
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
    pagination: InfinityScrollInput
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
        })
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
        })
      );
  }

  removeProduct(id: number): Observable<ProductSchema> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .mutate<{ removeProduct: ProductSchema }>({
        mutation: REMOVE_PRODUCT_MUTATION,
        variables: { id },
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
        })
      );
  }
}
