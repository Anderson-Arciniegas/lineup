import type { BusinessSchema, CatalogSchema, ProductSchema } from '../schemas';
import type { InfinityScrollInput } from './catalog.model';

export interface ProductImageInput {
  imageCode: string;
  order: number;
}

export interface PriceCurrencyInput {
  idCurrency?: number;
  price?: number;
}

export interface ProductVariationOptionInput {
  value: string;
}

export interface CreateProductVariationOptionInput {
  value: string;
}

export interface CreateProductVariationInput {
  options: CreateProductVariationOptionInput[];
  title: string;
}

export interface ProductVariationInput {
  id?: number;
  options: ProductVariationOptionInput[];
  title: string;
}

export interface InitialStockItemInput {
  notes?: string;
  quantityDelta: number;
}

/** Alineado con `CreateProductInput` en GraphQL. */
export interface CreateProductInput {
  description: string;
  idCatalog: number;
  images: ProductImageInput[];
  isPrimary: boolean;
  subtitle: string;
  title: string;
  variations?: CreateProductVariationInput[];
}

/** Alineado con `UpdateProductInput` en GraphQL (solo `id` es obligatorio). */
export interface UpdateProductInput {
  description?: string;
  id: number;
  idCatalog?: number;
  images?: ProductImageInput[];
  isPrimary?: boolean;
  subtitle?: string;
  title?: string;
  variations?: ProductVariationInput[];
}

export interface AdjustStockInput {
  idProductSku: number;
  notes?: string;
  quantityDelta: number;
}

/** Línea de venta enviada a `registerSale` (`price` = total de línea, unitario efectivo × cantidad). */
export interface RegisterSaleInput {
  idProductSku: number;
  notes?: string;
  price: number;
  quantity: number;
}

export interface SalesInput {
  sales: RegisterSaleInput[];
}

export interface UpdateProductSkuItemInput {
  id: number;
  idCurrency?: number;
  price?: number;
  quantity?: number;
}

export interface UpdateProductSkusInput {
  skus: UpdateProductSkuItemInput[];
}

export interface GetAllPrimaryProductsByBusinessInput {
  idBusiness: number;
  idCatalog?: number | null;
}

export interface PaginatedProducts {
  items: ProductSchema[];
  limit: number;
  page: number;
  total: number;
}

export interface FeaturedCollectionsSchema {
  featuredBusinesses: BusinessSchema[];
  featuredCatalogs: CatalogSchema[];
  featuredProducts: ProductSchema[];
  limit: number;
  page: number;
  recentlyAddedProducts: ProductSchema[];
  total: number;
}

export type { InfinityScrollInput };
