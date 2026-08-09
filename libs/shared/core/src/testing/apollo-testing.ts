/**
 * Helpers de testing para `@lineup/core` (Apollo, storage).
 */
import { Apollo } from 'apollo-angular';
import { Observable, of, throwError } from 'rxjs';

export type ApolloQueryResult<T = Record<string, unknown>> = { data: T };
export type ApolloMutateResult<T = Record<string, unknown>> = { data: T };

export interface ApolloMockHandlers {
  query?: () => Observable<ApolloQueryResult>;
  mutate?: () => Observable<ApolloMutateResult>;
}

export function createApolloMock(
  handlers: ApolloMockHandlers = {},
): { mock: Apollo; querySpy: jest.Mock; mutateSpy: jest.Mock } {
  const querySpy = jest.fn(
    handlers.query ??
      (() => of({ data: {} } as ApolloQueryResult)),
  );
  const mutateSpy = jest.fn(
    handlers.mutate ??
      (() => of({ data: {} } as ApolloMutateResult)),
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

export function apolloError$(message = 'GraphQL error'): Observable<never> {
  return throwError(() => new Error(message));
}

export function createMemoryStorageMock(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => void store.delete(key),
    setItem: (key: string, value: string) => void store.set(key, value),
  } as Storage;
}
