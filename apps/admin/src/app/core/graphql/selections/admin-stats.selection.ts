/** Subconjuntos del schema admin para estadísticas globales. */

export const adminTimeSeriesStatsSelection = `{
  total
  data {
    period
    value
  }
}`;

export const adminStatusCountSelection = `{
  status
  count
}`;

export const adminLabeledCountSelection = `{
  label
  count
}`;

export const adminBusinessStatsSelection = `{
  totalBusinesses
  onlineBusinessesCount
  businessesByStatus ${adminStatusCountSelection}
  newBusinessesInPeriod ${adminTimeSeriesStatsSelection}
}`;

export const adminCatalogGlobalStatsSelection = `{
  productsWithoutStock
  totalProducts
  totalSkus
}`;

export const adminDiscountGlobalStatsSelection = `{
  expiringSoonCount
  discountsByStatus ${adminLabeledCountSelection}
  discountsByType ${adminLabeledCountSelection}
}`;

export const adminPlatformEngagementStatsSelection = `{
  businessVisits ${adminTimeSeriesStatsSelection}
  catalogVisits ${adminTimeSeriesStatsSelection}
  productVisits ${adminTimeSeriesStatsSelection}
}`;

export const adminUserStatsSelection = `{
  totalUsers
  usersByStatus ${adminStatusCountSelection}
  newUsersInPeriod ${adminTimeSeriesStatsSelection}
}`;
