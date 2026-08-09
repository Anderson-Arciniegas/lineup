import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { I18nModule } from './i18n.module';

describe('I18nModule', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [I18nModule],
    }).compileComponents();
  });

  it('provides TranslateService with default language es', () => {
    const translate = TestBed.inject(TranslateService);
    expect(translate).toBeTruthy();
    expect(translate.getDefaultLang()).toBe('es');
  });
});
