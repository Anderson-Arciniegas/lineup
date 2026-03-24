import { inject, Injectable } from '@angular/core';

import {
  CREATE_DISCOUNT_MUTATION,
  FIND_ACTIVE_DISCOUNT_BY_PRODUCT_QUERY,
  FIND_ALL_MY_DISCOUNTS_BY_SCOPE_QUERY,
  FIND_DISCOUNT_AUDIT_BY_DISCOUNT_QUERY,
  FIND_DISCOUNT_AUDIT_BY_PRODUCT_QUERY,
  FIND_ONE_DISCOUNT_QUERY,
  REMOVE_DISCOUNT_MUTATION,
  UPDATE_DISCOUNT_MUTATION,
} from '@libs/graphql';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClient } from '.';
import type { InfinityScrollInput } from '../../models/catalog.model';
import type {
  CreateDiscountInput,
  FindDiscountsByScopeInput,
  PaginatedDiscounts,
  UpdateDiscountInput,
} from '../../models/discount.model';
import type {
  DiscountProductAuditSchema,
  DiscountSchema,
} from '../../schemas';

@Injectable({
  providedIn: 'root',
})
export class DiscountPrivateService {
  private apollo = inject(Apollo);

  findActiveDiscountByProduct(idProduct: number): Observable<DiscountSchema | null> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .query<{ findActiveDiscountByProduct: DiscountSchema | null }>({
        query: FIND_ACTIVE_DISCOUNT_BY_PRODUCT_QUERY,
        variables: { idProduct: Math.trunc(idProduct) },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.findActiveDiscountByProduct));
  }

  findAllMyDiscountsByScope(
    data: FindDiscountsByScopeInput,
    pagination: InfinityScrollInput
  ): Observable<PaginatedDiscounts> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .query<{ findAllMyDiscountsByScope: PaginatedDiscounts }>({
        query: FIND_ALL_MY_DISCOUNTS_BY_SCOPE_QUERY,
        variables: { data, pagination },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.findAllMyDiscountsByScope));
  }

  findDiscountAuditByDiscount(
    idDiscount: number,
    limit?: number
  ): Observable<DiscountProductAuditSchema[]> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .query<{ findDiscountAuditByDiscount: DiscountProductAuditSchema[] }>({
        query: FIND_DISCOUNT_AUDIT_BY_DISCOUNT_QUERY,
        variables: { idDiscount: Math.trunc(idDiscount), limit },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.findDiscountAuditByDiscount));
  }

  findDiscountAuditByProduct(
    idProduct: number,
    limit?: number
  ): Observable<DiscountProductAuditSchema[]> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .query<{ findDiscountAuditByProduct: DiscountProductAuditSchema[] }>({
        query: FIND_DISCOUNT_AUDIT_BY_PRODUCT_QUERY,
        variables: { idProduct: Math.trunc(idProduct), limit },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.findDiscountAuditByProduct));
  }

  findOneDiscount(id: number): Observable<DiscountSchema> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .query<{ findOneDiscount: DiscountSchema }>({
        query: FIND_ONE_DISCOUNT_QUERY,
        variables: { id: Math.trunc(id) },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.findOneDiscount));
  }

  createDiscount(data: CreateDiscountInput): Observable<DiscountSchema> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .mutate<{ createDiscount: DiscountSchema }>({
        mutation: CREATE_DISCOUNT_MUTATION,
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
          return result.data.createDiscount;
        })
      );
  }

  removeDiscount(id: number): Observable<boolean> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .mutate<{ removeDiscount: boolean }>({
        mutation: REMOVE_DISCOUNT_MUTATION,
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
          return result.data.removeDiscount;
        })
      );
  }

  updateDiscount(data: UpdateDiscountInput): Observable<DiscountSchema> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .mutate<{ updateDiscount: DiscountSchema }>({
        mutation: UPDATE_DISCOUNT_MUTATION,
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
          return result.data.updateDiscount;
        })
      );
  }
}
