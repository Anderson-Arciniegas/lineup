import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LanguageEnum, LanguageService } from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { LanguageSelect } from './language-select';

describe('LanguageSelect', () => {
  let component: LanguageSelect;
  let fixture: ComponentFixture<LanguageSelect>;
  let languageService: {
    setLanguage: jest.Mock;
    currentLanguage: ReturnType<typeof signal<LanguageEnum>>;
  };

  beforeEach(async () => {
    languageService = {
      setLanguage: jest.fn(),
      currentLanguage: signal(LanguageEnum.ES),
    };

    await TestBed.configureTestingModule({
      imports: [LanguageSelect, TranslateModule.forRoot()],
      providers: [
        { provide: LanguageService, useValue: languageService },
        TranslateService,
        TranslateStore,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageSelect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe delegar el cambio de idioma al LanguageService', () => {
    component.onLanguageChange(LanguageEnum.EN);
    expect(languageService.setLanguage).toHaveBeenCalledWith(LanguageEnum.EN);
  });

  it('debe renderizar un p-select sin imágenes', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('p-select')).toBeTruthy();
    expect(host.querySelector('img')).toBeNull();
  });

  it('debe exponer solo opciones ES y EN', () => {
    expect(component.options.map((o) => o.code)).toEqual(['ES', 'EN']);
  });
});
