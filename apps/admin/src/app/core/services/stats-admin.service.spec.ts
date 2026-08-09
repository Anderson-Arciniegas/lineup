import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';
import { createApolloMock } from '../../../testing';
import { StatsAdminService } from './stats-admin.service';

describe('StatsAdminService', () => {
  let service: StatsAdminService;
  let querySpy: jest.Mock;

  beforeEach(() => {
    const apollo = createApolloMock({
      query: () =>
        of({
          data: {
            adminBusinessStats: {},
            adminCatalogGlobalStats: {},
            adminDiscountGlobalStats: {},
            adminPlatformEngagementStats: {},
            adminUserStats: {},
          },
        }),
    });
    querySpy = apollo.querySpy;
    TestBed.configureTestingModule({
      providers: [StatsAdminService, { provide: Apollo, useValue: apollo.mock }],
    });
    service = TestBed.inject(StatsAdminService);
  });

  it('adminBusinessStats calls Apollo', async () => {
    await firstValueFrom(service.adminBusinessStats());
    expect(querySpy).toHaveBeenCalled();
  });

  it('adminCatalogGlobalStats calls Apollo', async () => {
    await firstValueFrom(service.adminCatalogGlobalStats());
    expect(querySpy).toHaveBeenCalled();
  });

  it('adminDiscountGlobalStats calls Apollo', async () => {
    await firstValueFrom(service.adminDiscountGlobalStats({ days: 7 }));
    expect(querySpy).toHaveBeenCalled();
  });

  it('adminPlatformEngagementStats calls Apollo', async () => {
    await firstValueFrom(service.adminPlatformEngagementStats());
    expect(querySpy).toHaveBeenCalled();
  });

  it('adminUserStats calls Apollo', async () => {
    await firstValueFrom(service.adminUserStats());
    expect(querySpy).toHaveBeenCalled();
  });
});
