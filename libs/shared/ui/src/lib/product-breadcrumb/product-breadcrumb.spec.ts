import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { AuthStore } from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { ProductBreadcrumb } from './product-breadcrumb';

describe('ProductBreadcrumb', () => {
  let component: ProductBreadcrumb;
  let fixture: ComponentFixture<ProductBreadcrumb>;
  let router: Router;
  let location: Location;
  let authStore: {
    isUserLoggedIn: jest.Mock;
    isBusinessLoggedIn: jest.Mock;
  };

  beforeEach(async () => {
    authStore = {
      isUserLoggedIn: jest.fn(() => true),
      isBusinessLoggedIn: jest.fn(() => false),
    };

    await TestBed.configureTestingModule({
      imports: [ProductBreadcrumb, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: authStore },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    })
      .overrideComponent(ProductBreadcrumb, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(ProductBreadcrumb);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    jest.spyOn(location, 'back').mockImplementation(() => undefined);

    component.business = { path: 'mi-tienda', name: 'Tienda' } as import('@lineup/core').BusinessSchema;
    component.catalog = { path: 'catalogo-1' } as import('@lineup/core').CatalogSchema;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe considerar logged true con sesión de usuario', () => {
    expect(component.logged()).toBe(true);
    expect(component.businessMode()).toBe(false);
  });

  it('debe activar businessMode con sesión de negocio', () => {
    authStore.isUserLoggedIn.mockReturnValue(false);
    authStore.isBusinessLoggedIn.mockReturnValue(true);
    expect(component.logged()).toBe(true);
    expect(component.businessMode()).toBe(true);
  });

  describe('goBack', () => {
    it('debe usar history.back cuando hay historial y no hay supresión', () => {
      Object.defineProperty(window.history, 'length', { value: 5, configurable: true });
      component.goBack();
      expect(location.back).toHaveBeenCalled();
    });

    it('debe navegar por path explícito en modo público', () => {
      component.publicMode = true;
      component.path = '/dashboard';
      Object.defineProperty(window.history, 'length', { value: 1, configurable: true });
      component.goBack();
      expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
    });

    it('debe navegar al negocio cuando no hay historial', () => {
      Object.defineProperty(window.history, 'length', { value: 1, configurable: true });
      jest.spyOn(router, 'url', 'get').mockReturnValue('/mi-tienda/catalogo-1/producto');
      component.goBack();
      expect(router.navigateByUrl).toHaveBeenCalledWith('/mi-tienda/catalogo-1');
    });

    it('debe navegar a / en modo público sin candidatos', () => {
      component.publicMode = true;
      component.business = { path: 'mi-tienda' } as import('@lineup/core').BusinessSchema;
      component.catalog = undefined;
      component.path = undefined;
      Object.defineProperty(window.history, 'length', { value: 1, configurable: true });
      jest.spyOn(router, 'url', 'get').mockReturnValue('/mi-tienda');
      component.goBack();
      expect(router.navigateByUrl).toHaveBeenCalledWith('/');
    });

    it('debe usar path relativo sin barra inicial', () => {
      component.path = 'dashboard';
      Object.defineProperty(window.history, 'length', { value: 1, configurable: true });
      jest.spyOn(router, 'url', 'get').mockReturnValue('/otra-ruta');
      component.goBack();
      expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
    });

    it('debe navegar al catálogo en jerarquía pública con path explícito', () => {
      component.publicMode = true;
      component.path = '/';
      Object.defineProperty(window.history, 'length', { value: 5, configurable: true });
      jest.spyOn(router, 'url', 'get').mockReturnValue('/mi-tienda/catalogo-1/p');
      component.goBack();
      expect(router.navigateByUrl).toHaveBeenCalledWith('/');
    });
  });
});

describe('ProductBreadcrumb SSR', () => {
  it('debe usar navegación por URL sin history en servidor', async () => {
    await TestBed.configureTestingModule({
      imports: [ProductBreadcrumb, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        {
          provide: AuthStore,
          useValue: {
            isUserLoggedIn: jest.fn(() => false),
            isBusinessLoggedIn: jest.fn(() => false),
          },
        },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    })
      .overrideComponent(ProductBreadcrumb, { set: { template: '' } })
      .compileComponents();

    const fix = TestBed.createComponent(ProductBreadcrumb);
    const cmp = fix.componentInstance;
    const r = TestBed.inject(Router);
    jest.spyOn(r, 'navigateByUrl').mockResolvedValue(true);
    cmp.business = { path: 'tienda' } as import('@lineup/core').BusinessSchema;
    cmp.catalog = { path: 'cat' } as import('@lineup/core').CatalogSchema;
    jest.spyOn(r, 'url', 'get').mockReturnValue('/tienda/cat/item');
    fix.detectChanges();
    cmp.goBack();
    expect(r.navigateByUrl).toHaveBeenCalled();
  });
});
