import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { TermsAndConditionsPage } from './terms-and-conditions-page';

describe('TermsAndConditionsPage', () => {
  let component: TermsAndConditionsPage;
  let fixture: ComponentFixture<TermsAndConditionsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermsAndConditionsPage, TranslateModule.forRoot()],
      providers: [TranslateService, TranslateStore],
    }).compileComponents();

    fixture = TestBed.createComponent(TermsAndConditionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe instanciarse como página estática de términos', () => {
    expect(component).toBeInstanceOf(TermsAndConditionsPage);
  });
});
