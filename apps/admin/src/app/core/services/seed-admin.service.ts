import { inject, Injectable } from '@angular/core';
import { ADMIN_APOLLO_CLIENT } from '../constants/admin-apollo-client';
import {
  ADMIN_SEED_DEVELOPMENT_BUSINESSES_MUTATION,
  ADMIN_SEED_DEVELOPMENT_CATALOGS_MUTATION,
  ADMIN_SEED_DEVELOPMENT_PRODUCTS_MUTATION,
} from '../graphql/mutations/admin-seed.mutations';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SeedAdminService {
  private readonly apollo = inject(Apollo);

  seedDevelopmentBusinesses(): Observable<boolean> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .mutate<{ seedDevelopmentBusinesses: boolean }>({
        mutation: ADMIN_SEED_DEVELOPMENT_BUSINESSES_MUTATION,
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data!.seedDevelopmentBusinesses));
  }

  seedDevelopmentCatalogs(): Observable<boolean> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .mutate<{ seedDevelopmentCatalogs: boolean }>({
        mutation: ADMIN_SEED_DEVELOPMENT_CATALOGS_MUTATION,
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data!.seedDevelopmentCatalogs));
  }

  seedDevelopmentProducts(): Observable<boolean> {
    return this.apollo
      .use(ADMIN_APOLLO_CLIENT)
      .mutate<{ seedDevelopmentProducts: boolean }>({
        mutation: ADMIN_SEED_DEVELOPMENT_PRODUCTS_MUTATION,
        context: { withCredentials: true },
      })
      .pipe(map((r) => r.data!.seedDevelopmentProducts));
  }
}
