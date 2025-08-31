import { Injectable } from '@angular/core';
import {
    appRoutes,
    Config,
    languagesList,
} from '../app.config';
@Injectable({
    providedIn: 'root',
})
export class AppConfigService {
    static config: Partial<Config> = {
        routes: appRoutes,
        languages: languagesList,
    };

}
