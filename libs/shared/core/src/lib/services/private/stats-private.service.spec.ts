import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';
import { createApolloMock } from '../../../testing';
import { StatsPrivateService } from './stats-private.service';

describe('StatsPrivateService', () => {
  let service: StatsPrivateService;
  let querySpy: jest.Mock;
  let mutateSpy: jest.Mock;

  beforeEach(() => {
    const apollo = createApolloMock({
      query: () => of({ data: {"businessEngagementStats":{"id":1},"catalogStats":{"id":1},"discountStats":{"id":1},"inventoryStats":{"id":1},"productStats":{"id":1},"businessSalesInTimePeriod":{"id":1}} as Record<string, unknown> }),
    });
    querySpy = apollo.querySpy;
    mutateSpy = apollo.mutateSpy;
    TestBed.configureTestingModule({
      providers: [StatsPrivateService, { provide: Apollo, useValue: apollo.mock }],
    });
    service = TestBed.inject(StatsPrivateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('businessEngagementStats calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.businessEngagementStats({ from: "2024-01-01", to: "2024-01-31" } as never));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('catalogStats calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.catalogStats({ from: "2024-01-01", to: "2024-01-31" } as never));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('discountStats calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.discountStats({ from: "2024-01-01", to: "2024-01-31" } as never));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('inventoryStats calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.inventoryStats({ from: "2024-01-01", to: "2024-01-31" } as never));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('productStats calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.productStats({ from: "2024-01-01", to: "2024-01-31" } as never));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('businessSalesInTimePeriod calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.businessSalesInTimePeriod({ from: "2024-01-01", to: "2024-01-31" } as never));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });
});
