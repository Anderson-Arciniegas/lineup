import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { createApolloMock } from '../../../../testing';
import { BusinessOnboardingLayout } from './business-onboarding-layout';

describe('BusinessOnboardingLayout', () => {
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

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe incluir router-outlet en la plantilla', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('router-outlet')).toBeTruthy();
  });
});
