import { inject, Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export enum ApiClient {
  USER = 'userAPI',
  BUSINESS = 'businessAPI',
  ADMIN = 'adminAPI',
}

@Injectable({
  providedIn: 'root',
})
export class GraphqlService {
  private apollo = inject(Apollo);

  query<T>(
    queryGql: any,
    variables?: any,
    client: ApiClient = ApiClient.USER,
  ): Observable<T> {
    const apolloClient = this.apollo.use(client);

    return apolloClient
      .watchQuery<T>({ query: queryGql, variables })
      .valueChanges.pipe(map((result) => result.data as T));
  }

  mutate<T>(
    mutationGql: any,
    variables?: any,
    client: ApiClient = ApiClient.USER,
  ): Observable<T> {
    const apolloClient = this.apollo.use(client);

    return apolloClient
      .mutate<T>({ mutation: mutationGql, variables })
      .pipe(map((result) => result.data as T));
  }
}
