import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { UniversalTranslateLoader } from './universal-translate-loader';

@NgModule({
  imports: [
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: UniversalTranslateLoader,
      },
      defaultLanguage: 'es',
    }),
  ],
  exports: [TranslateModule],
})
export class I18nModule {}