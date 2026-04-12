import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import {
  AuthStore,
  ProductPublicService,
  RatesPrivateService,
  UtilsService,
} from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { of } from 'rxjs';
import { ProductCard } from './product-card';

describe('ProductCard', () => {
  let component: ProductCard;
  let fixture: ComponentFixture<ProductCard>;
  let hasLikedProduct: jest.Mock;

  const productBase = {
    id: 1,
    productFiles: [{ file: { url: 'https://example.com/image.jpg' } }],
    business: {
      path: 'mi-tienda',
      image: { url: 'https://example.com/logo.png' },
    },
    catalog: { path: 'cat-1' },
    skus: [{ price: 10, quantity: 5, currency: { code: 'USD' } }],
  };

  beforeEach(async () => {
    hasLikedProduct = jest.fn(() => of(false));

    await TestBed.configureTestingModule({
      imports: [ProductCard, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'browser' },
        TranslateService,
        TranslateStore,
        {
          provide: AuthStore,
          useValue: {
            isBusinessLoggedIn: () => false,
            isUserLoggedIn: () => true,
          },
        },
        {
          provide: ProductPublicService,
          useValue: {
            hasLikedProduct,
            likeProduct: jest.fn(() => of({})),
            unlikeProduct: jest.fn(() => of({})),
          },
        },
        {
          provide: RatesPrivateService,
          useValue: { findBcvOfficialRates: () => of(null) },
        },
        {
          provide: UtilsService,
          useValue: {
            formatPriceWithDiscount: () => 10,
          },
        },
      ],
    })
      .overrideComponent(ProductCard, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(ProductCard);
    component = fixture.componentInstance;
    component.product = productBase as any;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  /**
   * URL amigable cuando negocio y catálogo están presentes en el modelo.
   */
  describe('URLs y navegación', () => {
    it('debe construir la ruta del producto', () => {
      expect(component.url).toBe('/mi-tienda/cat-1/1');
    });

    it('debe navegar al path del negocio', () => {
      const router = TestBed.inject(Router);
      jest.spyOn(router, 'navigate');
      component.navigateToBusiness();
      expect(router.navigate).toHaveBeenCalledWith(['/mi-tienda'], {
        state: undefined,
      });
    });
  });

  /**
   * Títulos largos se recortan para la tarjeta (máx. ~50 caracteres).
   */
  describe('setTitle', () => {
    it('debe devolver el texto completo si es corto', () => {
      expect(component.setTitle('Hola')).toBe('Hola');
    });

    it('debe truncar y añadir elipsis por encima de 50 caracteres', () => {
      const long = 'a'.repeat(55);
      const out = component.setTitle(long);
      expect(out.endsWith('...')).toBe(true);
      expect(out.length).toBeLessThanOrEqual(53);
    });
  });

  /**
   * Consulta de “me gusta” solo para sesiones que no son negocio.
   */
  describe('hasLikedProduct', () => {
    it('debe consultar al API cuando el usuario no es negocio', () => {
      component.hasLikedProduct();
      expect(hasLikedProduct).toHaveBeenCalledWith(1);
    });
  });
});
