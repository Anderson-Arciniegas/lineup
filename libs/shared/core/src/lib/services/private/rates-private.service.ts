import { inject, Injectable } from '@angular/core';

import { FIND_BCV_OFFICIAL_RATES_QUERY } from '@libs/graphql';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClient } from '.';
import type { BcvOfficialRatesSchema } from '../../schemas';

@Injectable({
  providedIn: 'root',
})
export class RatesPrivateService {
  private apollo = inject(Apollo);

  findBcvOfficialRates(): Observable<BcvOfficialRatesSchema> {
    return this.apollo
      .use(ApiClient.BUSINESS)
      .query<{ findBcvOfficialRates: BcvOfficialRatesSchema }>({
        query: FIND_BCV_OFFICIAL_RATES_QUERY,
        fetchPolicy: 'network-only',
        context: {
          withCredentials: true,
        },
      })
      .pipe(map((result) => result.data.findBcvOfficialRates));
  }
}
