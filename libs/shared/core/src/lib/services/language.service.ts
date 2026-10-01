import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { languagesList, type Language } from '../config/app.config';
import { LanguageEnum } from '../enums/language.enum';
import { StorageService } from './storage.service';

/** Clave de `localStorage` para la preferencia de idioma (RF59 / HU-30). */
export const PREFERRED_LANGUAGE_STORAGE_KEY = 'preferredLanguage';

const SUPPORTED_LANGS = [LanguageEnum.ES, LanguageEnum.EN] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGS)[number];

/**
 * Gestiona el idioma activo de la UI (`es` | `en`), con default español
 * y persistencia en `localStorage` vía `StorageService`.
 */
@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly _translate = inject(TranslateService);
  private readonly _storage = inject(StorageService);

  /** Idioma activo expuesto para binding del selector. */
  readonly currentLanguage = signal<SupportedLanguage>(LanguageEnum.ES);

  /** Opciones de UI (solo texto: Español / English). */
  readonly languages: Language[] = languagesList;

  /**
   * Registra idiomas, aplica default `es` y restaura la preferencia guardada
   * si es válida; si no hay valor o es inválido, usa español.
   */
  init(): void {
    this._translate.addLangs([...SUPPORTED_LANGS]);
    this._translate.setDefaultLang(LanguageEnum.ES);
    const stored = this._readStoredLanguage();
    this._applyLanguage(stored ?? LanguageEnum.ES, false);
  }

  /** Cambia el idioma activo y lo persiste. */
  setLanguage(lang: string): void {
    const normalized = this._normalize(lang);
    if (!normalized) {
      return;
    }
    this._applyLanguage(normalized, true);
  }

  private _applyLanguage(lang: SupportedLanguage, persist: boolean): void {
    this.currentLanguage.set(lang);
    this._translate.use(lang);
    if (persist) {
      this._storage.set(PREFERRED_LANGUAGE_STORAGE_KEY, lang);
    }
  }

  private _readStoredLanguage(): SupportedLanguage | null {
    const raw = this._storage.get(PREFERRED_LANGUAGE_STORAGE_KEY);
    if (typeof raw !== 'string') {
      return null;
    }
    return this._normalize(raw);
  }

  private _normalize(lang: string): SupportedLanguage | null {
    if (lang === LanguageEnum.ES || lang === LanguageEnum.EN) {
      return lang;
    }
    return null;
  }
}
