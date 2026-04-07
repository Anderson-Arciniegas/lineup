import { Apollo } from 'apollo-angular';
import { Observable, of, throwError } from 'rxjs';

export type ApolloQueryResult<T = Record<string, unknown>> = { data: T };
export type ApolloMutateResult<T = Record<string, unknown>> = { data: T };

export interface ApolloMockHandlers {
  query?: <T = Record<string, unknown>>() => Observable<ApolloQueryResult<T>>;
  mutate?: <T = Record<string, unknown>>() => Observable<ApolloMutateResult<T>>;
}

/**
 * Factory para mockear `Apollo` en tests de componentes: `use()` devuelve handlers configurables.
 */
export function createApolloMock(
  handlers: ApolloMockHandlers = {},
): { mock: Apollo; querySpy: jest.Mock; mutateSpy: jest.Mock } {
  const querySpy = jest.fn(
    handlers.query ??
      (<T>() => of({ data: {} } as ApolloQueryResult<T>)),
  );
  const mutateSpy = jest.fn(
    handlers.mutate ??
      (<T>() => of({ data: {} } as ApolloMutateResult<T>)),
  );
  const mock = {
    use: () => ({
      query: querySpy,
      mutate: mutateSpy,
      subscribe: jest.fn(),
    }),
  } as unknown as Apollo;
  return { mock, querySpy, mutateSpy };
}

/** Atajo para forzar error en query/mutate en un test concreto. */
export function apolloError$(message = 'GraphQL error'): Observable<never> {
  return throwError(() => new Error(message));
}
