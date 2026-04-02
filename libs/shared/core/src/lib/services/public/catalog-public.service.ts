import { inject, Injectable } from '@angular/core';
import {
  FEATURED_CATALOGS_QUERY,
  FIND_CATALOGS_BY_BUSINESS_ID_QUERY,
  FIND_ONE_CATALOG_BY_PATH_QUERY,
  FIND_ONE_CATALOG_QUERY,
} from '@libs/graphql';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { InfinityScrollInput, PaginatedCatalogs } from '../../models';
import { CatalogSchema } from '../../schemas';

@Injectable({
  providedIn: 'root',
})
export class CatalogPublicService {
  private apollo = inject(Apollo);

  featuredCatalogs(
    pagination: InfinityScrollInput,
  ): Observable<PaginatedCatalogs> {
    return this.apollo
      .use('userAPI')
      .query<{ featuredCatalogs: PaginatedCatalogs }>({
        query: FEATURED_CATALOGS_QUERY,
        variables: { pagination },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.featuredCatalogs));
  }

  findCatalogsByBusinessId(
    idBusiness: number,
    pagination: InfinityScrollInput,
  ): Observable<PaginatedCatalogs> {
    return this.apollo
      .use('userAPI')
      .query<{ findCatalogsByBusinessId: PaginatedCatalogs }>({
        query: FIND_CATALOGS_BY_BUSINESS_ID_QUERY,
        variables: { idBusiness, pagination },
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.findCatalogsByBusinessId));
  }

  findOneCatalog(id: number): Observable<CatalogSchema> {
    return this.apollo
      .use('userAPI')
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
      .use('userAPI')
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
}
