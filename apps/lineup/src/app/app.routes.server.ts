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
  {
    path: ':business/**',
    renderMode: RenderMode.Server,
  },
  {
    path: ':business',
    renderMode: RenderMode.Server,
  },
  {
    path: ':business/:catalogPath',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => [
      {
        business: 'business-1',
        catalogPath: 'catalog-1',
      },
      {
        business: 'business-2',
        catalogPath: 'catalog-2',
      },
    ],
  },
  {
    path: ':business/:catalogPath/:idProduct',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => [
      {
        business: 'business-1',
        catalogPath: 'catalog-1',
        idProduct: '1',
      },
      {
        business: 'business-2',
        catalogPath: 'catalog-2',
        idProduct: '2',
      },
    ],
  },

  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
