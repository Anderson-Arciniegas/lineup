import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';
import { createApolloMock } from '../../../testing';
import { CatalogPrivateService } from './catalog-private.service';

describe('CatalogPrivateService', () => {
  let service: CatalogPrivateService;
  let querySpy: jest.Mock;
  let mutateSpy: jest.Mock;

  beforeEach(() => {
    const apollo = createApolloMock({
      query: () => of({ data: {"findAllCatalogs":{"items":[],"total":0},"findAllMyCatalogs":{"items":[],"total":0},"findOneCatalog":{"id":1},"findOneCatalogByPath":{"id":1},"findCatalogsByBusinessId":{"items":[],"total":0}} as Record<string, unknown> }),
      mutate: () => of({ data: {"createCatalog":{"id":1},"updateCatalog":{"id":1},"removeCatalog":{"id":1}} as Record<string, unknown> }),
    });
    querySpy = apollo.querySpy;
    mutateSpy = apollo.mutateSpy;
    TestBed.configureTestingModule({
      providers: [CatalogPrivateService, { provide: Apollo, useValue: apollo.mock }],
    });
    service = TestBed.inject(CatalogPrivateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('findAllCatalogs calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findAllCatalogs({ limit: 10, page: 0 }));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('findAllMyCatalogs calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findAllMyCatalogs({ limit: 10, page: 0 }));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('findOneCatalog calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findOneCatalog(1));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('findOneCatalogByPath calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findOneCatalogByPath('path'));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('findCatalogsByBusinessId calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findCatalogsByBusinessId(1, { limit: 10, page: 0 }));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('createCatalog calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.createCatalog({ title: "Cat" } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('updateCatalog calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.updateCatalog({ id: 1 } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('removeCatalog calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.removeCatalog(1));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('createCatalog throws when mutation has no data', async () => {
    mutateSpy.mockReturnValueOnce(of({ data: null }));
    await expect(
      firstValueFrom(service.createCatalog({ title: 'Cat' } as never)),
    ).rejects.toThrow('No data returned from mutation');
  });

  it('updateCatalog throws when mutation has no data', async () => {
    mutateSpy.mockReturnValueOnce(of({ data: null }));
    await expect(
      firstValueFrom(service.updateCatalog({ id: 1 } as never)),
    ).rejects.toThrow('No data returned from mutation');
  });

  it('removeCatalog throws when mutation has no data', async () => {
    mutateSpy.mockReturnValueOnce(of({ data: null }));
    await expect(firstValueFrom(service.removeCatalog(1))).rejects.toThrow(
      'No data returned from mutation',
    );
  });
});
