import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import {
  AppConfigService,
  DiscountTypeEnum,
  ProductPrivateService,
  RatesPrivateService,
  RatingPublicService,
  StatusEnum,
  UtilsService,
} from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { ProductPanelPage } from './product-panel-page';

describe('ProductPanelPage', () => {
  let component: ProductPanelPage;
  let fixture: ComponentFixture<ProductPanelPage>;
  let navigate: jest.Mock;
  let findOneProduct: jest.Mock;

  const mockProduct = {
    id: 1,
    title: 'Producto',
    isPrimary: false,
    skus: [
      { id: 10, skuCode: 'SKU-A', quantity: 3, price: 100, variationOptions: {} },
      { id: 11, skuCode: 'SKU-B', quantity: 2, price: 50, variationOptions: {} },
    ],
    productFiles: [{ file: { url: 'https://example.com/p.png' } }],
    business: { path: 'shop' },
    catalog: { path: 'cat' },
  };

  beforeEach(async () => {
    navigate = jest.fn();
    findOneProduct = jest.fn(() => of(mockProduct));

    await TestBed.configureTestingModule({
      imports: [ProductPanelPage, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        MessageService,
        DialogService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { catalogPath: 'cat', idProduct: '1' } },
          },
        },
        {
          provide: ProductPrivateService,
          useValue: {
            findOneProduct,
            removeProduct: jest.fn(() => of(undefined)),
            toggleProductIsPrimary: jest.fn(() =>
              of({ ...mockProduct, isPrimary: true }),
            ),
          },
        },
        {
          provide: RatingPublicService,
          useValue: {
            productRatings: () => of({ items: [{ id: 1, rating: 5 }] }),
          },
        },
        { provide: UtilsService, useValue: { navigate, formatPriceWithDiscount: jest.fn(() => 80) } },
        { provide: Location, useValue: { back: jest.fn() } },
        {
          provide: RatesPrivateService,
          useValue: {
            findBcvOfficialRates: () =>
              of({ dollar: 1, euro: 1, sourceDate: '2024-01-01' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductPanelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('carga de producto', () => {
    it('debe cargar producto, ratings y tasas BCV', () => {
      expect(findOneProduct).toHaveBeenCalledWith(1);
      expect(component.product?.title).toBe('Producto');
      expect(component.ratings.length).toBe(1);
      expect(component.rates).toBeDefined();
      expect(component.productUrl).toContain('/shop/cat/1');
    });

    it('debe calcular stock total y URL de imagen', () => {
      expect(component.totalStock).toBe(5);
      expect(component.productImage).toBe('https://example.com/p.png');
    });
  });

  describe('navegación', () => {
    it('debe navegar a edición del producto', () => {
      component.navigateToEdit();
      expect(navigate).toHaveBeenCalledWith([
        AppConfigService.config.routes.dashboard,
        AppConfigService.config.routes.catalogs,
        'cat',
        '1',
        AppConfigService.config.routes.edit,
      ]);
    });

    it('debe navegar al inventario', () => {
      component.navigateToInventory();
      expect(navigate).toHaveBeenCalledWith([
        AppConfigService.config.routes.dashboard,
        AppConfigService.config.routes.catalogs,
        'cat',
        '1',
        AppConfigService.config.routes.inventory,
      ]);
    });

    it('goBack debe usar router relativo', () => {
      const router = TestBed.inject(Router);
      const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
      component.goBack();
      expect(navigateSpy).toHaveBeenCalledWith(['..'], {
        relativeTo: TestBed.inject(ActivatedRoute),
      });
    });
  });

  describe('helpers de descuento', () => {
    it('debe devolver clave i18n según tipo de descuento', () => {
      expect(component.discountTypeLabelKey(DiscountTypeEnum.PERCENTAGE)).toBe(
        'general.discountTypePercentage',
      );
      expect(component.discountTypeLabelKey(DiscountTypeEnum.FIXED)).toBe(
        'general.discountTypeFixed',
      );
    });
  });
});
