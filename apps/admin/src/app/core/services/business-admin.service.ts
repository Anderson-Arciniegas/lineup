import { inject, Injectable } from '@angular/core';
import type {
  BusinessSchema,
  InfinityScrollInput,
  PaginatedBusinesses,
} from '@lineup/core';
import { ADMIN_APOLLO_CLIENT } from '../constants/admin-apollo-client';
import {
  ADMIN_FIND_ALL_BUSINESSES_QUERY,
  ADMIN_FIND_ONE_BUSINESS_QUERY,
} from '../graphql/queries/admin-businesses.queries';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BusinessAdminService {
  private readonly apollo = inject(Apollo);

  findAllBusinesses(
    pagination: InfinityScrollInput,
  ): Observable<PaginatedBusinesses> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .query<{ findAllBusinesses: PaginatedBusinesses }>({
        query: ADMIN_FIND_ALL_BUSINESSES_QUERY,
        variables: { pagination },
        fetchPolicy: 'network-only',
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data.findAllBusinesses));
  }

  findOneBusiness(id: number): Observable<BusinessSchema> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .query<{ findOneBusiness: BusinessSchema }>({
        query: ADMIN_FIND_ONE_BUSINESS_QUERY,
        variables: { id },
        fetchPolicy: 'network-only',
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data.findOneBusiness));
  }
}
