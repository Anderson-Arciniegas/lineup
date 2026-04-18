import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import {
  AngularNodeAppEngine,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import { getContext } from '@netlify/angular-runtime/context.mjs';
import { environment } from '@lineup/envs';
import compression from 'compression';
import express from 'express';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const angularAppEngine = new AngularAppEngine();
const EDGE_CACHE_CONTROL_HEADER =
  'public, max-age=0, s-maxage=300, stale-while-revalidate=86400';
const NO_STORE_CACHE_CONTROL_HEADER = 'no-store';

function isCacheablePublicRoute(pathname: string): boolean {
  return pathname === '/' || pathname === '/home';
}

/**
 * Mismo contrato que `proxy.conf.json` y `public/_redirects`: el cliente del PDF
 * hace `fetch` same-origin a `catalogPdfMediaProxy.localPathPrefix`; sin este
 * proxy en Node, la petición cae en Angular y devuelve HTML → las imágenes no se incrustan.
 */
function createCatalogPdfMediaProxy(): express.RequestHandler {
  const cfg = environment.catalogPdfMediaProxy;
  if (!cfg) {
    return (_req, _res, next) => next();
  }
  const originBase = cfg.s3OriginPrefix.replace(/\/$/, '');
  const prefix = cfg.localPathPrefix.replace(/\/$/, '');

  return async (req, res, next) => {
    const matchesPath =
      req.originalUrl.startsWith(`${prefix}/`) || req.originalUrl === prefix;
    if (!matchesPath) {
      next();
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.status(405).end();
      return;
    }
    const tail =
      req.originalUrl.length <= prefix.length
        ? '/'
        : req.originalUrl.slice(prefix.length);
    const upstreamUrl = `${originBase}${tail.startsWith('/') ? tail : `/${tail}`}`;
    try {
      const upstream = await fetch(upstreamUrl, {
        method: req.method,
        redirect: 'follow',
        headers: {
          'User-Agent': (req.headers['user-agent'] as string) || 'lineup-ssr-media-proxy',
        },
      });
      res.status(upstream.status);
      const passHeader = (name: string) => {
        const v = upstream.headers.get(name);
        if (v) res.setHeader(name, v);
      };
      passHeader('content-type');
      passHeader('cache-control');
      passHeader('etag');
      passHeader('content-length');
      passHeader('last-modified');
      if (req.method === 'HEAD') {
        res.end();
        return;
      }
      const body = Buffer.from(await upstream.arrayBuffer());
      res.send(body);
    } catch (err) {
      next(err);
    }
  };
}

function resolveHtmlCacheControlHeader(
  requestMethod: string,
  pathname: string,
  hasCookie: boolean,
): string {
  const isGetLikeMethod = requestMethod === 'GET' || requestMethod === 'HEAD';
  if (!isGetLikeMethod || hasCookie) {
    return NO_STORE_CACHE_CONTROL_HEADER;
  }
  return isCacheablePublicRoute(pathname)
    ? EDGE_CACHE_CONTROL_HEADER
    : NO_STORE_CACHE_CONTROL_HEADER;
}

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

  app.use(createCatalogPdfMediaProxy());

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
            const host = req.headers.host ?? 'localhost';
            const pathname = new URL(req.originalUrl, `http://${host}`).pathname;
            const cacheControlHeader = resolveHtmlCacheControlHeader(
              req.method,
              pathname,
              Boolean(req.headers.cookie),
            );
            response.headers.set('Cache-Control', cacheControlHeader);
          }
          await writeResponseToNodeResponse(response, res);
        } else {
          next();
        }
      })
      .catch(next);
  });

  const port = Number(process.env['PORT'] ?? 4200);
  const host = process.env['HOST'] ?? '0.0.0.0';
  app.listen(port, host, () => {
    console.log(`SSR listening on http://${host}:${port}`);
  });
}
