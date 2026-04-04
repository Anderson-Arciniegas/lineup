import { gql } from 'apollo-angular';

import {
  businessSalesInTimePeriodSelection,
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

export const BUSINESS_SALES_IN_TIME_PERIOD_QUERY = gql`
  query BusinessSalesInTimePeriod($timePeriod: TimePeriodInput!) {
    businessSalesInTimePeriod(timePeriod: $timePeriod) ${businessSalesInTimePeriodSelection}
  }
`;
