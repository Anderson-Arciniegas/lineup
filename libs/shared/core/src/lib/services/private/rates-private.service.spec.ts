import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';
import { createApolloMock } from '../../../testing';
import { RatesPrivateService } from './rates-private.service';

describe('RatesPrivateService', () => {
  let service: RatesPrivateService;
  let querySpy: jest.Mock;
  let mutateSpy: jest.Mock;

  beforeEach(() => {
    const apollo = createApolloMock({
      query: () => of({ data: {"findBcvOfficialRates":{"dollar":1,"euro":1}} as Record<string, unknown> }),
    });
    querySpy = apollo.querySpy;
    mutateSpy = apollo.mutateSpy;
    TestBed.configureTestingModule({
      providers: [RatesPrivateService, { provide: Apollo, useValue: apollo.mock }],
    });
    service = TestBed.inject(RatesPrivateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('findBcvOfficialRates calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findBcvOfficialRates());
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });
});
