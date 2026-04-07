import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  AuthStore,
  CatalogPrivateService,
  CurrencyPrivateService,
  DiscountPrivateService,
  DiscountScopeEnum,
  DiscountTypeEnum,
  ProductPrivateService,
  UtilsService,
} from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { CreateDiscountPage } from './create-discount-page';

describe('CreateDiscountPage', () => {
  let fixture: ComponentFixture<CreateDiscountPage>;
  let component: CreateDiscountPage;
  let createDiscount: jest.Mock;
  let navigate: jest.Mock;
  let messageAdd: jest.Mock;

  beforeEach(async () => {
    createDiscount = jest.fn(() => of({}));
    navigate = jest.fn();
    messageAdd = jest.fn();

    await TestBed.configureTestingModule({
      imports: [CreateDiscountPage, TranslateModule.forRoot()],
      providers: [
        TranslateService,
        TranslateStore,
        {
          provide: AuthStore,
          useValue: {
            business: () => ({ id: 1, path: 'b' }),
          },
        },
        {
          provide: CatalogPrivateService,
          useValue: {
            findAllMyCatalogs: () => of({ items: [{ id: 5, title: 'C' }] }),
          },
        },
        {
          provide: ProductPrivateService,
          useValue: {
            getAllByCatalogPaginated: () => of({ items: [] }),
          },
        },
        {
          provide: CurrencyPrivateService,
          useValue: {
            findAllCurrencies: () =>
              of([{ id: 2, name: 'USD', code: 'USD' } as any]),
          },
        },
        { provide: DiscountPrivateService, useValue: { createDiscount } },
        { provide: UtilsService, useValue: { navigate } },
        { provide: MessageService, useValue: { add: messageAdd } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateDiscountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
    expect(component.business?.id).toBe(1);
  });

  /**
   * Getters de plantilla según alcance y tipo de descuento.
   */
  describe('visibilidad de campos', () => {
    it('no debe mostrar catálogo con alcance BUSINESS', () => {
      component.discountForm.patchValue({ scope: DiscountScopeEnum.BUSINESS });
      expect(component.showCatalogField).toBe(false);
    });

    it('debe mostrar catálogo con alcance CATALOG', () => {
      component.discountForm.patchValue({ scope: DiscountScopeEnum.CATALOG });
      expect(component.showCatalogField).toBe(true);
      expect(component.showProductField).toBe(false);
    });

    it('debe mostrar moneda con descuento FIXED', () => {
      component.discountForm.patchValue({
        discountType: DiscountTypeEnum.FIXED,
      });
      expect(component.showCurrencyField).toBe(true);
    });
  });

  /**
   * Envío del formulario: validación y llamada a `createDiscount`.
   */
  describe('submit', () => {
    it('no debe enviar si el formulario es inválido', () => {
      component.submit();
      expect(createDiscount).not.toHaveBeenCalled();
    });

    it('debe enviar descuento de negocio con porcentaje válido', () => {
      component.discountForm.patchValue({
        scope: DiscountScopeEnum.BUSINESS,
        discountType: DiscountTypeEnum.PERCENTAGE,
        value: 15,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });
      component.submit();
      expect(createDiscount).toHaveBeenCalledWith(
        expect.objectContaining({
          scope: DiscountScopeEnum.BUSINESS,
          discountType: DiscountTypeEnum.PERCENTAGE,
          value: 15,
        }),
      );
      expect(navigate).toHaveBeenCalled();
    });
  });

  /**
   * `cancel` vuelve al listado de descuentos.
   */
  describe('cancel', () => {
    it('debe navegar al dashboard de descuentos', () => {
      component.cancel();
      expect(navigate).toHaveBeenCalled();
    });
  });
});
