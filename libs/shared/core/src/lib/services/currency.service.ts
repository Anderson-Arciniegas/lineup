import { inject, Injectable } from '@angular/core';

import { FIND_ALL_CURRENCIES_QUERY } from '@libs/graphql';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClient } from '.';
import type { CurrencySchema } from '../schemas';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private apollo = inject(Apollo);

  findAllCurrencies(): Observable<CurrencySchema[]> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .query<{ findAllCurrencies: CurrencySchema[] }>({
        query: FIND_ALL_CURRENCIES_QUERY,
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.findAllCurrencies));
  }
}
