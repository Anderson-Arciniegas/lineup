import { gql } from 'apollo-angular';

import {
  catalogStatsSelection,
  discountStatsSelection,
  engagementStatsSelection,
  inventoryStatsSelection,
  productStatsSelection,
} from '../selections/stats.selection';

export const BUSINESS_ENGAGEMENT_STATS_QUERY = gql`
  query BusinessEngagementStats($timePeriod: TimePeriodInput!) {
    businessEngagementStats(timePeriod: $timePeriod) ${engagementStatsSelection}
  }
`;

export const CATALOG_STATS_QUERY = gql`
  query CatalogStats($timePeriod: TimePeriodInput!) {
    catalogStats(timePeriod: $timePeriod) ${catalogStatsSelection}
  }
`;

export const DISCOUNT_STATS_QUERY = gql`
  query DiscountStats($timePeriod: TimePeriodInput!) {
    discountStats(timePeriod: $timePeriod) ${discountStatsSelection}
  }
`;

export const INVENTORY_STATS_QUERY = gql`
  query InventoryStats($threshold: Int, $timePeriod: TimePeriodInput!) {
    inventoryStats(threshold: $threshold, timePeriod: $timePeriod) ${inventoryStatsSelection}
  }
`;

export const PRODUCT_STATS_QUERY = gql`
  query ProductStats($timePeriod: TimePeriodInput!) {
    productStats(timePeriod: $timePeriod) ${productStatsSelection}
  }
`;
