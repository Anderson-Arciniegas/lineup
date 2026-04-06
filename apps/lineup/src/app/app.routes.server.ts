import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rutas autenticadas: siempre client-side para evitar que los guards
  // corran en el servidor sin contexto de auth (causaría flash de login).
  {
    path: 'login',
    renderMode: RenderMode.Client,
  },
  {
    path: 'register',
    renderMode: RenderMode.Client,
  },
  {
    path: 'register/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'dashboard',
    renderMode: RenderMode.Client,
  },
  {
    path: 'dashboard/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'profile',
    renderMode: RenderMode.Client,
  },
  {
    path: 'profile/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'tag/:tag',
    renderMode: RenderMode.Server,
  },
  {
    path: 'search/:query',
    renderMode: RenderMode.Server,
  },
  // Segmentos literales antes de :idProduct para que el motor SSR no trate
  // "download" u otros como id de producto.
  {
    path: ':business/:catalogPath/download',
    renderMode: RenderMode.Server,
  },
  {
    path: ':business/:catalogPath/create-product',
    renderMode: RenderMode.Server,
  },
  {
    path: ':business/**',
    renderMode: RenderMode.Server,
  },
  {
    path: ':business',
    renderMode: RenderMode.Server,
  },
  // SSR en tiempo de petición: estas vistas llaman a GraphQL en ngOnInit;
  // el prerender en build no tiene API fiable y acaba en timeout.
  {
    path: ':business/:catalogPath',
    renderMode: RenderMode.Server,
  },
  {
    path: ':business/:catalogPath/:idProduct',
    renderMode: RenderMode.Server,
  },

  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
