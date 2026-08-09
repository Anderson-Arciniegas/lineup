import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';
import { createApolloMock } from '../../testing';
import { ApiClient, GraphqlService } from './graphql.service';

describe('GraphqlService', () => {
  let service: GraphqlService;
  let querySpy: jest.Mock;
  let mutateSpy: jest.Mock;
  let watchQuerySpy: jest.Mock;

  beforeEach(() => {
    const apolloBase = createApolloMock({
      query: () => of({ data: { items: [] } }),
      mutate: () => of({ data: { ok: true } }),
    });
    querySpy = apolloBase.querySpy;
    mutateSpy = apolloBase.mutateSpy;
    watchQuerySpy = jest.fn(() => ({
      valueChanges: of({ data: { watched: true } }),
    }));

    const apollo = {
      use: () => ({
        query: querySpy,
        mutate: mutateSpy,
        watchQuery: watchQuerySpy,
      }),
    } as unknown as Apollo;

    TestBed.configureTestingModule({
      providers: [GraphqlService, { provide: Apollo, useValue: apollo }],
    });
    service = TestBed.inject(GraphqlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('query maps result data', async () => {
    querySpy.mockReturnValueOnce(of({ data: { items: [1] } }));
    const result = await firstValueFrom(
      service.query<{ items: number[] }>({} as never),
    );
    expect(result).toEqual({ items: [1] });
    expect(querySpy).toHaveBeenCalled();
  });

  it('watchQuery$ maps valueChanges data', async () => {
    const result = await firstValueFrom(
      service.watchQuery$<{ watched: boolean }>({} as never),
    );
    expect(result).toEqual({ watched: true });
    expect(watchQuerySpy).toHaveBeenCalled();
  });

  it('mutate maps result data', async () => {
    mutateSpy.mockReturnValueOnce(of({ data: { ok: false } }));
    const result = await firstValueFrom(
      service.mutate<{ ok: boolean }>({} as never),
    );
    expect(result).toEqual({ ok: false });
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('uses ApiClient enum values', () => {
    expect(ApiClient.USER).toBe('userAPI');
    expect(ApiClient.BUSINESS).toBe('businessAPI');
  });
});
