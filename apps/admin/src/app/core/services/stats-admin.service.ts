import { inject, Injectable } from '@angular/core';
import {
  type AdminDiscountGlobalQueryInput,
  type AdminBusinessStatsSchema,
  type AdminCatalogGlobalStatsSchema,
  type AdminDiscountGlobalStatsSchema,
  type AdminPlatformEngagementStatsSchema,
  type AdminUserStatsSchema,
} from '../schemas';
import { ADMIN_APOLLO_CLIENT } from '../constants/admin-apollo-client';
import {
  ADMIN_BUSINESS_STATS_QUERY,
  ADMIN_CATALOG_GLOBAL_STATS_QUERY,
  ADMIN_DISCOUNT_GLOBAL_STATS_QUERY,
  ADMIN_PLATFORM_ENGAGEMENT_STATS_QUERY,
  ADMIN_USER_STATS_QUERY,
} from '../graphql/queries/admin-stats.queries';
import type { TimePeriodInput } from '@lineup/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class StatsAdminService {
  private readonly apollo = inject(Apollo);

  adminBusinessStats(
    timePeriod?: TimePeriodInput | null,
  ): Observable<AdminBusinessStatsSchema> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .query<{ adminBusinessStats: AdminBusinessStatsSchema }>({
        query: ADMIN_BUSINESS_STATS_QUERY,
        variables: { timePeriod },
        fetchPolicy: 'network-only',
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data.adminBusinessStats));
  }

  adminCatalogGlobalStats(): Observable<AdminCatalogGlobalStatsSchema> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .query<{ adminCatalogGlobalStats: AdminCatalogGlobalStatsSchema }>({
        query: ADMIN_CATALOG_GLOBAL_STATS_QUERY,
        fetchPolicy: 'network-only',
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data.adminCatalogGlobalStats));
  }

  adminDiscountGlobalStats(
    query?: AdminDiscountGlobalQueryInput | null,
  ): Observable<AdminDiscountGlobalStatsSchema> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .query<{ adminDiscountGlobalStats: AdminDiscountGlobalStatsSchema }>({
        query: ADMIN_DISCOUNT_GLOBAL_STATS_QUERY,
        variables: { query },
        fetchPolicy: 'network-only',
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data.adminDiscountGlobalStats));
  }

  adminPlatformEngagementStats(
    timePeriod?: TimePeriodInput | null,
  ): Observable<AdminPlatformEngagementStatsSchema> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .query<{ adminPlatformEngagementStats: AdminPlatformEngagementStatsSchema }>(
        {
          query: ADMIN_PLATFORM_ENGAGEMENT_STATS_QUERY,
          variables: { timePeriod },
          fetchPolicy: 'network-only',
          context: { withCredentials: true },
        },
      )
      .pipe(map((r) => r.data.adminPlatformEngagementStats));
  }

  adminUserStats(
    timePeriod?: TimePeriodInput | null,
  ): Observable<AdminUserStatsSchema> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .query<{ adminUserStats: AdminUserStatsSchema }>({
        query: ADMIN_USER_STATS_QUERY,
        variables: { timePeriod },
        fetchPolicy: 'network-only',
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data.adminUserStats));
  }
}
