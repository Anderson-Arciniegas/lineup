import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  AuthStore,
  ProductPublicService,
  ProductSchema,
  RatesPrivateService,
  UtilsService,
} from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { of, throwError } from 'rxjs';
import { CatalogCarouselItem } from './catalog-carousel-item';

describe('CatalogCarouselItem', () => {
  let component: CatalogCarouselItem;
  let fixture: ComponentFixture<CatalogCarouselItem>;
  let authStore: { isUserLoggedIn: jest.Mock };
  let productPublicService: {
    hasLikedProduct: jest.Mock;
    likeProduct: jest.Mock;
    unlikeProduct: jest.Mock;
  };
  let dialogService: { open: jest.Mock };

  const product = {
    id: 1,
    title: 'Product',
    business: { path: 'biz' },
    catalog: { path: 'cat' },
    productFiles: [{ file: { url: 'https://example.com/p.jpg' } }],
    skus: [{ price: 10, quantity: 2, currency: { code: 'USD' } }],
    discountProduct: null,
  } as unknown as ProductSchema;

  beforeEach(async () => {
    authStore = { isUserLoggedIn: jest.fn(() => true) };
    productPublicService = {
      hasLikedProduct: jest.fn(() => of(true)),
      likeProduct: jest.fn(() => of({})),
      unlikeProduct: jest.fn(() => of({})),
    };
    dialogService = { open: jest.fn(() => ({ onClose: of(null) })) };

    await TestBed.configureTestingModule({
      imports: [CatalogCarouselItem, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: AuthStore, useValue: authStore },
        { provide: ProductPublicService, useValue: productPublicService },
        { provide: DialogService, useValue: dialogService },
        {
          provide: RatesPrivateService,
          useValue: {
            findBcvOfficialRates: () =>
              of({ dollar: 36, euro: 40, sourceDate: '2024-01-01' }),
          },
        },
        {
          provide: UtilsService,
          useValue: { formatPriceWithDiscount: jest.fn(() => 8) },
        },
      ],
    })
      .overrideComponent(CatalogCarouselItem, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(CatalogCarouselItem);
    component = fixture.componentInstance;
    component.product = product;
    fixture.detectChanges();
    component.ngAfterViewInit();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe consultar like y calcular stock', () => {
    expect(productPublicService.hasLikedProduct).toHaveBeenCalledWith(1);
    expect(component.inStock).toBe(true);
    expect(component.outOfStock).toBe(false);
  });

  it('debe marcar outOfStock sin unidades', () => {
    const itemFixture = TestBed.createComponent(CatalogCarouselItem);
    const item = itemFixture.componentInstance;
    item.product = {
      ...product,
      skus: [{ price: 10, quantity: 0, currency: { code: 'USD' } }],
    } as ProductSchema;
    item.ngAfterViewInit();
    expect(item.outOfStock).toBe(true);
  });

  it('debe abrir modal de compartir', () => {
    component.share();
    expect(dialogService.open).toHaveBeenCalled();
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

  it('no debe quitar like sin sesión', () => {
    authStore.isUserLoggedIn.mockReturnValue(false);
    component.hasLiked = true;
    component.unlikeProduct();
    expect(productPublicService.unlikeProduct).not.toHaveBeenCalled();
  });

  it('no debe registrar like sin sesión', () => {
    authStore.isUserLoggedIn.mockReturnValue(false);
    component.likeProduct();
    expect(productPublicService.likeProduct).not.toHaveBeenCalled();
  });

  it('debe recalcular precio con tasas', () => {
    component.getRates();
    expect(component.price).toBe(8);
  });

  it('debe limpiar suscripciones en ngOnDestroy', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('debe manejar producto sin SKUs', () => {
    const itemFixture = TestBed.createComponent(CatalogCarouselItem);
    const item = itemFixture.componentInstance;
    item.product = { ...product, skus: undefined } as ProductSchema;
    item.ngAfterViewInit();
    expect(item.originalPrice).toBeNull();
    expect(item.currency).toBeNull();
    expect(item.outOfStock).toBe(true);
  });

  it('debe considerar stock con quantity null o undefined', () => {
    const itemFixture = TestBed.createComponent(CatalogCarouselItem);
    const item = itemFixture.componentInstance;
    item.product = {
      ...product,
      skus: [
        { price: 10, quantity: null, currency: { code: 'USD' } },
        { price: 10, quantity: undefined, currency: { code: 'USD' } },
      ],
    } as ProductSchema;
    item.ngAfterViewInit();
    expect(item.inStock).toBe(true);
  });

  it('no debe consultar like sin sesión', () => {
    authStore.isUserLoggedIn.mockReturnValue(false);
    productPublicService.hasLikedProduct.mockClear();
    const itemFixture = TestBed.createComponent(CatalogCarouselItem);
    const item = itemFixture.componentInstance;
    item.product = product;
    item.hasLikedProduct();
    expect(productPublicService.hasLikedProduct).not.toHaveBeenCalled();
  });

  it('debe establecer hasLiked según respuesta del servicio', () => {
    productPublicService.hasLikedProduct.mockReturnValue(of(false));
    const itemFixture = TestBed.createComponent(CatalogCarouselItem);
    const item = itemFixture.componentInstance;
    item.product = product;
    item.hasLikedProduct();
    expect(item.hasLiked).toBe(false);
  });

  it('debe aplicar descuento al recalcular precio con tasas', () => {
    component.product = {
      ...product,
      discountProduct: { id: 1, discount: { percentage: 20 } },
    } as unknown as ProductSchema;
    component.getRates();
    expect(component.price).toBe(8);
  });
});
