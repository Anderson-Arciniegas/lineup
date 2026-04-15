import { gql } from 'apollo-angular';
import {
  adminBusinessStatsSelection,
  adminCatalogGlobalStatsSelection,
  adminDiscountGlobalStatsSelection,
  adminPlatformEngagementStatsSelection,
  adminUserStatsSelection,
} from '../selections/admin-stats.selection';

export const ADMIN_BUSINESS_STATS_QUERY = gql`
  query AdminBusinessStats($timePeriod: TimePeriodInput) {
    adminBusinessStats(timePeriod: $timePeriod) ${adminBusinessStatsSelection}
  }
`;

export const ADMIN_CATALOG_GLOBAL_STATS_QUERY = gql`
  query AdminCatalogGlobalStats {
    adminCatalogGlobalStats ${adminCatalogGlobalStatsSelection}
  }
`;

export const ADMIN_DISCOUNT_GLOBAL_STATS_QUERY = gql`
  query AdminDiscountGlobalStats($query: AdminDiscountGlobalQueryInput) {
    adminDiscountGlobalStats(query: $query) ${adminDiscountGlobalStatsSelection}
  }
`;

export const ADMIN_PLATFORM_ENGAGEMENT_STATS_QUERY = gql`
  query AdminPlatformEngagementStats($timePeriod: TimePeriodInput) {
    adminPlatformEngagementStats(timePeriod: $timePeriod) ${adminPlatformEngagementStatsSelection}
  }
`;

export const ADMIN_USER_STATS_QUERY = gql`
  query AdminUserStats($timePeriod: TimePeriodInput) {
    adminUserStats(timePeriod: $timePeriod) ${adminUserStatsSelection}
  }
`;
