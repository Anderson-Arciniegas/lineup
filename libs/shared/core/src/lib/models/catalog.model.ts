import type { CatalogSchema } from '../schemas';

export interface CreateCatalogInput {
  hexColor?: string;
  imageCode?: string;
  tags?: string[];
  title: string;
}

export interface UpdateCatalogInput {
  hexColor?: string;
  idCatalog: number;
  imageCode?: string;
  tags?: string[];
  title?: string;
}

export interface InfinityScrollInput {
  limit?: number;
  order?: string;
  orderBy?: string;
  page: number;
  search?: string;
  timestamp?: string;
}

export interface PaginatedCatalogs {
  items: CatalogSchema[];
  limit: number;
  page: number;
  total: number;
}
