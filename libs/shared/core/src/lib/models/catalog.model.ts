import type { CatalogSchema } from '../schemas';

export interface CreateCatalogInput {
  imageCode?: string;
  tags?: string[];
  title: string;
}

export interface UpdateCatalogInput {
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
