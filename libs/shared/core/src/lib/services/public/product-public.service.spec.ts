import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';
import { createApolloMock } from '../../../testing';
import { ProductPublicService } from './product-public.service';

describe('ProductPublicService', () => {
  let service: ProductPublicService;
  let querySpy: jest.Mock;
  let mutateSpy: jest.Mock;

  beforeEach(() => {
    const apollo = createApolloMock({
      query: () => of({ data: {"findAllProducts":{"items":[],"total":0},"findLikedProducts":{"items":[],"total":0},"findOneProduct":{"id":1},"getAllByCatalog":[],"getAllByCatalogPaginated":{"items":[],"total":0},"getAllByTag":{"items":[],"total":0},"getAllByTags":{"items":[],"total":0},"getAllPrimaryProductsByBusiness":[],"getAllByBusiness":{"items":[],"total":0},"productCollections":[],"getMainTags":[],"hasLikedProduct":true} as Record<string, unknown> }),
      mutate: () => of({ data: {"likeProduct":{"id":1},"unlikeProduct":true} as Record<string, unknown> }),
    });
    querySpy = apollo.querySpy;
    mutateSpy = apollo.mutateSpy;
    TestBed.configureTestingModule({
      providers: [ProductPublicService, { provide: Apollo, useValue: apollo.mock }],
    });
    service = TestBed.inject(ProductPublicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('findAllProducts calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findAllProducts({ limit: 10, page: 0 }));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('findLikedProducts calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findLikedProducts({ limit: 10, page: 0 }));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('findOneProduct calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findOneProduct(1));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('getAllByCatalog calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.getAllByCatalog(1));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('getAllByCatalog includes search when provided', async () => {
    await firstValueFrom(service.getAllByCatalog(1, 'query'));
    expect(querySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ idCatalog: 1, search: 'query' }),
      }),
    );
  });

  it('getAllByCatalogPaginated calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.getAllByCatalogPaginated(1, { limit: 10, page: 0 }));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('getAllByTag calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.getAllByTag({ limit: 10, page: 0 }, 'tag'));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('getAllByTag includes optional filters when provided', async () => {
    await firstValueFrom(
      service.getAllByTag({ limit: 10, page: 0 }, 'tag', {
        idBusiness: 2,
        idProducts: [3],
      }),
    );
    expect(querySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          idBusiness: 2,
          idProducts: [3],
        }),
      }),
    );
  });

  it('getAllByTags calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.getAllByTags({ limit: 10, page: 0 }, ['tag']));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('getAllByTags includes optional filters when provided', async () => {
    await firstValueFrom(
      service.getAllByTags({ limit: 10, page: 0 }, ['tag'], {
        idBusiness: 4,
        idProducts: [5],
      }),
    );
    expect(querySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          idBusiness: 4,
          idProducts: [5],
        }),
      }),
    );
  });

  it('getAllPrimaryProductsByBusiness calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.getAllPrimaryProductsByBusiness({ idBusiness: 1 } as never));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('getAllByBusiness calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.getAllByBusiness(1, { limit: 10, page: 0 }));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('productCollections calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.productCollections());
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('getMainTags calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.getMainTags(5));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('hasLikedProduct calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.hasLikedProduct(1));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('likeProduct calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.likeProduct(1));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('unlikeProduct calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.unlikeProduct(1));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('likeProduct throws when mutation has no data', async () => {
    mutateSpy.mockReturnValueOnce(of({ data: null }));
    await expect(firstValueFrom(service.likeProduct(1))).rejects.toThrow(
      'No data returned from mutation',
    );
  });

  it('unlikeProduct throws when mutation has no data', async () => {
    mutateSpy.mockReturnValueOnce(of({ data: null }));
    await expect(firstValueFrom(service.unlikeProduct(1))).rejects.toThrow(
      'No data returned from mutation',
    );
  });
});
