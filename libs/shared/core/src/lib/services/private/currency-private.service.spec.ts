import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';
import { createApolloMock } from '../../../testing';
import { CurrencyPrivateService } from './currency-private.service';

describe('CurrencyPrivateService', () => {
  let service: CurrencyPrivateService;
  let querySpy: jest.Mock;
  let mutateSpy: jest.Mock;

  beforeEach(() => {
    const apollo = createApolloMock({
      query: () => of({ data: {"findAllCurrencies":[]} as Record<string, unknown> }),
    });
    querySpy = apollo.querySpy;
    mutateSpy = apollo.mutateSpy;
    TestBed.configureTestingModule({
      providers: [CurrencyPrivateService, { provide: Apollo, useValue: apollo.mock }],
    });
    service = TestBed.inject(CurrencyPrivateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('findAllCurrencies calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findAllCurrencies());
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });
});
