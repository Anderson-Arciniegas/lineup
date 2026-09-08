import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';
import { createApolloMock } from '../../../testing';
import { ProductPrivateService } from './product-private.service';

describe('ProductPrivateService', () => {
  let service: ProductPrivateService;
  let querySpy: jest.Mock;
  let mutateSpy: jest.Mock;

  beforeEach(() => {
    const apollo = createApolloMock({
      query: () => of({ data: {"findAllProducts":{"items":[],"total":0},"getAllDraftProducts":{"items":[],"total":0},"getAllByCatalog":[],"getAllByCatalogPaginated":{"items":[],"total":0},"getAllByTag":{"items":[],"total":0},"getAllPrimaryProductsByBusiness":[],"findOneProduct":{"id":1},"getStockByProduct":[],"getStockHistory":[]} as Record<string, unknown> }),
      mutate: () => of({ data: {"createProduct":{"id":1},"updateProduct":{"id":1},"removeProduct":true,"removeProductSku":true,"adjustStock":{"id":1},"registerSale":[],"updateProductSkus":[],"toggleProductIsPrimary":{"id":1}} as Record<string, unknown> }),
    });
    querySpy = apollo.querySpy;
    mutateSpy = apollo.mutateSpy;
    TestBed.configureTestingModule({
      providers: [ProductPrivateService, { provide: Apollo, useValue: apollo.mock }],
    });
    service = TestBed.inject(ProductPrivateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('findAllProducts calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findAllProducts({ limit: 10, page: 0 }));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('getAllDraftProducts calls Apollo with pagination', async () => {
    const pagination = { limit: 10, page: 1, search: 'draft' };
    const result = await firstValueFrom(
      service.getAllDraftProducts(pagination),
    );
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { pagination },
        fetchPolicy: 'network-only',
      }),
    );
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
        idProducts: [1, 2],
      }),
    );
    expect(querySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          idBusiness: 2,
          idProducts: [1, 2],
        }),
      }),
    );
  });

  it('getAllPrimaryProductsByBusiness calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.getAllPrimaryProductsByBusiness({ idBusiness: 1 } as never));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('getAllPrimaryProductsByBusiness includes optional catalog id', async () => {
    await firstValueFrom(
      service.getAllPrimaryProductsByBusiness({ idBusiness: 1, idCatalog: 3 } as never),
    );
    expect(querySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          data: { idBusiness: 1, idCatalog: 3 },
        }),
      }),
    );
  });

  it('findOneProduct calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findOneProduct(1));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('createProduct calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.createProduct({ title: "P" } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('updateProduct calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.updateProduct({ id: 1 } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('removeProduct calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.removeProduct(1));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('removeProductSku calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.removeProductSku(1));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('getStockByProduct calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.getStockByProduct(1));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('getStockHistory calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.getStockHistory(1));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('getStockHistory accepts null sku and custom pagination', async () => {
    await firstValueFrom(service.getStockHistory(null, 10, 5));
    expect(querySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { idProductSku: undefined, limit: 10, offset: 5 },
      }),
    );
  });

  it('adjustStock calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.adjustStock({ idProductSku: 1, quantity: 1 } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('registerSale calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.registerSale({ items: [] } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('updateProductSkus calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.updateProductSkus({ idProduct: 1, skus: [] } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('toggleProductIsPrimary calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.toggleProductIsPrimary(1));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('createProduct throws when mutation has no data', async () => {
    mutateSpy.mockReturnValueOnce(of({ data: null }));
    await expect(
      firstValueFrom(service.createProduct({ title: 'P' } as never)),
    ).rejects.toThrow('No data returned from mutation');
  });

  it('removeProduct throws when mutation has no data', async () => {
    mutateSpy.mockReturnValueOnce(of({ data: null }));
    await expect(firstValueFrom(service.removeProduct(1))).rejects.toThrow(
      'No data returned from mutation',
    );
  });
});
