import { inject, Injectable } from '@angular/core';

import { FIND_BCV_OFFICIAL_RATES_QUERY } from '@libs/graphql';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ApiClient } from '.';
import type { BcvOfficialRatesSchema } from '../../schemas';

@Injectable({
  providedIn: 'root',
})
export class RatesPrivateService {
  private apollo = inject(Apollo);

  /**
   * Lazy: evita tocar Apollo en el constructor (tests con mock parcial) y mantiene
   * una sola petición en vuelo + replay mientras haya suscriptores (refCount).
   */
  private bcvOfficialRates$?: Observable<BcvOfficialRatesSchema>;

  findBcvOfficialRates(): Observable<BcvOfficialRatesSchema> {
    if (!this.bcvOfficialRates$) {
      this.bcvOfficialRates$ = this.apollo
        .use(ApiClient.BUSINESS)
        .query<{ findBcvOfficialRates: BcvOfficialRatesSchema }>({
          query: FIND_BCV_OFFICIAL_RATES_QUERY,
          fetchPolicy: 'network-only',
          context: {
            withCredentials: true,
          },
        })
        .pipe(
          map((result) => result.data.findBcvOfficialRates),
          shareReplay({ bufferSize: 1, refCount: true }),
        );
    }
    return this.bcvOfficialRates$;
  }
}
