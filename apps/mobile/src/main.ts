import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { App } from './app/app';
import { appRoutes } from './app/app.routes';

bootstrapApplication(App, {
  providers: [
    provideRouter(appRoutes),
    importProvidersFrom(IonicModule.forRoot()), // habilita Ionic
  ],
}).catch(err => console.error(err));