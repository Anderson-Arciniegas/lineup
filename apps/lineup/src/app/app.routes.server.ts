import {
  RenderMode,
  ServerRoute
} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [{
        path: ':business',
        renderMode: RenderMode.Server,
    },
    {
        path: ':business/product/:id',
        renderMode: RenderMode.Prerender,
        getPrerenderParams: async () => [{
                business: 'empresa-1',
                id: 'a'
            },
            {
                business: 'empresa-1',
                id: 'b'
            }
        ]
    }, {
        path: '**',
        renderMode: RenderMode.Prerender,
    },
];