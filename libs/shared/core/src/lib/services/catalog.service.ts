import { inject, Injectable } from '@angular/core';

import {
  CREATE_CATALOG_MUTATION,
  FIND_ALL_CATALOGS_QUERY,
  FIND_ALL_MY_CATALOGS_QUERY,
  FIND_ONE_CATALOG_BY_PATH_QUERY,
  FIND_ONE_CATALOG_QUERY,
  REMOVE_CATALOG_MUTATION,
  UPDATE_CATALOG_MUTATION,
} from '@libs/graphql';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClient } from '.';
import {
  CreateCatalogInput,
  InfinityScrollInput,
  PaginatedCatalogs,
  UpdateCatalogInput,
} from '../models/catalog.model';
import { CatalogSchema } from '../schemas';

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private apollo = inject(Apollo);

  findAllCatalogs(
    pagination: InfinityScrollInput,
  ): Observable<PaginatedCatalogs> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .query<{ findAllCatalogs: PaginatedCatalogs }>({
        query: FIND_ALL_CATALOGS_QUERY,
        variables: { pagination },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.findAllCatalogs));
  }

  findAllMyCatalogs(
    pagination: InfinityScrollInput,
  ): Observable<PaginatedCatalogs> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .query<{ findAllMyCatalogs: PaginatedCatalogs }>({
        query: FIND_ALL_MY_CATALOGS_QUERY,
        variables: { pagination },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.findAllMyCatalogs));
  }

  findOneCatalog(id: number): Observable<CatalogSchema> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .query<{ findOneCatalog: CatalogSchema }>({
        query: FIND_ONE_CATALOG_QUERY,
        variables: { id },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.findOneCatalog));
  }

  findOneCatalogByPath(path: string): Observable<CatalogSchema> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .query<{ findOneCatalogByPath: CatalogSchema }>({
        query: FIND_ONE_CATALOG_BY_PATH_QUERY,
        variables: { path },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.findOneCatalogByPath));
  }

  createCatalog(data: CreateCatalogInput): Observable<CatalogSchema> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .mutate<{ createCatalog: CatalogSchema }>({
        mutation: CREATE_CATALOG_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(
        map((result) => {
          if (!result.data) {
            throw new Error('No data returned from mutation');
          }
          return result.data.createCatalog;
        }),
      );
  }

  updateCatalog(data: UpdateCatalogInput): Observable<CatalogSchema> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .mutate<{ updateCatalog: CatalogSchema }>({
        mutation: UPDATE_CATALOG_MUTATION,
        variables: { data },
        context: {
          withCredentials: true,
        },
      })
      .pipe(
        map((result) => {
          if (!result.data) {
            throw new Error('No data returned from mutation');
          }
          return result.data.updateCatalog;
        }),
      );
  }

  removeCatalog(id: number): Observable<CatalogSchema> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .mutate<{ removeCatalog: CatalogSchema }>({
        mutation: REMOVE_CATALOG_MUTATION,
        variables: { id },
        context: {
          withCredentials: true,
        },
      })
      .pipe(
        map((result) => {
          if (!result.data) {
            throw new Error('No data returned from mutation');
          }
          return result.data.removeCatalog;
        }),
      );
  }
}
