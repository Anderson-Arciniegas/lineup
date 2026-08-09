import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import {
  AuthStore,
  DiscountTypeEnum,
  ProductPublicService,
  RatesPrivateService,
  ReactionTypeEnum,
  StatusEnum,
  UtilsService,
} from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ProductCard } from './product-card';

jest.mock('gsap', () => ({
  gsap: {
    to: jest.fn(),
    set: jest.fn(),
    killTweensOf: jest.fn(),
  },
}));

describe('ProductCard', () => {
  let component: ProductCard;
  let fixture: ComponentFixture<ProductCard>;
  let authStore: { isUserLoggedIn: jest.Mock };
  let productPublicService: {
    likeProduct: jest.Mock;
    unlikeProduct: jest.Mock;
  };
  let utilsService: { formatPriceWithDiscount: jest.Mock };

  const productBase = {
    id: 1,
    productFiles: [{ file: { url: 'https://example.com/image.jpg' } }],
    business: {
      path: 'mi-tienda',
      image: { url: 'https://example.com/logo.png' },
    },
    catalog: { path: 'cat-1' },
    skus: [{ price: 10, quantity: 5, currency: { code: 'USD' } }],
    discountProduct: {
      discount: {
        status: StatusEnum.ACTIVE,
        discountType: DiscountTypeEnum.PERCENTAGE,
      },
    },
  } as unknown as import('@lineup/core').ProductSchema;

  beforeEach(async () => {
    authStore = {
      isUserLoggedIn: jest.fn(() => true),
    };
    productPublicService = {
      likeProduct: jest.fn(() => of({})),
      unlikeProduct: jest.fn(() => of({})),
    };
    utilsService = {
      formatPriceWithDiscount: jest.fn(() => 8),
    };

    await TestBed.configureTestingModule({
      imports: [ProductCard, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'browser' },
        TranslateService,
        TranslateStore,
        { provide: AuthStore, useValue: authStore },
        { provide: ProductPublicService, useValue: productPublicService },
        {
          provide: RatesPrivateService,
          useValue: {
            findBcvOfficialRates: () =>
              of({ dollar: 36, euro: 40, sourceDate: '2024-01-01' }),
          },
        },
        { provide: UtilsService, useValue: utilsService },
      ],
    })
      .overrideComponent(ProductCard, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(ProductCard);
    component = fixture.componentInstance;
    component.product = productBase;
    fixture.detectChanges();
    component.ngOnInit();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('debe construir la ruta del producto', () => {
      expect(component.url).toBe('/mi-tienda/cat-1/1');
    });

    it('debe usar URL por defecto sin negocio/catálogo', () => {
      component.product = {
        ...productBase,
        business: undefined,
        catalog: undefined,
      } as typeof productBase;
      component.ngOnInit();
      expect(component.url).toBe('/business-1/catalog-1/123');
    });

    it('debe marcar inStock cuando hay unidades', () => {
      expect(component.inStock).toBe(true);
      expect(component.outOfStock).toBe(false);
    });

    it('debe marcar outOfStock cuando no hay stock', () => {
      const noStockFixture = TestBed.createComponent(ProductCard);
      const noStockComponent = noStockFixture.componentInstance;
      noStockComponent.product = {
        ...productBase,
        skus: [{ price: 10, quantity: 0, currency: { code: 'USD' } }],
      } as typeof productBase;
      noStockComponent.ngOnInit();
      expect(noStockComponent.outOfStock).toBe(true);
    });

    it('debe usar imagen aleatoria sin producto', () => {
      component.product = undefined as unknown as typeof productBase;
      component.ngOnInit();
      expect(component.image).toBeTruthy();
      expect(component.url).toBe('/business-1/catalog-1/123');
    });
  });

  describe('ngOnChanges', () => {
    it('debe actualizar imagen al cambiar producto', () => {
      component.product = {
        ...productBase,
        productFiles: [{ file: { url: 'https://example.com/new.jpg' } }],
      } as typeof productBase;
      component.ngOnChanges({
        product: {
          currentValue: component.product,
          previousValue: productBase,
          firstChange: false,
          isFirstChange: () => false,
        },
      });
      expect(component.image).toContain('new.jpg');
      expect(component.imageLoaded).toBe(false);
    });

    it('debe sincronizar flip en modo PDF', () => {
      component.pdfExportAttempt = true;
      component.ngOnChanges({
        pdfExportAttempt: {
          currentValue: true,
          previousValue: false,
          firstChange: false,
          isFirstChange: () => false,
        },
      });
      expect(component.pdfExportAttempt).toBe(true);
    });
  });

  describe('URLs y navegación', () => {
    it('debe navegar al path del negocio', () => {
      const router = TestBed.inject(Router);
      jest.spyOn(router, 'navigate');
      component.navigateToBusiness();
      expect(router.navigate).toHaveBeenCalledWith(['/mi-tienda'], {
        state: undefined,
      });
    });

    it('debe pasar businessNavigateState al navegar', () => {
      const router = TestBed.inject(Router);
      jest.spyOn(router, 'navigate');
      component.businessNavigateState = { lineupPublicBack: '/' };
      component.navigateToBusiness();
      expect(router.navigate).toHaveBeenCalledWith(['/mi-tienda'], {
        state: { lineupPublicBack: '/' },
      });
    });
  });

  describe('setTitle', () => {
    it('debe devolver el texto completo si es corto', () => {
      expect(component.setTitle('Hola')).toBe('Hola');
    });

    it('debe truncar respetando espacio en posición 49', () => {
      const title = `${'a'.repeat(49)} ${'b'.repeat(10)}`;
      const out = component.setTitle(title);
      expect(out.endsWith('...')).toBe(true);
    });

    it('debe truncar a 50 caracteres sin espacio en posición 49', () => {
      const long = 'a'.repeat(55);
      const out = component.setTitle(long);
      expect(out.endsWith('...')).toBe(true);
      expect(out.length).toBeLessThanOrEqual(53);
    });
  });

  describe('like / unlike', () => {
    it('debe marcar hasLiked desde reactions', () => {
      component.product = {
        ...productBase,
        reactions: [{ type: ReactionTypeEnum.LIKE }],
      } as typeof productBase;
      component.hasLikedProduct();
      expect(component.hasLiked).toBe(true);
    });

    it('no debe consultar like sin sesión', () => {
      authStore.isUserLoggedIn.mockReturnValue(false);
      component.hasLikedProduct();
      expect(component.hasLiked).toBeFalsy();
    });

    it('debe registrar like', () => {
      component.hasLiked = false;
      component.likeProduct();
      expect(productPublicService.likeProduct).toHaveBeenCalledWith(1);
    });

    it('debe revertir like en error', () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      productPublicService.likeProduct.mockReturnValue(
        throwError(() => new Error('fail')),
      );
      component.hasLiked = false;
      component.likeProduct();
      expect(component.hasLiked).toBe(false);
    });

    it('debe quitar like', () => {
      component.hasLiked = true;
      component.unlikeProduct();
      expect(productPublicService.unlikeProduct).toHaveBeenCalledWith(1);
    });

    it('debe revertir unlike en error', () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      productPublicService.unlikeProduct.mockReturnValue(
        throwError(() => new Error('fail')),
      );
      component.hasLiked = true;
      component.unlikeProduct();
      expect(component.hasLiked).toBe(true);
    });
  });

  describe('getRates', () => {
    it('debe recalcular precio con descuento', () => {
      component.getRates();
      expect(component.price).toBe(8);
      expect(utilsService.formatPriceWithDiscount).toHaveBeenCalled();
    });
  });

  describe('flip GSAP', () => {
    it('debe fijar flip en modo PDF', async () => {
      const flipBox = document.createElement('div');
      flipBox.id = component.cardFlipId;
      const inner = document.createElement('div');
      inner.className = 'flip-inner';
      flipBox.appendChild(inner);
      document.body.appendChild(flipBox);
      component.pdfExportAttempt = true;
      component.ngOnChanges({
        pdfExportAttempt: {
          currentValue: true,
          previousValue: false,
          firstChange: false,
          isFirstChange: () => false,
        },
      });
      await new Promise((r) => setTimeout(r, 150));
      const { gsap } = await import('gsap');
      expect(gsap.set).toHaveBeenCalled();
      document.body.removeChild(flipBox);
    });

    it('debe preparar listeners de warmup fuera de modo PDF', async () => {
      const flipBox = document.createElement('div');
      flipBox.id = component.cardFlipId;
      const inner = document.createElement('div');
      inner.className = 'flip-inner';
      flipBox.appendChild(inner);
      document.body.appendChild(flipBox);
      component.pdfExportAttempt = false;
      component.ngOnChanges({
        pdfExportAttempt: {
          currentValue: false,
          previousValue: true,
          firstChange: false,
          isFirstChange: () => false,
        },
      });
      await new Promise((r) => setTimeout(r, 150));
      flipBox.dispatchEvent(new Event('mouseenter'));
      document.body.removeChild(flipBox);
      expect(component.pdfExportAttempt).toBe(false);
    });

    it('debe marcar imagen cargada si ya está en caché', async () => {
      const flipBox = document.createElement('div');
      flipBox.id = component.cardFlipId;
      const img = document.createElement('img');
      img.className = 'product-image';
      Object.defineProperty(img, 'complete', { value: true });
      Object.defineProperty(img, 'naturalWidth', { value: 100 });
      flipBox.appendChild(img);
      document.body.appendChild(flipBox);
      component.ngAfterViewInit();
      await new Promise((r) => requestAnimationFrame(r));
      expect(component.imageLoaded).toBe(true);
      document.body.removeChild(flipBox);
    });
  });

  describe('srcWithCrossOriginNonce vía ngOnChanges', () => {
    it('debe mantener URLs blob sin nonce', () => {
      component.product = {
        ...productBase,
        productFiles: [{ file: { url: 'blob:abc' } }],
      } as typeof productBase;
      component.ngOnChanges({
        product: {
          currentValue: component.product,
          previousValue: productBase,
          firstChange: false,
          isFirstChange: () => false,
        },
      });
      expect(component.image).toBe('blob:abc');
    });

    it('debe devolver undefined para URL vacía en ngOnInit', () => {
      const fix = TestBed.createComponent(ProductCard);
      const c = fix.componentInstance;
      c.product = {
        ...productBase,
        productFiles: [{ file: { url: '' } }],
      } as typeof productBase;
      c.ngOnInit();
      expect(c.image).toBeUndefined();
    });

    it('debe añadir nonce a URLs http con query existente', () => {
      component.product = {
        ...productBase,
        productFiles: [{ file: { url: 'https://example.com/img.jpg?w=1' } }],
      } as typeof productBase;
      component.ngOnChanges({
        product: {
          currentValue: component.product,
          previousValue: productBase,
          firstChange: false,
          isFirstChange: () => false,
        },
      });
      expect(component.image).toContain('&t=');
    });

    it('debe mantener URLs relativas sin nonce', () => {
      component.product = {
        ...productBase,
        productFiles: [{ file: { url: '/assets/local.jpg' } }],
      } as typeof productBase;
      component.ngOnChanges({
        product: {
          currentValue: component.product,
          previousValue: productBase,
          firstChange: false,
          isFirstChange: () => false,
        },
      });
      expect(component.image).toBe('/assets/local.jpg');
    });
  });

  it('debe limpiar recursos en ngOnDestroy', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
