import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AdminApp } from './app/admin-app';

bootstrapApplication(AdminApp, appConfig).catch((err) => console.error(err));
