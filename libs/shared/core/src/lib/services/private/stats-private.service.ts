import { inject, Injectable } from '@angular/core';

import {
  BUSINESS_ENGAGEMENT_STATS_QUERY,
  CATALOG_STATS_QUERY,
  DISCOUNT_STATS_QUERY,
  INVENTORY_STATS_QUERY,
  PRODUCT_STATS_QUERY,
} from '@libs/graphql';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type { TimePeriodInput } from '../../models/stats.model';
import type {
  CatalogStatsSchema,
  DiscountStatsSchema,
  EngagementStatsSchema,
  InventoryStatsSchema,
  ProductStatsSchema,
} from '../../schemas';
import { ApiClient } from '.';

@Injectable({
  providedIn: 'root',
})
export class StatsPrivateService {
  private apollo = inject(Apollo);

  businessEngagementStats(
    timePeriod?: TimePeriodInput | null
  ): Observable<EngagementStatsSchema> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .query<{ businessEngagementStats: EngagementStatsSchema }>({
        query: BUSINESS_ENGAGEMENT_STATS_QUERY,
        variables: { timePeriod: timePeriod ?? null },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.businessEngagementStats));
  }

  catalogStats(
    timePeriod?: TimePeriodInput | null,
    limit?: number
  ): Observable<CatalogStatsSchema> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .query<{ catalogStats: CatalogStatsSchema }>({
        query: CATALOG_STATS_QUERY,
        variables: { limit, timePeriod: timePeriod ?? null },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.catalogStats));
  }

  discountStats(days?: number | null): Observable<DiscountStatsSchema> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .query<{ discountStats: DiscountStatsSchema }>({
        query: DISCOUNT_STATS_QUERY,
        variables: { days: days ?? null },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.discountStats));
  }

  inventoryStats(
    timePeriod?: TimePeriodInput | null,
    limit?: number,
    threshold?: number
  ): Observable<InventoryStatsSchema> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .query<{ inventoryStats: InventoryStatsSchema }>({
        query: INVENTORY_STATS_QUERY,
        variables: { limit, threshold, timePeriod: timePeriod ?? null },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.inventoryStats));
  }

  productStats(
    timePeriod?: TimePeriodInput | null,
    limit?: number
  ): Observable<ProductStatsSchema> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .query<{ productStats: ProductStatsSchema }>({
        query: PRODUCT_STATS_QUERY,
        variables: { limit, timePeriod: timePeriod ?? null },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.productStats));
  }
}
