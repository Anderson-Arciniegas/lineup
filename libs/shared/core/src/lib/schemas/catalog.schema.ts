import type { BusinessSchema, FileSchema, ProductSchema } from '.';
import type { DiscountSchema } from './discount.schema';
import type { ProductSearchIndexSchema } from './product.schema';
import type { UserSchema } from './user.schema';
import type { StatusEnum } from '../enums';

export interface CatalogVisitSchema {
  catalog?: CatalogSchema;
  creationUser?: UserSchema;
  id: number;
  idCatalog: number;
  idCreationUser?: number;
  __typename?: 'CatalogVisitSchema';
}

export interface CatalogSearchIndexSchema {
  business?: BusinessSchema;
  catalog?: CatalogSchema;
  id: number;
  idBusiness: number;
  idCatalog: number;
  productLikesTotal: number;
  productVisitsTotal: number;
  searchVector?: string;
  visits: number;
  __typename?: 'CatalogSearchIndexSchema';
}

export interface CatalogSchema {
  business?: BusinessSchema;
  catalogSearchIndexes?: CatalogSearchIndexSchema[];
  catalogVisits?: CatalogVisitSchema[];
  discounts?: DiscountSchema[];
  hexColor?: string;
  id: number;
  idCreationBusiness: number;
  image?: FileSchema;
  imageCode?: string;
  modificationBusiness?: BusinessSchema;
  path: string;
  productSearchIndexes?: ProductSearchIndexSchema[];
  products?: ProductSchema[];
  productsCount: number;
  status: StatusEnum;
  tags?: string[];
  title: string;
  visits: number;
  __typename: 'CatalogSchema';
}
