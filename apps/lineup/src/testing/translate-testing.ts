import { TranslateModule } from '@ngx-translate/core';

/** Configuración estándar de i18n en specs de la app `lineup`. */
export function translateModuleForTests() {
  return TranslateModule.forRoot();
}
