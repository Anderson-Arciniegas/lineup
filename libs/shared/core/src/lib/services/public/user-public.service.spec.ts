import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';
import { createApolloMock } from '../../../testing';
import { SearchTargetEnum } from '../../enums';
import { UserPublicService } from './user-public.service';

describe('UserPublicService', () => {
  let service: UserPublicService;
  let querySpy: jest.Mock;
  let mutateSpy: jest.Mock;

  beforeEach(() => {
    const apollo = createApolloMock({
      query: () => of({ data: {"me":{"id":1},"userById":{"id":1},"featured":{"featuredBusinesses":[],"featuredCatalogs":[],"featuredProducts":[]},"search":{"items":[],"total":0}} as Record<string, unknown> }),
      mutate: () => of({ data: {"login":{"user":{"id":1}},"logout":{"status":true},"createUser":{"user":{"id":1}},"refreshToken":{"user":{"id":1}},"updateUser":{"id":1},"updateUserEmail":{"id":1},"changePassword":true,"recordVisit":true,"registerWithGoogle":{"user":{"id":1}},"loginWithGoogle":{"user":{"id":1}}} as Record<string, unknown> }),
    });
    querySpy = apollo.querySpy;
    mutateSpy = apollo.mutateSpy;
    TestBed.configureTestingModule({
      providers: [UserPublicService, { provide: Apollo, useValue: apollo.mock }],
    });
    service = TestBed.inject(UserPublicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.login('a@b.com', 'pass'));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('logOut calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.logOut());
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('getMe calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.getMe());
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('createUser calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.createUser({ email: "a@b.com" } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('getUser calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.getUser(1));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('refreshToken calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.refreshToken());
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('updateUser calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.updateUser({ id: 1 } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('updateUserEmail calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.updateUserEmail({ email: "a@b.com" } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('changePassword calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.changePassword({ password: "a" } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('recordVisit calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.recordVisit({ idBusiness: 1 } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('featured calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.featured({ limit: 10, page: 0 }));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('search calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.search({ limit: 10, page: 0 }, SearchTargetEnum.PRODUCTS));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('search without product filters omits optional variables', async () => {
    await firstValueFrom(
      service.search({ limit: 10, page: 0 }, SearchTargetEnum.PRODUCTS),
    );
    expect(querySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.not.objectContaining({
          productFilters: expect.anything(),
        }),
      }),
    );
  });

  it('search with product filters compacts optional fields', async () => {
    await firstValueFrom(
      service.search(
        { limit: 10, page: 0 },
        SearchTargetEnum.PRODUCTS,
        {
          location: 'Caracas',
          minPrice: 1,
          maxPrice: 10,
          minRating: 4,
        },
      ),
    );
    expect(querySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          productFilters: {
            location: 'Caracas',
            minPrice: 1,
            maxPrice: 10,
            minRating: 4,
          },
        }),
      }),
    );
  });

  it('search normalizes aliased result fields', async () => {
    querySpy.mockReturnValueOnce(
      of({
        data: {
          search: {
            items: [
              {
                id: 1,
                businessDescription: 'Biz desc',
                businessTags: [{ tag: { name: 'food' } }],
              },
              {
                id: 2,
                productDescription: 'Prod desc',
                productTags: [{ tag: { name: 'tech' } }],
              },
              {
                id: 3,
                description: 'Plain',
                tags: ['plain-tag'],
              },
            ],
            total: 3,
          },
        },
      }),
    );

    const result = await firstValueFrom(
      service.search({ limit: 10, page: 0 }, SearchTargetEnum.PRODUCTS),
    );

    expect(result.items[0]).toEqual(
      expect.objectContaining({ description: 'Biz desc', tags: ['food'] }),
    );
    expect(result.items[1]).toEqual(
      expect.objectContaining({ description: 'Prod desc', tags: ['tech'] }),
    );
    expect(result.items[2]).toEqual(
      expect.objectContaining({ description: 'Plain', tags: ['plain-tag'] }),
    );
  });

  it('registerWithGoogle calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.registerWithGoogle({ token: "t" } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('loginWithGoogle calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.loginWithGoogle({ token: "t" } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });
});
