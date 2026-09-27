import { Injector } from '@angular/core';
import { ApolloLink, execute, gql } from '@apollo/client/core';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import {
  ApiErrorService,
  AppConfigService,
  SKIP_GLOBAL_ERROR_TOAST_APOLLO_CONTEXT,
  ToastService,
} from '@lineup/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { createGlobalErrorLink } from './global-error.link';

const QUERY = gql`
  query Ping {
    ping
  }
`;

/** Cliente mínimo que `ErrorLink` consulta para detectar resultados incrementales. */
const fakeClient = {
  queryManager: {
    incrementalHandler: {
      isIncrementalResult: () => false,
      extractErrors: () => undefined,
    },
  },
} as never;

/** Ejecuta la cadena de links y espera a que termine (next o error). */
const run = (
  link: ApolloLink,
  context: Record<string, unknown> = {},
): Promise<{ result?: unknown; error?: unknown }> =>
  new Promise((resolve) => {
    execute(link, { query: QUERY, context }, { client: fakeClient }).subscribe({
      next: (result) => resolve({ result }),
      error: (error) => resolve({ error }),
    });
  });

describe('createGlobalErrorLink', () => {
  let apiErrorToast: jest.Mock;
  let isCookieNotSentError: jest.Mock;
  let removeUser: jest.Mock;
  let routerUrl: string;
  let toast: ToastService;

  const buildLink = (): ApolloLink =>
    createGlobalErrorLink({
      toast,
      apiError: { isCookieNotSentError } as unknown as ApiErrorService,
      router: {
        get url() {
          return routerUrl;
        },
      } as never,
      injector: {
        get: (token: unknown) => {
          if (token === AuthService) {
            return { removeUser };
          }
          throw new Error(`Unexpected token: ${String(token)}`);
        },
      } as Injector,
    });

  beforeEach(() => {
    apiErrorToast = jest.fn();
    isCookieNotSentError = jest.fn(() => false);
    removeUser = jest.fn();
    routerUrl = '/';
    toast = { apiError: apiErrorToast } as unknown as ToastService;
  });

  it('muestra el toast y deja pasar el error GraphQL a la vista', async () => {
    const graphqlError = new CombinedGraphQLErrors({
      data: null,
      errors: [{ message: 'Unauthorized', code: 401 } as never],
    });
    const failing = new ApolloLink(
      () =>
        new Observable((observer) => {
          observer.error(graphqlError);
        }),
    );

    const { error } = await run(ApolloLink.from([buildLink(), failing]));

    expect(apiErrorToast).toHaveBeenCalledWith(graphqlError);
    expect(error).toBe(graphqlError);
    expect(removeUser).not.toHaveBeenCalled();
  });

  it('muestra el toast ante errores de red', async () => {
    const networkError = new TypeError('Failed to fetch');
    const failing = new ApolloLink(
      () =>
        new Observable((observer) => {
          observer.error(networkError);
        }),
    );

    const { error } = await run(ApolloLink.from([buildLink(), failing]));

    expect(apiErrorToast).toHaveBeenCalledWith(networkError);
    expect(error).toBe(networkError);
  });

  it('no muestra toast cuando la operación pide skipGlobalErrorToast', async () => {
    const failing = new ApolloLink(
      () =>
        new Observable((observer) => {
          observer.error(new Error('silenced'));
        }),
    );

    const { error } = await run(ApolloLink.from([buildLink(), failing]), {
      ...SKIP_GLOBAL_ERROR_TOAST_APOLLO_CONTEXT,
    });

    expect(apiErrorToast).not.toHaveBeenCalled();
    expect(error).toBeInstanceOf(Error);
  });

  it('no interviene en respuestas correctas', async () => {
    const ok = new ApolloLink(
      () =>
        new Observable((observer) => {
          observer.next({ data: { ping: 'pong' } });
          observer.complete();
        }),
    );

    const { result } = await run(ApolloLink.from([buildLink(), ok]));

    expect(result).toEqual({ data: { ping: 'pong' } });
    expect(apiErrorToast).not.toHaveBeenCalled();
  });

  it('limpia sesión en Cookie not sent dentro de ruta autenticada', async () => {
    isCookieNotSentError.mockReturnValue(true);
    routerUrl = `/${AppConfigService.config.routes.dashboard}/inventory`;
    const cookieError = new CombinedGraphQLErrors({
      data: null,
      errors: [{ message: 'Cookie not sent', code: 500 } as never],
    });
    const failing = new ApolloLink(
      () =>
        new Observable((observer) => {
          observer.error(cookieError);
        }),
    );

    await run(ApolloLink.from([buildLink(), failing]));

    expect(removeUser).toHaveBeenCalledWith(true);
    expect(apiErrorToast).toHaveBeenCalledWith(cookieError);
  });

  it('no limpia sesión en Cookie not sent en ruta pública', async () => {
    isCookieNotSentError.mockReturnValue(true);
    routerUrl = '/login';
    const cookieError = new CombinedGraphQLErrors({
      data: null,
      errors: [{ message: 'Cookie not sent', code: 500 } as never],
    });
    const failing = new ApolloLink(
      () =>
        new Observable((observer) => {
          observer.error(cookieError);
        }),
    );

    await run(ApolloLink.from([buildLink(), failing]));

    expect(removeUser).not.toHaveBeenCalled();
    expect(apiErrorToast).toHaveBeenCalledWith(cookieError);
  });
});
