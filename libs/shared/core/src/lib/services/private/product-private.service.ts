import { inject, Injectable } from '@angular/core';

import {
  ADJUST_STOCK_MUTATION,
  CREATE_PRODUCT_MUTATION,
  FIND_ALL_PRODUCTS_QUERY,
  FIND_ONE_PRODUCT_QUERY,
  GET_ALL_BY_CATALOG_PAGINATED_QUERY,
  GET_ALL_BY_CATALOG_QUERY,
  GET_ALL_BY_TAG_QUERY,
  GET_ALL_PRIMARY_PRODUCTS_BY_BUSINESS_QUERY,
  GET_STOCK_BY_PRODUCT_QUERY,
  GET_STOCK_HISTORY_QUERY,
  REGISTER_SALE_MUTATION,
  REMOVE_PRODUCT_MUTATION,
  REMOVE_PRODUCT_SKU_MUTATION,
  TOGGLE_PRODUCT_IS_PRIMARY_MUTATION,
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
  GetAllPrimaryProductsByBusinessInput,
  InfinityScrollInput,
  PaginatedProducts,
  SalesInput,
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
    search?: string | null,
  ): Observable<ProductSchema[]> {
    return this.apollo
      .use(ApiClient.BUSINESS)
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
      .use(ApiClient.BUSINESS)
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
      .use(ApiClient.BUSINESS)
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
      .use(ApiClient.BUSINESS)
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

  removeProductSku(idProductSku: number): Observable<boolean> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .mutate<{ removeProductSku: boolean }>({
        mutation: REMOVE_PRODUCT_SKU_MUTATION,
        variables: { idProductSku: Math.trunc(idProductSku) },
        context: {
          withCredentials: true,
        },
      })
      .pipe(
        map((result) => {
          if (!result.data) {
            throw new Error('No data returned from mutation');
          }
          return result.data.removeProductSku;
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

  registerSale(data: SalesInput): Observable<ProductSkuSchema[]> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .mutate<{ registerSale: ProductSkuSchema[] }>({
        mutation: REGISTER_SALE_MUTATION,
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
          return result.data.registerSale;
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

  toggleProductIsPrimary(idProduct: number): Observable<ProductSchema> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .mutate<{ toggleProductIsPrimary: ProductSchema }>({
        mutation: TOGGLE_PRODUCT_IS_PRIMARY_MUTATION,
        variables: { idProduct: Math.trunc(idProduct) },
        context: {
          withCredentials: true,
        },
      })
      .pipe(
        map((result) => {
          if (!result.data) {
            throw new Error('No data returned from mutation');
          }
          return result.data.toggleProductIsPrimary;
        }),
      );
  }
}
