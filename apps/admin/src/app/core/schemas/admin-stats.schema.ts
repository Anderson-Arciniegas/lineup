/** Punto de una serie temporal devuelta por el API admin. */
export interface TimeSeriesDataPointSchema {
  period: string;
  value: number;
}

export interface AdminTimeSeriesStatsSchema {
  total: number;
  data: TimeSeriesDataPointSchema[];
}

export interface AdminStatusCountSchema {
  status: string;
  count: number;
}

export interface AdminLabeledCountSchema {
  label: string;
  count: number;
}

export interface AdminBusinessStatsSchema {
  totalBusinesses: number;
  onlineBusinessesCount: number;
  businessesByStatus: AdminStatusCountSchema[];
  newBusinessesInPeriod: AdminTimeSeriesStatsSchema | null;
}

export interface AdminCatalogGlobalStatsSchema {
  productsWithoutStock: number;
  totalProducts: number;
  totalSkus: number;
}

export interface AdminDiscountGlobalStatsSchema {
  discountsByStatus: AdminLabeledCountSchema[];
  discountsByType: AdminLabeledCountSchema[];
  expiringSoonCount: number;
}

export interface AdminPlatformEngagementStatsSchema {
  businessVisits: AdminTimeSeriesStatsSchema;
  catalogVisits: AdminTimeSeriesStatsSchema;
  productVisits: AdminTimeSeriesStatsSchema;
}

export interface AdminUserStatsSchema {
  totalUsers: number;
  usersByStatus: AdminStatusCountSchema[];
  newUsersInPeriod: AdminTimeSeriesStatsSchema | null;
}
