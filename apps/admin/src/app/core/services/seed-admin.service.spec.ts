import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';
import { createApolloMock } from '../../../testing';
import { SeedAdminService } from './seed-admin.service';

describe('SeedAdminService', () => {
  let service: SeedAdminService;
  let mutateSpy: jest.Mock;

  beforeEach(() => {
    const apollo = createApolloMock({
      mutate: () =>
        of({
          data: {
            seedDevelopmentBusinesses: true,
            seedDevelopmentCatalogs: true,
            seedDevelopmentProducts: true,
          },
        }),
    });
    mutateSpy = apollo.mutateSpy;
    TestBed.configureTestingModule({
      providers: [SeedAdminService, { provide: Apollo, useValue: apollo.mock }],
    });
    service = TestBed.inject(SeedAdminService);
  });

  it('seedDevelopmentBusinesses calls Apollo', async () => {
    await firstValueFrom(service.seedDevelopmentBusinesses());
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('seedDevelopmentCatalogs calls Apollo', async () => {
    await firstValueFrom(service.seedDevelopmentCatalogs());
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('seedDevelopmentProducts calls Apollo', async () => {
    await firstValueFrom(service.seedDevelopmentProducts());
    expect(mutateSpy).toHaveBeenCalled();
  });
});
