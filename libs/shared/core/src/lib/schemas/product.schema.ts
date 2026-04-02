import type {
  BusinessSchema,
  CatalogSchema,
  CurrencySchema,
  DiscountSchema,
  FileSchema,
  UserSchema,
} from '.';
import type { StatusEnum, StockMovementTypeEnum } from '../enums';

export interface TagSchema {
  id: number;
  idCreationBusiness?: number;
  name?: string;
  slug?: string;
  creationBusiness?: BusinessSchema;
  __typename?: 'TagSchema';
}

export interface ProductTagSchema {
  idProduct: number;
  idTag: number;
  product?: ProductSchema;
  tag?: TagSchema;
  __typename?: 'ProductTagSchema';
}

export interface DiscountProductSchema {
  id: number;
  discount?: DiscountSchema;
  idDiscount?: number;
  idProduct?: number;
  idCreationBusiness?: number;
  creationBusiness?: BusinessSchema;
  creationDate?: string;
  modificationBusiness?: BusinessSchema;
  modificationDate?: string;
  status?: StatusEnum;
  product?: ProductSchema;
  __typename?: 'DiscountProductSchema';
}

export interface ProductSearchIndexSchema {
  business?: BusinessSchema;
  catalog?: CatalogSchema;
  id: number;
  idBusiness: number;
  idCatalog: number;
  idProduct: number;
  likes: number;
  locationsText?: string;
  price?: number;
  product?: ProductSchema;
  ratingAverage: number;
  searchVector?: string;
  visits: number;
  __typename?: 'ProductSearchIndexSchema';
}

export interface ProductVisitSchema {
  creationUser?: UserSchema;
  id: number;
  idCreationUser?: number;
  idProduct: number;
  product?: ProductSchema;
  __typename?: 'ProductVisitSchema';
}

export interface ProductCollectionSchema {
  id: string;
  products: ProductSchema[];
  title: string;
  __typename?: 'ProductCollectionSchema';
}

export interface ProductSchema {
  business?: BusinessSchema;
  catalog?: CatalogSchema;
  creationDate?: string;
  currency?: CurrencySchema;
  description: string;
  discountProduct?: DiscountProductSchema;
  hasVariations: boolean;
  id: number;
  idCatalog: number;
  idCreationBusiness: number;
  idCurrency?: number;
  isPrimary: boolean;
  likes: number;
  modificationBusiness?: BusinessSchema;
  price?: number;
  productFiles?: ProductFileSchema[];
  productSearchIndexes?: ProductSearchIndexSchema[];
  productTags?: ProductTagSchema[];
  productVisits?: ProductVisitSchema[];
  ratingAverage: number;
  ratings?: ProductRatingSchema[];
  reactions?: ProductReactionSchema[];
  skus?: ProductSkuSchema[];
  status: StatusEnum;
  subtitle?: string;
  title: string;
  variations?: ProductVariationSchema[];
  visits: number;
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

export interface ProductSkuSchema {
  business?: BusinessSchema;
  id: number;
  idCreationBusiness: number;
  idProduct: number;
  modificationBusiness?: BusinessSchema;
  price?: number;
  product?: ProductSchema;
  currency?: CurrencySchema;
  idCurrency?: number;
  quantity: number | null;
  skuCode: string;
  status: StatusEnum;
  variationOptions: Record<string, unknown>;
  __typename?: 'ProductSkuSchema';
}

export interface StockMovementSchema {
  business?: BusinessSchema;
  creationDate: string;
  id: number;
  idCreationBusiness: number;
  idProductSku: number;
  newQuantity: number;
  notes?: string;
  previousQuantity: number;
  productSku?: ProductSkuSchema;
  quantityDelta: number;
  type: StockMovementTypeEnum;
  __typename?: 'StockMovementSchema';
}
