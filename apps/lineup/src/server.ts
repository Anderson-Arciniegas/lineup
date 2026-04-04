import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import { getContext } from '@netlify/angular-runtime/context.mjs';

const angularAppEngine = new AngularAppEngine();

export async function netlifyAppEngineHandler(
  request: Request,
): Promise<Response> {
  // No llamar a getPlatform()?.destroy() aquí: con peticiones concurrentes o recargas
  // rápidas (HMR), la siguiente petición destruía el inyector mientras la anterior
  // seguía renderizando → NG0205 Injector has already been destroyed.
  // AngularAppEngine gestiona el ciclo de vida; los fallos en bootstrap los limpia el propio SSR.

  const context = getContext();

  // Example API endpoints can be defined here.
  // Uncomment and define endpoints as necessary.
  // const pathname = new URL(request.url).pathname;
  // if (pathname === '/api/hello') {
  //   return Response.json({ message: 'Hello from the API' });
  // }

  const result = await angularAppEngine.handle(request, context);
  return result || new Response('Not found', { status: 404 });
}

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createRequestHandler(netlifyAppEngineHandler);
