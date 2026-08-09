import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';
import { createApolloMock } from '../../../testing';
import { BusinessAdminService } from './business-admin.service';

describe('BusinessAdminService', () => {
  let service: BusinessAdminService;
  let querySpy: jest.Mock;

  beforeEach(() => {
    const apollo = createApolloMock({
      query: () =>
        of({
          data: {
            findAllBusinesses: { items: [], total: 0 },
            findOneBusiness: { id: 1 },
          },
        }),
    });
    querySpy = apollo.querySpy;
    TestBed.configureTestingModule({
      providers: [
        BusinessAdminService,
        { provide: Apollo, useValue: apollo.mock },
      ],
    });
    service = TestBed.inject(BusinessAdminService);
  });

  it('findAllBusinesses calls Apollo', async () => {
    await firstValueFrom(service.findAllBusinesses({ page: 1, limit: 10 }));
    expect(querySpy).toHaveBeenCalled();
  });

  it('findOneBusiness calls Apollo', async () => {
    await firstValueFrom(service.findOneBusiness(1));
    expect(querySpy).toHaveBeenCalled();
  });
});
