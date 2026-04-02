import type { BusinessSchema } from './business.schema';
import type { CatalogSchema } from './catalog.schema';
import type { CurrencySchema } from './currency.schema';
import type { ProductSchema } from './product.schema';
import type { AuditOperationEnum, DiscountScopeEnum, DiscountTypeEnum, StatusEnum } from '../enums';

/**
 * Campos de DiscountSchema sin la lista recursiva discountProducts
 * (coincide con DiscountProductSchema.discount en GraphQL).
 */
export interface DiscountSchemaFields {
  business?: BusinessSchema;
  catalog?: CatalogSchema;
  creationDate?: string;
  currency?: CurrencySchema;
  discountType: DiscountTypeEnum;
  endDate: string;
  id: number;
  idCatalog?: number;
  idCreationBusiness: number;
  idCurrency?: number;
  modificationBusiness?: BusinessSchema;
  modificationDate?: string;
  scope: DiscountScopeEnum;
  startDate: string;
  status: StatusEnum;
  value: number;
  __typename?: 'DiscountSchema';
}

/** DiscountProductSchema (respuesta GraphQL) */
export interface DiscountProductRelationSchema {
  creationBusiness?: BusinessSchema;
  creationDate?: string;
  discount?: DiscountSchemaFields;
  id: number;
  idCreationBusiness: number;
  idDiscount: number;
  idProduct: number;
  modificationDate?: string;
  product?: ProductSchema;
  __typename?: 'DiscountProductSchema';
}

export interface DiscountSchema extends DiscountSchemaFields {
  discountProducts: DiscountProductRelationSchema[];
}

export interface DiscountProductAuditSchema {
  creationBusiness?: BusinessSchema;
  creationDate: string;
  id: number;
  idCreationBusiness: number;
  idDiscountNew?: number;
  idDiscountOld?: number;
  idProduct: number;
  operation: AuditOperationEnum;
  product?: ProductSchema;
  __typename?: 'DiscountProductAuditSchema';
}
