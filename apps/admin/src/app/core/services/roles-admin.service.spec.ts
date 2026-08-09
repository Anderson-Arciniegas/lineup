import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';
import { createApolloMock } from '../../../testing';
import { RolesAdminService } from './roles-admin.service';

describe('RolesAdminService', () => {
  let service: RolesAdminService;
  let querySpy: jest.Mock;
  let mutateSpy: jest.Mock;

  beforeEach(() => {
    const apollo = createApolloMock({
      query: () =>
        of({
          data: {
            getAllRoles: [],
            getRolesByBusiness: [],
            getRolesByUser: [],
          },
        }),
      mutate: () =>
        of({
          data: {
            assignRoleToBusiness: { id: 1 },
            assignRoleToUser: { id: 1 },
            removeRoleFromBusiness: true,
            removeRoleFromUser: true,
          },
        }),
    });
    querySpy = apollo.querySpy;
    mutateSpy = apollo.mutateSpy;
    TestBed.configureTestingModule({
      providers: [RolesAdminService, { provide: Apollo, useValue: apollo.mock }],
    });
    service = TestBed.inject(RolesAdminService);
  });

  it('getAllRoles calls Apollo', async () => {
    await firstValueFrom(service.getAllRoles());
    expect(querySpy).toHaveBeenCalled();
  });

  it('getRolesByBusiness calls Apollo', async () => {
    await firstValueFrom(service.getRolesByBusiness(1));
    expect(querySpy).toHaveBeenCalled();
  });

  it('getRolesByUser calls Apollo', async () => {
    await firstValueFrom(service.getRolesByUser(1));
    expect(querySpy).toHaveBeenCalled();
  });

  it('assignRoleToBusiness calls Apollo', async () => {
    await firstValueFrom(
      service.assignRoleToBusiness({ idBusiness: 1, idRole: 1 } as never),
    );
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('assignRoleToUser calls Apollo', async () => {
    await firstValueFrom(
      service.assignRoleToUser({ idUser: 1, idRole: 1 } as never),
    );
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('removeRoleFromBusiness calls Apollo', async () => {
    await firstValueFrom(
      service.removeRoleFromBusiness({ idBusiness: 1, idRole: 1 } as never),
    );
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('removeRoleFromUser calls Apollo', async () => {
    await firstValueFrom(
      service.removeRoleFromUser({ idUser: 1, idRole: 1 } as never),
    );
    expect(mutateSpy).toHaveBeenCalled();
  });
});
