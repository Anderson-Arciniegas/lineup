import type { BusinessSchema, CatalogSchema } from '.';
import type { StatusEnum } from '../enums';

export interface ProductSchema {
  business?: BusinessSchema;
  catalog?: CatalogSchema;
  description: string;
  id: number;
  idCatalog: number;
  idCreationBusiness: number;
  likes: number;
  modificationBusiness?: BusinessSchema;
  price?: number;
  status: StatusEnum;
  subtitle: string;
  tags: string[];
  title: string;
}
