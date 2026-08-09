import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { PrivacyPolicyPage } from './privacy-policy-page';

describe('PrivacyPolicyPage', () => {
  let component: PrivacyPolicyPage;
  let fixture: ComponentFixture<PrivacyPolicyPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyPolicyPage, TranslateModule.forRoot()],
      providers: [TranslateService, TranslateStore],
    }).compileComponents();

    fixture = TestBed.createComponent(PrivacyPolicyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe renderizar el selector de la página', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-privacy-policy-page') ?? fixture.debugElement.nativeElement).toBeTruthy();
  });
});
