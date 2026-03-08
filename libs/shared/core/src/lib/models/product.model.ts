import type { ProductSchema } from '../schemas';
import type { InfinityScrollInput } from './catalog.model';

export interface ProductImageInput {
  imageCode: string;
  order: number;
}

export interface ProductVariationInput {
  id?: number;
  options: string[];
  title: string;
}

export interface CreateProductInput {
  description: string;
  idCatalog: number;
  images: ProductImageInput[];
  price?: number;
  subtitle: string;
  tags: string[];
  title: string;
  idCurrency: number;
  variations?: ProductVariationInput[];
}

export interface UpdateProductInput {
  description: string;
  id: number;
  idCatalog: number;
  images?: ProductImageInput[];
  price?: number;
  subtitle: string;
  tags: string[];
  title: string;
  idCurrency: number;
  variations?: ProductVariationInput[];
}

export interface PaginatedProducts {
  items: ProductSchema[];
  limit: number;
  page: number;
  total: number;
}

export type { InfinityScrollInput };
