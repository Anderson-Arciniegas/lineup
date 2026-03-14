import { getPlatform } from '@angular/core';
import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import { getContext } from '@netlify/angular-runtime/context.mjs';

const angularAppEngine = new AngularAppEngine();

export async function netlifyAppEngineHandler(
  request: Request,
): Promise<Response> {
  // Evita NG0400: destruir cualquier plataforma previa antes de manejar la petición.
  // Puede quedar una plataforma si una petición anterior falló o durante el descubrimiento de rutas.
  const platform = getPlatform();
  if (platform) {
    platform.destroy();
  }

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
