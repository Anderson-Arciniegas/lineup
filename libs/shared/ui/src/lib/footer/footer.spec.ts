import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthStore } from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { Footer } from './footer';

describe('Footer', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;
  let authStore: {
    isUserLoggedIn: jest.Mock;
    isBusinessLoggedIn: jest.Mock;
  };

  beforeEach(async () => {
    authStore = {
      isUserLoggedIn: jest.fn(() => false),
      isBusinessLoggedIn: jest.fn(() => false),
    };

    await TestBed.configureTestingModule({
      imports: [Footer, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: AuthStore, useValue: authStore },
      ],
    })
      .overrideComponent(Footer, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe exponer el año actual', () => {
    expect(component.currentYear).toBe(new Date().getFullYear());
  });

  it('debe construir rutas legales con prefijo info', () => {
    expect(component.infoPath.startsWith('/')).toBe(true);
    expect(component.termsPath).toContain(component.infoPath);
    expect(component.privacyPath).toContain(component.infoPath);
  });

  it('debe considerar logged false sin sesión activa', () => {
    expect(component.logged()).toBe(false);
    expect(component.businessMode()).toBe(false);
  });

  it('debe detectar sesión de usuario o negocio en logged', () => {
    authStore.isUserLoggedIn.mockReturnValue(true);
    expect(component.logged()).toBe(true);
    authStore.isUserLoggedIn.mockReturnValue(false);
    authStore.isBusinessLoggedIn.mockReturnValue(true);
    expect(component.logged()).toBe(true);
    expect(component.businessMode()).toBe(true);
  });
});
