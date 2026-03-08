import type { BusinessSchema, FileSchema, ProductSchema } from '.';
import type { StatusEnum } from '../enums';

export interface CatalogSchema {
  business?: BusinessSchema;
  id: number;
  idCreationBusiness: number;
  image?: FileSchema;
  imageCode?: string;
  modificationBusiness?: BusinessSchema;
  products?: ProductSchema[];
  status: StatusEnum;
  tags?: string[];
  title: string;
  path?: string;
  productsCount?: number;
  __typename: 'CatalogSchema';
}
