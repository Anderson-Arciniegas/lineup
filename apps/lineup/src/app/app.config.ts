import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { InMemoryCache } from '@apollo/client/core';
import { I18nModule } from '@lineup/i18n';
import { definePreset } from '@primeuix/themes';
import Lara from '@primeuix/themes/lara';
import { provideNamedApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { providePrimeNG } from 'primeng/config';
import { environment } from '../environment/environment';
import { appRoutes } from './app.routes';
import { appReducers } from '@lineup/core';

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
          activeColor: '{primary.700}', // Color al hacer click/activo
        },
        // Si tienes un esquema dark, también lo configuras aquí
      },
      dark: {
        primary: {
          color: '{primary.50}', // Por ejemplo, un color más claro para el modo oscuro
          inverseColor: '{zinc.950}',
          hoverColor: '{primary.100}',
          activeColor: '{primary.50}',
        },
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({
      eventCoalescing: true,
    }),
    provideRouter(appRoutes),
    provideStore(appReducers),
    provideEffects(),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
    importProvidersFrom(I18nModule),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: '.my-app-dark',

          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng',
          },
        },
      },
    }),
    provideHttpClient(withFetch()),
    provideNamedApollo(() => {
      const httpLink = inject(HttpLink);

      return {
        // Default client
        userAPI: {
          link: httpLink.create({
            uri: environment.userApi,
          }),
          cache: new InMemoryCache(),
        },
        // Secondary named client
        businessAPI: {
          link: httpLink.create({
            uri: environment.businessApi,
          }),
          cache: new InMemoryCache(),
        },
      };
    }),
  ],
};
