import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { LanguageEnum } from '../enums/language.enum';
import {
  LanguageService,
  PREFERRED_LANGUAGE_STORAGE_KEY,
} from './language.service';
import { StorageService } from './storage.service';

describe('LanguageService (HU-30 / RF59)', () => {
  let service: LanguageService;
  let translate: {
    addLangs: jest.Mock;
    setDefaultLang: jest.Mock;
    use: jest.Mock;
  };
  let storage: { get: jest.Mock; set: jest.Mock };

  const configure = (stored: unknown = null): void => {
    translate = {
      addLangs: jest.fn(),
      setDefaultLang: jest.fn(),
      use: jest.fn(),
    };
    storage = {
      get: jest.fn(() => stored),
      set: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        LanguageService,
        { provide: TranslateService, useValue: translate },
        { provide: StorageService, useValue: storage },
      ],
    });
    service = TestBed.inject(LanguageService);
  };

  it('init usa español cuando no hay preferencia guardada', () => {
    configure(null);
    service.init();

    expect(translate.addLangs).toHaveBeenCalledWith(['es', 'en']);
    expect(translate.setDefaultLang).toHaveBeenCalledWith(LanguageEnum.ES);
    expect(translate.use).toHaveBeenCalledWith(LanguageEnum.ES);
    expect(service.currentLanguage()).toBe(LanguageEnum.ES);
    expect(storage.set).not.toHaveBeenCalled();
  });

  it('init restaura el idioma guardado cuando es válido', () => {
    configure(LanguageEnum.EN);
    service.init();

    expect(translate.use).toHaveBeenCalledWith(LanguageEnum.EN);
    expect(service.currentLanguage()).toBe(LanguageEnum.EN);
  });

  it('init ignora valor inválido y cae a español', () => {
    configure('fr');
    service.init();

    expect(translate.use).toHaveBeenCalledWith(LanguageEnum.ES);
    expect(service.currentLanguage()).toBe(LanguageEnum.ES);
  });

  it('setLanguage aplica el idioma y lo persiste', () => {
    configure(null);
    service.init();
    service.setLanguage(LanguageEnum.EN);

    expect(translate.use).toHaveBeenLastCalledWith(LanguageEnum.EN);
    expect(service.currentLanguage()).toBe(LanguageEnum.EN);
    expect(storage.set).toHaveBeenCalledWith(
      PREFERRED_LANGUAGE_STORAGE_KEY,
      LanguageEnum.EN,
    );
  });

  it('setLanguage no hace nada con idioma inválido', () => {
    configure(null);
    service.init();
    translate.use.mockClear();
    storage.set.mockClear();

    service.setLanguage('de');

    expect(translate.use).not.toHaveBeenCalled();
    expect(storage.set).not.toHaveBeenCalled();
    expect(service.currentLanguage()).toBe(LanguageEnum.ES);
  });
});
