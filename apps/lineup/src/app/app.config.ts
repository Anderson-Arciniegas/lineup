import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import localeEs from '@angular/common/locales/es';
import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  LOCALE_ID,
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
import { environment } from '@lineup/envs';
import { I18nModule } from '@lineup/i18n';
import { definePreset } from '@primeuix/themes';
import Lara from '@primeuix/themes/lara';
import { provideNamedApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { appRoutes } from './app.routes';

registerLocaleData(localeEs, 'es');
registerLocaleData(localeEs, 'es-ES');

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
    { provide: LOCALE_ID, useValue: 'es-ES' },
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({
      eventCoalescing: true,
    }),
    provideRouter(appRoutes),
    // Signal Store se proporciona automáticamente con providedIn: 'root'
    // No necesitamos provideStore ni provideEffects
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
    MessageService,
    DialogService,
    {
      provide: DynamicDialogConfig,
      useValue: {},
    },
    {
      provide: DynamicDialogRef,
      useFactory: () => null,
    },
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
          connectToDevTools: true,
          cache: new InMemoryCache(),
        },
        // info named client
        businessAPI: {
          link: httpLink.create({
            uri: environment.businessApi,
            withCredentials: true,
          }),
          connectToDevTools: true,
          cache: new InMemoryCache(),
        },
      };
    }),
  ],
};
