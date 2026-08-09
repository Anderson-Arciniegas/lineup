import { TranslateLoader } from '@ngx-translate/core';
import { from, Observable } from 'rxjs';

export class UniversalTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<Record<string, unknown>> {
    return from(this.loadTranslations(lang));
  }

  private loadTranslations(lang: string): Promise<Record<string, unknown>> {
    if (lang === 'en') {
      return import('./en').then(({ en }) => en);
    }

    return import('./es').then(({ es }) => es);
  }
}
