
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { en } from './en';
import { es } from './es';

export class UniversalTranslateLoader implements TranslateLoader {
    getTranslation(lang: string): Observable<any> {
        return new Observable((observer) => {
            if (lang === 'es') {
                observer.next(es);
            } else {
                observer.next(en);
            }
            observer.complete();
        });
    }
}
