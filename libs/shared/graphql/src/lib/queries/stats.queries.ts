import { gql } from 'apollo-angular';

import {
  catalogStatsSelection,
  discountStatsSelection,
  engagementStatsSelection,
  inventoryStatsSelection,
  productStatsSelection,
} from '../selections/stats.selection';

export const BUSINESS_ENGAGEMENT_STATS_QUERY = gql`
  query BusinessEngagementStats($timePeriod: TimePeriodInput) {
    businessEngagementStats(timePeriod: $timePeriod) ${engagementStatsSelection}
  }
`;

export const CATALOG_STATS_QUERY = gql`
  query CatalogStats($limit: Int, $timePeriod: TimePeriodInput) {
    catalogStats(limit: $limit, timePeriod: $timePeriod) ${catalogStatsSelection}
  }
`;

export const DISCOUNT_STATS_QUERY = gql`
  query DiscountStats($days: Int) {
    discountStats(days: $days) ${discountStatsSelection}
  }
`;

export const INVENTORY_STATS_QUERY = gql`
  query InventoryStats($limit: Int, $threshold: Int, $timePeriod: TimePeriodInput) {
    inventoryStats(limit: $limit, threshold: $threshold, timePeriod: $timePeriod) ${inventoryStatsSelection}
  }
`;

export const PRODUCT_STATS_QUERY = gql`
  query ProductStats($limit: Int, $timePeriod: TimePeriodInput) {
    productStats(limit: $limit, timePeriod: $timePeriod) ${productStatsSelection}
  }
`;
