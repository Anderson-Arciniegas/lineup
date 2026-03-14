import type {
  BusinessSchema,
  CatalogSchema,
  CurrencySchema,
  FileSchema,
  UserSchema,
} from '.';
import type { StatusEnum } from '../enums';

export interface TagSchema {
  id: number;
  name?: string;
  __typename?: 'TagSchema';
}

export interface ProductTagSchema {
  idProduct: number;
  idTag: number;
  product?: ProductSchema;
  tag?: TagSchema;
  __typename?: 'ProductTagSchema';
}

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
  productTags?: ProductTagSchema[];
  status: StatusEnum;
  subtitle: string;
  title: string;
  variations?: ProductVariationSchema[];
  reactions?: ProductReactionSchema[];
  currency?: CurrencySchema;
  __typename?: 'ProductSchema';
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

export interface ProductRatingSchema {
  id: number;
  idCreationUser: number;
  idProduct: number;
  stars: number;
  status: StatusEnum;
  comment?: string;
  creationUser?: UserSchema;
  product?: ProductSchema;
}

export enum ReactionTypeEnum {
  LIKE = 'LIKE',
}
