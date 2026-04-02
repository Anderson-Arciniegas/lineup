import type { DiscountSchema } from '../schemas';
import type { DiscountScopeEnum, DiscountTypeEnum } from '../enums';
import type { InfinityScrollInput } from './catalog.model';

export interface FindDiscountsByScopeInput {
  scope: DiscountScopeEnum;
}

export interface PaginatedDiscounts {
  items: DiscountSchema[];
  limit: number;
  page: number;
  total: number;
}

export interface CreateDiscountInput {
  discountType: DiscountTypeEnum;
  endDate: string;
  idCatalog?: number;
  idCurrency?: number;
  idProduct?: number;
  scope: DiscountScopeEnum;
  startDate: string;
  value: number;
}

export interface UpdateDiscountInput {
  discountType?: DiscountTypeEnum;
  endDate?: string;
  id: number;
  idCurrency?: number;
  startDate?: string;
  value?: number;
}
