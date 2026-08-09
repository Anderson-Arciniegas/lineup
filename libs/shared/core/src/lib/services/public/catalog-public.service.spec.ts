import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';
import { createApolloMock } from '../../../testing';
import { CatalogPublicService } from './catalog-public.service';

describe('CatalogPublicService', () => {
  let service: CatalogPublicService;
  let querySpy: jest.Mock;
  let mutateSpy: jest.Mock;

  beforeEach(() => {
    const apollo = createApolloMock({
      query: () => of({ data: {"findCatalogsByBusinessId":{"items":[],"total":0},"findOneCatalog":{"id":1},"findOneCatalogByPath":{"id":1}} as Record<string, unknown> }),
    });
    querySpy = apollo.querySpy;
    mutateSpy = apollo.mutateSpy;
    TestBed.configureTestingModule({
      providers: [CatalogPublicService, { provide: Apollo, useValue: apollo.mock }],
    });
    service = TestBed.inject(CatalogPublicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('findCatalogsByBusinessId calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findCatalogsByBusinessId(1, { limit: 10, page: 0 }));
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
});
