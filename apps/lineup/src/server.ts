import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import {
  AngularNodeAppEngine,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import { getContext } from '@netlify/angular-runtime/context.mjs';
import compression from 'compression';
import express from 'express';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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

/**
 * Servidor Node/Express para VPS, Docker, etc. Netlify sigue usando `reqHandler`.
 */
if (isMainModule(import.meta.url)) {
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = join(serverDistFolder, '../browser');
  const angularNodeAppEngine = new AngularNodeAppEngine();
  const app = express();
  app.disable('x-powered-by');
  app.use(
    compression({
      threshold: 1024,
    }),
  );

  app.use(
    express.static(browserDistFolder, {
      maxAge: '1y',
      immutable: true,
      index: false,
      redirect: false,
      setHeaders: (response, filePath) => {
        if (filePath.endsWith('.html')) {
          response.setHeader('Cache-Control', 'no-cache');
        }
      },
    }),
  );

  app.use('/**', (req, res, next) => {
    angularNodeAppEngine
      .handle(req)
      .then(async (response) => {
        if (response) {
          const contentType = response.headers.get('content-type') ?? '';
          if (
            contentType.includes('text/html') &&
            !response.headers.has('cache-control')
          ) {
            response.headers.set('Cache-Control', 'no-store');
          }
          await writeResponseToNodeResponse(response, res);
        } else {
          next();
        }
      })
      .catch(next);
  });

  const port = Number(process.env['PORT'] ?? 4000);
  const host = process.env['HOST'] ?? '0.0.0.0';
  app.listen(port, host, () => {
    console.log(`SSR listening on http://${host}:${port}`);
  });
}
