import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';
import { createApolloMock } from '../../../testing';
import { RatingPublicService } from './rating-public.service';

describe('RatingPublicService', () => {
  let service: RatingPublicService;
  let querySpy: jest.Mock;
  let mutateSpy: jest.Mock;

  beforeEach(() => {
    const apollo = createApolloMock({
      query: () => of({ data: {"myProductRating":{"id":1},"myProductRatings":{"items":[],"total":0},"productRatings":{"items":[],"total":0}} as Record<string, unknown> }),
      mutate: () => of({ data: {"rateProduct":{"id":1}} as Record<string, unknown> }),
    });
    querySpy = apollo.querySpy;
    mutateSpy = apollo.mutateSpy;
    TestBed.configureTestingModule({
      providers: [RatingPublicService, { provide: Apollo, useValue: apollo.mock }],
    });
    service = TestBed.inject(RatingPublicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('myProductRating calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.myProductRating(1));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('myProductRatings calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.myProductRatings({ limit: 10, page: 0 }));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('productRatings calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.productRatings(1, { limit: 10, page: 0 }));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('rateProduct calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.rateProduct({ idProduct: 1, rating: 5 } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });
});
