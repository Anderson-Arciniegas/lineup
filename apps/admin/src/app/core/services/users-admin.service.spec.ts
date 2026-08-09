import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';
import { createApolloMock } from '../../../testing';
import { UsersAdminService } from './users-admin.service';

describe('UsersAdminService', () => {
  let service: UsersAdminService;
  let querySpy: jest.Mock;
  let mutateSpy: jest.Mock;

  beforeEach(() => {
    const apollo = createApolloMock({
      query: () =>
        of({
          data: {
            findAllUsers: { items: [], total: 0 },
            findOneUser: { id: 1 },
          },
        }),
      mutate: () =>
        of({
          data: {
            createUser: { id: 1 },
            updateUser: { id: 1 },
            removeUser: true,
          },
        }),
    });
    querySpy = apollo.querySpy;
    mutateSpy = apollo.mutateSpy;
    TestBed.configureTestingModule({
      providers: [UsersAdminService, { provide: Apollo, useValue: apollo.mock }],
    });
    service = TestBed.inject(UsersAdminService);
  });

  it('findAllUsers calls Apollo', async () => {
    const result = await firstValueFrom(
      service.findAllUsers({ page: 1, limit: 10 }),
    );
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('findOneUser calls Apollo', async () => {
    await firstValueFrom(service.findOneUser(1));
    expect(querySpy).toHaveBeenCalled();
  });

  it('createUser calls Apollo', async () => {
    await firstValueFrom(service.createUser({ email: 'a@test.com' } as never));
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('updateUser calls Apollo', async () => {
    await firstValueFrom(service.updateUser({ id: 1 } as never));
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('removeUser calls Apollo', async () => {
    await firstValueFrom(service.removeUser(1));
    expect(mutateSpy).toHaveBeenCalled();
  });
});
