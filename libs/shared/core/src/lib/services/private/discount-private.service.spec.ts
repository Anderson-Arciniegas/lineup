import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';
import { createApolloMock } from '../../../testing';
import { DiscountPrivateService } from './discount-private.service';

describe('DiscountPrivateService', () => {
  let service: DiscountPrivateService;
  let querySpy: jest.Mock;
  let mutateSpy: jest.Mock;

  beforeEach(() => {
    const apollo = createApolloMock({
      query: () => of({ data: {"findActiveDiscountByProduct":{"id":1},"findAllMyDiscountsByScope":{"items":[],"total":0},"findDiscountAuditByDiscount":[],"findDiscountAuditByProduct":[],"findOneDiscount":{"id":1}} as Record<string, unknown> }),
      mutate: () => of({ data: {"createDiscount":{"id":1},"removeDiscount":true,"updateDiscount":{"id":1}} as Record<string, unknown> }),
    });
    querySpy = apollo.querySpy;
    mutateSpy = apollo.mutateSpy;
    TestBed.configureTestingModule({
      providers: [DiscountPrivateService, { provide: Apollo, useValue: apollo.mock }],
    });
    service = TestBed.inject(DiscountPrivateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('findActiveDiscountByProduct calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findActiveDiscountByProduct(1));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('findAllMyDiscountsByScope calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findAllMyDiscountsByScope({ scope: "PRODUCT" } as never, { limit: 10, page: 0 }));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('findDiscountAuditByDiscount calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findDiscountAuditByDiscount(1));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('findDiscountAuditByProduct calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findDiscountAuditByProduct(1));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('findOneDiscount calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findOneDiscount(1));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('createDiscount calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.createDiscount({ value: 10 } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('removeDiscount calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.removeDiscount(1));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('updateDiscount calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.updateDiscount({ id: 1 } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('createDiscount throws when mutation has no data', async () => {
    mutateSpy.mockReturnValueOnce(of({ data: null }));
    await expect(
      firstValueFrom(service.createDiscount({ value: 10 } as never)),
    ).rejects.toThrow('No data returned from mutation');
  });

  it('updateDiscount throws when mutation has no data', async () => {
    mutateSpy.mockReturnValueOnce(of({ data: null }));
    await expect(
      firstValueFrom(service.updateDiscount({ id: 1 } as never)),
    ).rejects.toThrow('No data returned from mutation');
  });

  it('removeDiscount throws when mutation has no data', async () => {
    mutateSpy.mockReturnValueOnce(of({ data: null }));
    await expect(firstValueFrom(service.removeDiscount(1))).rejects.toThrow(
      'No data returned from mutation',
    );
  });
});
