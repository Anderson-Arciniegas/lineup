import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import {
  provideAnimationsAsync
} from '@angular/platform-browser/animations/async';
import {
  provideRouter
} from '@angular/router';
import {
  I18nModule
} from '@lineup/i18n';
import {
  definePreset
} from '@primeuix/themes';
import Lara from '@primeuix/themes/lara';

import {
  providePrimeNG,
} from 'primeng/config';
import {
  appRoutes
} from './app.routes';


const MyPreset = definePreset(Lara, {
    semantic: {
        primary: {
            50: '#F6F6F6',
            100: '#E7E7E7',
            200: '#D1D1D1',
            300: '#888888',
            400: '#6D6D6D',
            500: '#5D5D5D',
            600: '#4F4F4F',
            700: '#454545',
            800: '#343434',
            900: '#262626',
            950: '#1A1A1A',
        },
        colorScheme: {
            light: {
                primary: {
                    color: '{primary.800}', // Aquí es donde especificas que el color principal en el esquema 'light' sea el 800
                    inverseColor: '#ffffff', // Color de texto para contraste
                    hoverColor: '{primary.900}', // Color al pasar el ratón
                    activeColor: '{primary.700}' // Color al hacer click/activo
                },
                // Si tienes un esquema dark, también lo configuras aquí
            },
            dark: {
                primary: {
                    color: '{primary.50}', // Por ejemplo, un color más claro para el modo oscuro
                    inverseColor: '{zinc.950}',
                    hoverColor: '{primary.100}',
                    activeColor: '{primary.50}'
                }
            }
        },
    }
});

export const appConfig: ApplicationConfig = {
    providers: [
        provideClientHydration(withEventReplay()),
        provideBrowserGlobalErrorListeners(),
        provideZoneChangeDetection({
            eventCoalescing: true
        }),
        provideRouter(appRoutes),
        importProvidersFrom(I18nModule),
        provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: MyPreset,
                options: {

                    darkModeSelector: '.my-app-dark',

                    cssLayer: {
                        name: 'primeng',
                        order: 'theme, base, primeng'
                    }
                }
            },
        })
    ],
};