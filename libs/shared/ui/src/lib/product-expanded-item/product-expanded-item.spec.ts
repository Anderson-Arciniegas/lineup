import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { RouterModule } from '@angular/router';
import {
  AuthStore,
  ProductPublicService,
  ProductSchema,
  RatesPrivateService,
  ReactionTypeEnum,
  UtilsService,
} from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { of, throwError } from 'rxjs';
import { ProductExpandedItem } from './product-expanded-item';

describe('ProductExpandedItem', () => {
  let component: ProductExpandedItem;
  let fixture: ComponentFixture<ProductExpandedItem>;
  let authStore: { isUserLoggedIn: jest.Mock };
  let productPublicService: {
    likeProduct: jest.Mock;
    unlikeProduct: jest.Mock;
  };
  let dialogService: { open: jest.Mock };
  let utilsService: { formatPriceWithDiscount: jest.Mock };

  const product = {
    id: 1,
    title: 'Test',
    business: { path: 'biz' },
    catalog: { path: 'cat' },
    skus: [{ price: 100, quantity: 5, currency: { code: 'USD' } }],
    productFiles: [{ file: { url: 'https://example.com/p.jpg' } }],
    discountProduct: { discount: { status: 'ACTIVE' } },
    reactions: [{ type: ReactionTypeEnum.LIKE }],
  } as unknown as ProductSchema;

  beforeEach(async () => {
    authStore = { isUserLoggedIn: jest.fn(() => true) };
    productPublicService = {
      likeProduct: jest.fn(() => of({})),
      unlikeProduct: jest.fn(() => of({})),
    };
    dialogService = { open: jest.fn(() => ({ onClose: of(null) })) };
    utilsService = { formatPriceWithDiscount: jest.fn(() => 80) };

    await TestBed.configureTestingModule({
      imports: [
        ProductExpandedItem,
        TranslateModule.forRoot(),
        RouterModule.forRoot([]),
      ],
      providers: [
        DialogService,
        TranslateService,
        TranslateStore,
        provideAnimationsAsync(),
        { provide: AuthStore, useValue: authStore },
        { provide: ProductPublicService, useValue: productPublicService },
        { provide: DialogService, useValue: dialogService },
        { provide: UtilsService, useValue: utilsService },
        {
          provide: RatesPrivateService,
          useValue: {
            findBcvOfficialRates: () =>
              of({ dollar: 36, euro: 40, sourceDate: '2024-01-01' }),
          },
        },
      ],
    })
      .overrideComponent(ProductExpandedItem, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(ProductExpandedItem);
    component = fixture.componentInstance;
    component.product = product;
    fixture.detectChanges();
    component.ngAfterViewInit();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe establecer imagen expandida con nonce en URL http', () => {
    expect(component.expandedImageSrc).toContain('https://example.com/p.jpg');
    expect(component.expandedImageSrc).toContain('t=');
  });

  it('debe dejar imagen vacía si no hay archivo', () => {
    component.product = {
      ...product,
      productFiles: [],
    } as ProductSchema;
    component.ngOnInit();
    expect(component.expandedImageSrc).toBeUndefined();
    expect(component.hasProductImage).toBe(false);
  });

  it('debe tolerar productFiles ausente', () => {
    component.product = {
      ...product,
      productFiles: undefined,
    } as ProductSchema;
    component.ngOnInit();
    expect(component.expandedImageSrc).toBeUndefined();
    expect(component.hasProductImage).toBe(false);
  });

  it('debe recalcular imagen en ngOnChanges', () => {
    component.product = {
      ...product,
      productFiles: [{ file: { url: 'blob:abc' } }],
    } as ProductSchema;
    component.ngOnChanges({ product: { currentValue: component.product, previousValue: product, firstChange: false, isFirstChange: () => false } });
    expect(component.expandedImageSrc).toBe('blob:abc');
  });

  it('debe marcar inStock cuando hay unidades', () => {
    expect(component.inStock).toBe(true);
    expect(component.outOfStock).toBe(false);
  });

  it('debe marcar outOfStock cuando todas las SKUs tienen quantity 0', () => {
    const itemFixture = TestBed.createComponent(ProductExpandedItem);
    const item = itemFixture.componentInstance;
    item.product = {
      ...product,
      skus: [{ price: 100, quantity: 0, currency: { code: 'USD' } }],
    } as ProductSchema;
    item.ngAfterViewInit();
    expect(item.outOfStock).toBe(true);
  });

  it('debe detectar like desde reactions', () => {
    component.hasLikedProduct();
    expect(component.hasLiked).toBe(true);
  });

  it('no debe consultar like sin sesión', () => {
    authStore.isUserLoggedIn.mockReturnValue(false);
    component.hasLiked = false;
    component.hasLikedProduct();
    expect(component.hasLiked).toBe(false);
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

  it('debe revertir unlike en error', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    productPublicService.unlikeProduct.mockReturnValue(
      throwError(() => new Error('fail')),
    );
    component.hasLiked = true;
    component.unlikeProduct();
    expect(component.hasLiked).toBe(true);
  });

  it('debe quitar like', () => {
    component.hasLiked = true;
    component.unlikeProduct();
    expect(productPublicService.unlikeProduct).toHaveBeenCalledWith(1);
  });

  it('debe recalcular precio con tasas BCV', () => {
    component.getRates();
    expect(component.price).toBe(80);
    expect(component.currency?.code).toBe('USD');
  });

  it('debe limpiar suscripciones en ngOnDestroy', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
