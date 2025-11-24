import type { BusinessSchema, ProductSchema } from '.';
import type { StatusEnum } from '../enums';

export interface CatalogSchema {
  business?: BusinessSchema;
  id: number;
  idCreationBusiness: number;
  modificationBusiness?: BusinessSchema;
  products?: ProductSchema[];
  status: StatusEnum;
  title: string;
}
