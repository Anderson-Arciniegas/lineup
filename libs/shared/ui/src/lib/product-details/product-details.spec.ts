import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import {
  AuthStore,
  DiscountTypeEnum,
  ProductPublicService,
  RatesPrivateService,
  SocialNetworkPrivateService,
  StatusEnum,
  UtilsService,
} from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { of, throwError } from 'rxjs';
import { ProductDetails } from './product-details';

describe('ProductDetails', () => {
  let component: ProductDetails;
  let fixture: ComponentFixture<ProductDetails>;
  let authStore: { isUserLoggedIn: jest.Mock };
  let productPublicService: {
    likeProduct: jest.Mock;
    unlikeProduct: jest.Mock;
    hasLikedProduct: jest.Mock;
  };
  let socialMediaService: { findByBusiness: jest.Mock };
  let ratesService: { findBcvOfficialRates: jest.Mock };
  let utilsService: { formatPriceWithDiscount: jest.Mock; formatWhatsappPhone: jest.Mock };
  let dialogService: { open: jest.Mock };
  let router: Router;
  let queryParamMap: Map<string, string>;
  let queryParams: Record<string, string>;

  const rates = { dollar: 36, euro: 40, sourceDate: '2024-01-01' };

  const buildProduct = (overrides: Record<string, unknown> = {}) =>
    ({
      id: 1,
      title: 'Producto test',
      business: { id: 10 },
      variations: [
        { title: 'variations.color', options: ['black', 'white'] },
        { title: 'variations.size', options: ['M', 'L'] },
      ],
      skus: [
        {
          id: 100,
          price: 50,
          idCurrency: 1,
          quantity: 3,
          currency: { code: 'USD' },
          variationOptions: { color: 'black', size: 'M' },
        },
        {
          id: 101,
          price: 60,
          idCurrency: 1,
          quantity: 0,
          currency: { code: 'USD' },
          variationOptions: { color: 'white', size: 'L' },
        },
      ],
      discountProduct: {
        discount: {
          status: StatusEnum.ACTIVE,
          discountType: DiscountTypeEnum.PERCENTAGE,
          idCurrency: 1,
        },
      },
      ...overrides,
    }) as unknown as import('@lineup/core').ProductSchema;

  beforeEach(async () => {
    queryParamMap = new Map();
    queryParams = {};

    authStore = { isUserLoggedIn: jest.fn(() => true) };
    productPublicService = {
      likeProduct: jest.fn(() => of({})),
      unlikeProduct: jest.fn(() => of({})),
      hasLikedProduct: jest.fn(() => of(false)),
    };
    socialMediaService = {
      findByBusiness: jest.fn(() =>
        of([
          {
            socialNetwork: { id: 1 },
            url: 'https://instagram.com/test',
            phone: '+584121234567',
          },
        ]),
      ),
    };
    ratesService = {
      findBcvOfficialRates: jest.fn(() => of(rates)),
    };
    utilsService = {
      formatPriceWithDiscount: jest.fn((_sku, _discount, _rates) => 40),
      formatWhatsappPhone: jest.fn((phone, msg) => `https://wa.me/${phone}?text=${msg}`),
    };
    dialogService = { open: jest.fn(() => ({ onClose: of(null) })) };

    await TestBed.configureTestingModule({
      imports: [ProductDetails, TranslateModule.forRoot()],
      providers: [
        provideAnimationsAsync(),
        TranslateService,
        TranslateStore,
        { provide: AuthStore, useValue: authStore },
        { provide: ProductPublicService, useValue: productPublicService },
        { provide: SocialNetworkPrivateService, useValue: socialMediaService },
        { provide: RatesPrivateService, useValue: ratesService },
        { provide: UtilsService, useValue: utilsService },
        { provide: DialogService, useValue: dialogService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              get queryParamMap() {
                return {
                  get: (key: string) => queryParamMap.get(key) ?? null,
                };
              },
              get queryParams() {
                return queryParams;
              },
            },
          },
        },
        provideRouter([]),
      ],
    })
      .overrideComponent(ProductDetails, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(ProductDetails);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  const initWithProduct = (product = buildProduct()) => {
    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();
    return product;
  };

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges e inicialización', () => {
    it('debe cargar redes sociales, like y tasas al asignar producto', () => {
      initWithProduct();
      expect(socialMediaService.findByBusiness).toHaveBeenCalledWith(10);
      expect(ratesService.findBcvOfficialRates).toHaveBeenCalled();
      expect(productPublicService.hasLikedProduct).toHaveBeenCalled();
    });

    it('debe inicializar selección desde query param sku', () => {
      queryParamMap.set('sku', '101');
      initWithProduct();
      expect(component.getSelectedOption('variations.color')).toBeTruthy();
      expect(component.getSelectedOption('variations.size')).toBeTruthy();
    });

    it('debe inicializar selección desde query params de color y size', () => {
      queryParamMap.set('color', 'black');
      queryParamMap.set('size', 'M');
      initWithProduct();
      expect(component.getSelectedOption('variations.color')).toBe('black');
      expect(component.getSelectedOption('variations.size')).toBe('M');
    });

    it('debe inicializar selección desde query params personalizados', () => {
      queryParamMap.set('var_material', 'algodón');
      initWithProduct(
        buildProduct({
          variations: [
            { title: 'Material Type', options: ['algodón', 'poliéster'] },
          ],
          skus: [
            {
              id: 100,
              price: 50,
              idCurrency: 1,
              quantity: 1,
              currency: { code: 'USD' },
              variationOptions: { 'Material Type': 'algodón' },
            },
          ],
        }),
      );
      expect(component.getSelectedOption('Material Type')).toBe('algodón');
    });

    it('debe resolver color vía enum BASIC_COLORS en SKU', () => {
      queryParamMap.set('sku', '100');
      initWithProduct(
        buildProduct({
          variations: [{ title: 'variations.color', options: ['black', 'white'] }],
          skus: [
            {
              id: 100,
              price: 50,
              idCurrency: 1,
              quantity: 1,
              currency: { code: 'USD' },
              variationOptions: { unknownKey: 'black' },
            },
          ],
        }),
      );
      expect(component.getSelectedOption('variations.color')).toBe('black');
    });
  });

  describe('precios y descuentos', () => {
    it('debe calcular precio con descuento activo', async () => {
      initWithProduct();
      await fixture.whenStable();
      expect(component.price).toBe(40);
      expect(component.showDiscountUi).toBe(true);
      expect(component.originalListPrice).toBe(50);
    });

    it('no debe mostrar descuento si el precio calculado no baja', () => {
      utilsService.formatPriceWithDiscount.mockReturnValue(50);
      initWithProduct();
      expect(component.showDiscountUi).toBe(false);
    });

    it('debe devolver precio de lista sin descuento inactivo', () => {
      initWithProduct(
        buildProduct({
          discountProduct: {
            discount: { status: StatusEnum.INACTIVE, discountType: DiscountTypeEnum.PERCENTAGE },
          },
        }),
      );
      expect(component.price).toBe(50);
      expect(component.showDiscountUi).toBe(false);
      expect(component.originalListPrice).toBeNull();
    });

    it('debe calcular equivalente en Bs para moneda USD', async () => {
      initWithProduct();
      await fixture.whenStable();
      expect(component.equivalentBsSalePrice).toBe(40 * 36);
      expect(component.equivalentBsOriginalPrice).toBe(50 * 36);
    });

    it('debe devolver null en equivalente Bs para moneda Bs (id 2)', () => {
      const product = buildProduct({
        skus: [
          {
            id: 100,
            price: 100,
            idCurrency: 2,
            quantity: 1,
            currency: { code: 'VES' },
            variationOptions: { color: 'black', size: 'M' },
          },
        ],
      });
      initWithProduct(product);
      expect(component.equivalentBsSalePrice).toBeNull();
    });

    it('debe usar factor euro cuando idCurrency es 3', async () => {
      const product = buildProduct({
        skus: [
          {
            id: 100,
            price: 10,
            idCurrency: 3,
            quantity: 1,
            currency: { code: 'EUR' },
            variationOptions: { color: 'black', size: 'M' },
          },
        ],
        discountProduct: { discount: { status: StatusEnum.INACTIVE } },
      });
      initWithProduct(product);
      await fixture.whenStable();
      expect(component.equivalentBsSalePrice).toBe(10 * 40);
    });
  });

  describe('variaciones y disponibilidad', () => {
    it('debe deduplicar variaciones por título', () => {
      initWithProduct(
        buildProduct({
          variations: [
            { title: 'variations.color', options: ['black'] },
            { title: 'variations.color', options: ['white'] },
            { title: 'variations.size', options: ['M'] },
          ],
        }),
      );
      expect(component.productVariationsUnique).toHaveLength(2);
    });

    it('debe sincronizar URL al cambiar variación', () => {
      initWithProduct();
      component.onVariationOptionChange('variations.color', 'white');
      expect(router.navigate).toHaveBeenCalled();
    });

    it('debe reportar pocas unidades disponibles', () => {
      initWithProduct();
      component.onVariationOptionChange('variations.color', 'black');
      component.onVariationOptionChange('variations.size', 'M');
      const msg = component.skuAvailabilityMessage;
      expect(msg).toBeTruthy();
      expect(component.outOfStock).toBe(false);
    });

    it('debe marcar agotado cuando quantity es 0', () => {
      initWithProduct();
      component.onVariationOptionChange('variations.color', 'white');
      component.onVariationOptionChange('variations.size', 'L');
      expect(component.skuAvailabilityMessage).toBeTruthy();
      expect(component.outOfStock).toBe(true);
    });

    it('debe reportar última unidad disponible', () => {
      initWithProduct(
        buildProduct({
          skus: [
            {
              id: 100,
              price: 50,
              idCurrency: 1,
              quantity: 1,
              currency: { code: 'USD' },
              variationOptions: { color: 'black', size: 'M' },
            },
          ],
        }),
      );
      component.onVariationOptionChange('variations.color', 'black');
      component.onVariationOptionChange('variations.size', 'M');
      expect(component.skuAvailabilityMessage).toBeTruthy();
      expect(component.outOfStock).toBe(false);
    });

    it('debe reportar pocas unidades restantes', () => {
      initWithProduct(
        buildProduct({
          skus: [
            {
              id: 100,
              price: 50,
              idCurrency: 1,
              quantity: 3,
              currency: { code: 'USD' },
              variationOptions: { color: 'black', size: 'M' },
            },
          ],
        }),
      );
      component.onVariationOptionChange('variations.color', 'black');
      component.onVariationOptionChange('variations.size', 'M');
      expect(component.skuAvailabilityMessage).toBeTruthy();
    });

    it('debe devolver null si no hay variaciones', () => {
      initWithProduct(buildProduct({ variations: [], skus: [{ id: 1, price: 10, quantity: 1 }] }));
      expect(component.skuAvailabilityMessage).toBeNull();
    });
  });

  describe('redes sociales y WhatsApp', () => {
    it('debe resolver URL de red social por id', () => {
      initWithProduct();
      expect(component.getSocialNetworkUrl(1)).toBe('https://instagram.com/test');
      expect(component.getSocialNetworkUrl(999)).toBe('');
    });

    it('debe armar href de WhatsApp tras cargar redes', () => {
      initWithProduct();
      expect(component.href).toContain('wa.me');
    });

    it('debe armar mensaje WhatsApp sin precio si no hay SKU', () => {
      initWithProduct(buildProduct({ skus: [], variations: [] }));
      socialMediaService.findByBusiness.mockReturnValue(
        of([{ socialNetwork: { id: 1 }, phone: '+584121234567' }]),
      );
      component.getSocialNetworkBusinesses();
      expect(component.href).toContain('wa.me');
    });

    it('debe manejar error al cargar redes sociales', () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      socialMediaService.findByBusiness.mockReturnValue(
        throwError(() => new Error('fail')),
      );
      initWithProduct();
      expect(component.attempt).toBe(false);
    });
  });

  describe('like y compartir', () => {
    it('debe abrir modal de compartir', () => {
      initWithProduct();
      component.share();
      expect(dialogService.open).toHaveBeenCalled();
    });

    it('debe registrar like cuando el usuario está autenticado', () => {
      initWithProduct();
      component.hasLiked = false;
      component.likeProduct();
      expect(productPublicService.likeProduct).toHaveBeenCalledWith(1);
      expect(component.hasLiked).toBe(true);
    });

    it('no debe registrar like si ya tiene like', () => {
      initWithProduct();
      component.hasLiked = true;
      component.likeProduct();
      expect(productPublicService.likeProduct).not.toHaveBeenCalled();
    });

    it('debe revertir like en error', () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      productPublicService.likeProduct.mockReturnValue(
        throwError(() => new Error('fail')),
      );
      initWithProduct();
      component.hasLiked = false;
      component.likeProduct();
      expect(component.hasLiked).toBe(false);
    });

    it('debe quitar like', () => {
      initWithProduct();
      component.hasLiked = true;
      component.unlikeProduct();
      expect(productPublicService.unlikeProduct).toHaveBeenCalledWith(1);
    });

    it('no debe consultar like si no hay sesión', () => {
      authStore.isUserLoggedIn.mockReturnValue(false);
      initWithProduct();
      productPublicService.hasLikedProduct.mockClear();
      component.hasLikedProduct();
      expect(productPublicService.hasLikedProduct).not.toHaveBeenCalled();
    });
  });

  describe('tasas BCV', () => {
    it('debe manejar error al cargar tasas', () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      ratesService.findBcvOfficialRates.mockReturnValue(
        throwError(() => new Error('rates fail')),
      );
      initWithProduct();
      expect(component.rates).toBeUndefined();
    });
  });

  describe('descuento FIXED sin tasas', () => {
    it('debe omitir descuento si monedas difieren y no hay tasas', () => {
      ratesService.findBcvOfficialRates.mockReturnValue(of(undefined as never));
      initWithProduct(
        buildProduct({
          skus: [
            {
              id: 100,
              price: 50,
              idCurrency: 1,
              quantity: 1,
              currency: { code: 'USD' },
              variationOptions: { color: 'black', size: 'M' },
            },
          ],
          discountProduct: {
            discount: {
              status: StatusEnum.ACTIVE,
              discountType: DiscountTypeEnum.FIXED,
              idCurrency: 2,
            },
          },
        }),
      );
      expect(component.price).toBe(50);
      expect(component.showDiscountUi).toBe(false);
    });
  });

  describe('inicialización SKU avanzada', () => {
    it('debe ignorar sku inválido en query param', () => {
      queryParamMap.set('sku', 'abc');
      initWithProduct();
      expect(component.getSelectedOption('variations.color')).toBeTruthy();
    });

    it('debe usar fallback si sku no existe', () => {
      queryParamMap.set('sku', '9999');
      initWithProduct();
      expect(component.getSelectedOption('variations.color')).toBe('black');
    });

    it('debe ignorar query param con valor no permitido', () => {
      queryParamMap.set('color', 'invalid-color');
      initWithProduct();
      expect(component.getSelectedOption('variations.color')).toBe('black');
    });

    it('debe resolver size vía enum BASIC_SIZES', () => {
      queryParamMap.set('sku', '100');
      initWithProduct(
        buildProduct({
          variations: [{ title: 'variations.size', options: ['M', 'L'] }],
          skus: [
            {
              id: 100,
              price: 50,
              idCurrency: 1,
              quantity: 1,
              currency: { code: 'USD' },
              variationOptions: { unknown: 'M' },
            },
          ],
        }),
      );
      expect(component.getSelectedOption('variations.size')).toBe('M');
    });

    it('debe resolver variación por key directa', () => {
      queryParamMap.set('sku', '100');
      initWithProduct(
        buildProduct({
          variations: [{ title: 'Material Type', options: ['algodón'] }],
          skus: [
            {
              id: 100,
              price: 50,
              idCurrency: 1,
              quantity: 1,
              currency: { code: 'USD' },
              variationOptions: { 'Material Type': 'algodón' },
            },
          ],
        }),
      );
      expect(component.getSelectedOption('Material Type')).toBe('algodón');
    });

    it('debe usar fallback general de variationOptions', () => {
      queryParamMap.set('sku', '100');
      initWithProduct(
        buildProduct({
          id: 202,
          variations: [{ title: 'Acabado', options: ['mate', 'brillo'] }],
          skus: [
            {
              id: 100,
              price: 50,
              idCurrency: 1,
              quantity: 1,
              currency: { code: 'USD' },
              variationOptions: { finish: 'mate' },
            },
          ],
        }),
      );
      expect(component.getSelectedOption('Acabado')).toBe('mate');
    });

    it('debe usar defaults cuando sku no matchea variación', () => {
      queryParamMap.set('sku', '100');
      initWithProduct(
        buildProduct({
          id: 203,
          variations: [{ title: 'variations.color', options: ['black'] }],
          skus: [
            {
              id: 100,
              price: 50,
              idCurrency: 1,
              quantity: 1,
              currency: { code: 'USD' },
              variationOptions: { unrelated: 'x' },
            },
          ],
        }),
      );
      expect(component.getSelectedOption('variations.color')).toBe('black');
    });

    it('no debe reinicializar si el id de producto no cambia', () => {
      const product = initWithProduct();
      socialMediaService.findByBusiness.mockClear();
      fixture.componentRef.setInput('product', { ...product, title: 'Otro título' });
      fixture.detectChanges();
      expect(socialMediaService.findByBusiness).toHaveBeenCalledTimes(1);
    });
  });

  describe('disponibilidad extendida', () => {
    it('debe reportar en stock con cantidad alta', () => {
      initWithProduct(
        buildProduct({
          skus: [
            {
              id: 100,
              price: 50,
              idCurrency: 1,
              quantity: 10,
              currency: { code: 'USD' },
              variationOptions: { color: 'black', size: 'M' },
            },
          ],
        }),
      );
      component.onVariationOptionChange('variations.color', 'black');
      component.onVariationOptionChange('variations.size', 'M');
      expect(component.skuAvailabilityMessage).toBeTruthy();
      expect(component.outOfStock).toBe(false);
    });

    it('debe devolver null si quantity es null', () => {
      initWithProduct(
        buildProduct({
          skus: [
            {
              id: 100,
              price: 50,
              idCurrency: 1,
              quantity: null,
              currency: { code: 'USD' },
              variationOptions: { color: 'black', size: 'M' },
            },
          ],
        }),
      );
      component.onVariationOptionChange('variations.color', 'black');
      component.onVariationOptionChange('variations.size', 'M');
      expect(component.skuAvailabilityMessage).toBeNull();
    });
  });

  describe('redes sociales extendidas', () => {
    it('debe usar teléfono si no hay URL', () => {
      socialMediaService.findByBusiness.mockReturnValue(
        of([{ socialNetwork: { id: 2 }, url: '', phone: '+584121111111' }]),
      );
      initWithProduct();
      expect(component.getSocialNetworkUrl(2)).toBe('+584121111111');
      expect(component.href).toContain('wa.me');
    });

    it('debe limpiar href si no hay redes', () => {
      socialMediaService.findByBusiness.mockReturnValue(of([]));
      initWithProduct();
      expect(component.href).toBe('');
    });
  });

  describe('like/unlike extendido', () => {
    it('debe revertir unlike en error', () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      productPublicService.unlikeProduct.mockReturnValue(
        throwError(() => new Error('fail')),
      );
      initWithProduct();
      component.hasLiked = true;
      component.unlikeProduct();
      expect(component.hasLiked).toBe(true);
    });

    it('no debe quitar like sin sesión', () => {
      authStore.isUserLoggedIn.mockReturnValue(false);
      initWithProduct();
      component.hasLiked = true;
      component.unlikeProduct();
      expect(productPublicService.unlikeProduct).not.toHaveBeenCalled();
    });

    it('no debe registrar like sin sesión', () => {
      authStore.isUserLoggedIn.mockReturnValue(false);
      initWithProduct();
      component.likeProduct();
      expect(productPublicService.likeProduct).not.toHaveBeenCalled();
    });
  });
});
