import { StockMovementTypeEnum } from '../enums';

import type { StockMovementSchema } from './product.schema';

export interface TimeSeriesDataPointSchema {
  period: string;
  value: number;
}

export interface TimeSeriesStatsSchema {
  total: number;
}

export interface VisitsByAuthTypeSchema {
  anonymous: number;
  data: TimeSeriesDataPointSchema[] | null;
  identified: number;
}

export interface BusinessVisitsStatsSchema {
  visits: TimeSeriesStatsSchema;
  visitsByAuthType: VisitsByAuthTypeSchema;
}

export interface EngagementStatsSchema {
  newFollowers: TimeSeriesStatsSchema;
  visits: BusinessVisitsStatsSchema;
}

export interface FrequencyDataPointSchema {
  count: number;
  label: string;
}

export interface CatalogStatItemSchema {
  id: number;
  title: string;
  visits: number;
}

export interface CatalogStatsSchema {
  catalogVisitsOverTime: TimeSeriesStatsSchema;
  productsPerCatalog: FrequencyDataPointSchema[];
  topByVisits: CatalogStatItemSchema[];
}

export interface DiscountStatsSchema {
  byStatus: FrequencyDataPointSchema[];
  byType: FrequencyDataPointSchema[];
  expiringSoon: TimeSeriesStatsSchema;
}

export interface StockMovementStatItemSchema {
  creationDate: string;
  id: number;
  quantityDelta: number;
  type: StockMovementTypeEnum;
}

export interface InventoryStatsSchema {
  productsWithoutStockCount: number;
  recentStockMovements: StockMovementStatItemSchema[];
  skusLowOrOutOfStockCount: number;
}

export interface ProductLikesStatItemSchema {
  id: number;
  likes: number;
  title: string;
}

export interface ProductRatingStatItemSchema {
  id: number;
  ratingAverage: number;
  title: string;
}

export interface ProductStatItemSchema {
  id: number;
  title: string;
  visits: number;
}

export interface VisitToLikeRatioSchema {
  ratio: number;
  totalLikes: number;
  totalVisits: number;
}

export interface ProductStatsSchema {
  topByLikes: ProductLikesStatItemSchema[];
  topByRating: ProductRatingStatItemSchema[];
  topByVisits: ProductStatItemSchema[];
  visitToLikeRatio: VisitToLikeRatioSchema;
  withoutRatingsCount: number;
  withoutVisitsCount: number;
}

export interface BusinessSalesInTimePeriodSchema {
  sales: StockMovementSchema[];
  salesCount: TimeSeriesStatsSchema;
}
