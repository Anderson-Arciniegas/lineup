import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { createApolloMock } from '../../../../testing';
import { BusinessOnboardingLayout } from './business-onboarding-layout';

describe('BusinessOnboardingLayout (HU-05)', () => {
  let component: BusinessOnboardingLayout;
  let fixture: ComponentFixture<BusinessOnboardingLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BusinessOnboardingLayout,
        HttpClientTestingModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        provideRouter([]),
        { provide: Apollo, useValue: createApolloMock().mock },
        TranslateService,
        TranslateStore,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BusinessOnboardingLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el layout de onboarding', () => {
    expect(component).toBeTruthy();
  });

  it('debe renderizar la barra de navegación sin toggle de sidebar', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('lib-nav')).toBeTruthy();
    expect(el.querySelector('lib-nav lib-button[aria-expanded]')).toBeNull();
  });

  it('debe exponer router-outlet para los pasos del flujo guiado', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('router-outlet')).toBeTruthy();
    expect(el.querySelector('.layout-main__content')).toBeTruthy();
  });
});
