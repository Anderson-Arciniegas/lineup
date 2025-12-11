import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  isDevMode,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { InMemoryCache } from '@apollo/client/core';
import { appReducers } from '@lineup/core';
import { I18nModule } from '@lineup/i18n';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { definePreset } from '@primeuix/themes';
import Lara from '@primeuix/themes/lara';
import { provideNamedApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { providePrimeNG } from 'primeng/config';
import { environment } from '../environment/environment';
import { appRoutes } from './app.routes';

const MyPreset = definePreset(Lara, {
  semantic: {
    // palette principal (primary) y la secundaria que quieres usar
    primary: {
      50: '#FFFFFF',
      100: '#FCFCFC',
      200: '#F0F0F0',
      300: '#888888',
      400: '#6D6D6D',
      500: '#5D5D5D',
      600: '#4F4F4F',
      700: '#454545',
      800: '#343434',
      900: '#262626',
      950: '#1A1A1A',
    },
    // colorScheme opcional para light / dark (refieren tokens anteriores)
    colorScheme: {
      light: {
        primary: {
          color: '{primary.800}',
          inverseColor: '#ffffff',
          hoverColor: '{primary.900}',
          activeColor: '{primary.700}',
        },
      },
      dark: {
        primary: {
          color: '{primary.50}',
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
    // Usamos XHR (por defecto) en lugar de fetch para que las cookies con
    // withCredentials se conserven correctamente tras el login y al recargar.
    provideHttpClient(),
    provideNamedApollo(() => {
      const httpLink = inject(HttpLink);

      return {
        // Default client
        userAPI: {
          link: httpLink.create({
            uri: environment.userApi,
            withCredentials: true,
          }),
          cache: new InMemoryCache(),
        },
        // info named client
        businessAPI: {
          link: httpLink.create({
            uri: environment.businessApi,
            withCredentials: true,
          }),
          cache: new InMemoryCache(),
        },
      };
    }),
  ],
};
