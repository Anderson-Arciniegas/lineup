import type {
  BusinessSchema,
  CatalogSchema,
  CurrencySchema,
  FileSchema,
  UserSchema,
} from '.';
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
  productFiles?: ProductFileSchema[];
  status: StatusEnum;
  subtitle: string;
  tags: string[];
  title: string;
  variations?: ProductVariationSchema[];
  reactions?: ProductReactionSchema[];
  currency?: CurrencySchema;
}

export interface ProductFileSchema {
  id: number;
  idCreationBusiness: number;
  idProduct: number;
  imageCode: string;
  order: number;
  status: StatusEnum;
  business?: BusinessSchema;
  file?: FileSchema;
  product?: ProductSchema;
  modificationBusiness?: BusinessSchema;
}

export interface ProductVariationSchema {
  id: number;
  idCreationBusiness: number;
  idProduct: number;
  options: string[];
  status: StatusEnum;
  title: string;
  business?: BusinessSchema;
  modificationBusiness?: BusinessSchema;
  product?: ProductSchema;
}

export interface ProductReactionSchema {
  id: number;
  idCreationUser: number;
  idProduct: number;
  status: StatusEnum;
  type: ReactionTypeEnum;
  product?: ProductSchema;
  creationUser?: UserSchema;
}

export enum ReactionTypeEnum {
  LIKE = 'LIKE',
}
