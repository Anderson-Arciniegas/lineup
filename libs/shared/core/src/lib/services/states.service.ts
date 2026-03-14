import { inject, Injectable } from '@angular/core';
import { FIND_ALL_STATES_QUERY } from '@libs/graphql';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClient } from '.';
import type { StateSchema } from '../schemas';

@Injectable({
  providedIn: 'root',
})
export class StatesService {
  private apollo = inject(Apollo);

  findAllStates(): Observable<StateSchema[]> {
    return this.apollo
      .use(ApiClient.USER)
      .query<{ findAllStates: StateSchema[] }>({
        query: FIND_ALL_STATES_QUERY,
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.findAllStates));
  }
}
