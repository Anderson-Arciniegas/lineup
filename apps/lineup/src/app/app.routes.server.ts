import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rutas que usan Server para evitar errores de getPrerenderParams con parámetros dinámicos/catch-all
  {
    path: 'profile/**',
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
    path: ':business/edit',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => [
      {
        business: 'business-1',
      },
      {
        business: 'business-2',
      },
    ],
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
