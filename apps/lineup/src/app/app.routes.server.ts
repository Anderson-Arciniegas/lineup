import {
    RenderMode,
    ServerRoute
} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [{
        path: ':business',
        renderMode: RenderMode.Server,
    },
    {
        path: ':business/edit',
        renderMode: RenderMode.Prerender,
        getPrerenderParams: async () => [{
                business: 'business-1'
            },
            {
                business: 'business-2'
            }
        ],
    },
    {
        path: ':business/lineup/:name',
        renderMode: RenderMode.Prerender,
        getPrerenderParams: async () => [{
                business: 'business-1',
                name: '1-catalog'
            },
            {
                business: 'business-2',
                name: '2-catalog'
            }
        ],
    },
    {
        path: ':business/lineup/:name/:idProduct',
        renderMode: RenderMode.Prerender,
        getPrerenderParams: async () => [{
                business: 'business-1',
                name: '1-catalog',
                idProduct: '1'
            },
            {
                business: 'business-2',
                name: '2-catalog',
                idProduct: '2'
            }
        ],
    },

    {
        path: '**',
        renderMode: RenderMode.Prerender,
    },
];