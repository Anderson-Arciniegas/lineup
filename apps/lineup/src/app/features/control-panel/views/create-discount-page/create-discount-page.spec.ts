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
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
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
        {
          provide: DiscountPrivateService,
          useValue: {
            createDiscount,
            findOneDiscount: jest.fn(),
            updateDiscount: jest.fn(),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => null as string | null } },
          },
        },
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

  describe('alcance producto y tipo fijo', () => {
    it('debe mostrar producto con alcance PRODUCT', () => {
      component.discountForm.patchValue({ scope: DiscountScopeEnum.PRODUCT });
      expect(component.showProductField).toBe(true);
    });

    it('debe enviar descuento fijo con moneda', () => {
      component.discountForm.patchValue({
        scope: DiscountScopeEnum.BUSINESS,
        discountType: DiscountTypeEnum.FIXED,
        idCurrency: 2,
        value: 10,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });
      component.submit();
      expect(createDiscount).toHaveBeenCalledWith(
        expect.objectContaining({
          discountType: DiscountTypeEnum.FIXED,
          idCurrency: 2,
        }),
      );
    });

    it('debe avisar si las fechas son inválidas', () => {
      component.discountForm.patchValue({
        scope: DiscountScopeEnum.BUSINESS,
        discountType: DiscountTypeEnum.PERCENTAGE,
        value: 10,
        startDate: '2025-12-31',
        endDate: '2025-01-01',
      });
      component.submit();
      expect(createDiscount).not.toHaveBeenCalled();
      expect(component.discountForm.errors?.['dateOrder']).toBe(true);
    });

    it('debe enviar descuento de catálogo', () => {
      component.discountForm.patchValue({
        scope: DiscountScopeEnum.CATALOG,
        idCatalog: 5,
        discountType: DiscountTypeEnum.PERCENTAGE,
        value: 20,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });
      component.submit();
      expect(createDiscount).toHaveBeenCalledWith(
        expect.objectContaining({ scope: DiscountScopeEnum.CATALOG, idCatalog: 5 }),
      );
    });

    it('createDiscount error muestra toast', () => {
      createDiscount.mockReturnValue(throwError(() => ({ message: 'err' })));
      component.discountForm.patchValue({
        scope: DiscountScopeEnum.BUSINESS,
        discountType: DiscountTypeEnum.PERCENTAGE,
        value: 10,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });
      component.submit();
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error' }),
      );
    });

    it('debe enviar descuento de producto', () => {
      component.discountForm.patchValue({
        scope: DiscountScopeEnum.PRODUCT,
        idCatalog: 5,
        idProduct: 3,
        discountType: DiscountTypeEnum.PERCENTAGE,
        value: 10,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });
      component.submit();
      expect(createDiscount).toHaveBeenCalledWith(
        expect.objectContaining({
          scope: DiscountScopeEnum.PRODUCT,
          idProduct: 3,
        }),
      );
    });

    it('scope valueChanges limpia catálogo y producto', () => {
      component.discountForm.patchValue({
        scope: DiscountScopeEnum.CATALOG,
        idCatalog: 5,
        idProduct: 3,
      });
      component.discountForm.patchValue({ scope: DiscountScopeEnum.BUSINESS });
      expect(component.discountForm.get('idCatalog')?.value).toBeNull();
      expect(component.discountForm.get('idProduct')?.value).toBeNull();
      expect(component.products).toEqual([]);
    });

    it('loadCatalogs error muestra toast', async () => {
      TestBed.resetTestingModule();
      messageAdd = jest.fn();
      await TestBed.configureTestingModule({
        imports: [CreateDiscountPage, TranslateModule.forRoot()],
        providers: [
          TranslateService,
          TranslateStore,
          { provide: AuthStore, useValue: { business: () => ({ id: 1, path: 'b' }) } },
          {
            provide: CatalogPrivateService,
            useValue: {
              findAllMyCatalogs: () => throwError(() => new Error('catalog fail')),
            },
          },
          {
            provide: ProductPrivateService,
            useValue: { getAllByCatalogPaginated: () => of({ items: [] }) },
          },
          {
            provide: CurrencyPrivateService,
            useValue: { findAllCurrencies: () => of([]) },
          },
          {
            provide: DiscountPrivateService,
            useValue: { createDiscount, findOneDiscount: jest.fn(), updateDiscount: jest.fn() },
          },
          {
            provide: ActivatedRoute,
            useValue: { snapshot: { paramMap: { get: () => null } } },
          },
          { provide: UtilsService, useValue: { navigate } },
          { provide: MessageService, useValue: { add: messageAdd } },
        ],
      }).compileComponents();
      fixture = TestBed.createComponent(CreateDiscountPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error' }),
      );
    });

    it('loadProducts error muestra toast', () => {
      const getAllByCatalogPaginated = jest.fn(() =>
        throwError(() => new Error('products fail')),
      );
      (TestBed.inject(ProductPrivateService) as any).getAllByCatalogPaginated =
        getAllByCatalogPaginated;
      component.discountForm.patchValue({
        scope: DiscountScopeEnum.PRODUCT,
        idCatalog: 5,
      });
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error' }),
      );
      expect(component.products).toEqual([]);
    });
  });

  describe('modo edición', () => {
    let updateDiscount: jest.Mock;
    let findOneDiscount: jest.Mock;

    beforeEach(async () => {
      updateDiscount = jest.fn(() => of({}));
      findOneDiscount = jest.fn(() =>
        of({
          id: 9,
          scope: DiscountScopeEnum.BUSINESS,
          discountType: DiscountTypeEnum.PERCENTAGE,
          value: 10,
          startDate: '2025-01-01T00:00:00.000Z',
          endDate: '2025-12-31T23:59:59.999Z',
        }),
      );
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [CreateDiscountPage, TranslateModule.forRoot()],
        providers: [
          TranslateService,
          TranslateStore,
          { provide: AuthStore, useValue: { business: () => ({ id: 1, path: 'b' }) } },
          {
            provide: CatalogPrivateService,
            useValue: { findAllMyCatalogs: () => of({ items: [{ id: 5, title: 'C' }] }) },
          },
          {
            provide: ProductPrivateService,
            useValue: { getAllByCatalogPaginated: () => of({ items: [{ id: 3, title: 'P' }] }) },
          },
          {
            provide: CurrencyPrivateService,
            useValue: { findAllCurrencies: () => of([{ id: 2, code: 'USD' } as any]) },
          },
          {
            provide: DiscountPrivateService,
            useValue: { createDiscount, updateDiscount, findOneDiscount },
          },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: { paramMap: { get: (k: string) => (k === 'idDiscount' ? '9' : null) } },
            },
          },
          { provide: UtilsService, useValue: { navigate } },
          { provide: MessageService, useValue: { add: messageAdd } },
        ],
      }).compileComponents();
      fixture = TestBed.createComponent(CreateDiscountPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('debe cargar descuento en modo edición', () => {
      expect(findOneDiscount).toHaveBeenCalledWith(9);
      expect(component.isEditMode).toBe(true);
    });

    it('submit en edición llama updateDiscount', () => {
      component.discountForm.patchValue({
        discountType: DiscountTypeEnum.PERCENTAGE,
        value: 12,
        startDate: '2025-02-01',
        endDate: '2025-12-31',
      });
      component.submit();
      expect(updateDiscount).toHaveBeenCalled();
      expect(navigate).toHaveBeenCalled();
    });

    it('updateDiscount error muestra toast', () => {
      updateDiscount.mockReturnValue(throwError(() => ({ message: 'update fail' })));
      component.discountForm.patchValue({
        discountType: DiscountTypeEnum.PERCENTAGE,
        value: 12,
        startDate: '2025-02-01',
        endDate: '2025-12-31',
      });
      component.submit();
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', detail: 'update fail' }),
      );
    });
  });

  describe('modo edición con alcance PRODUCT', () => {
    let findOneDiscount: jest.Mock;

    beforeEach(async () => {
      findOneDiscount = jest.fn(() =>
        of({
          id: 12,
          scope: DiscountScopeEnum.PRODUCT,
          idCatalog: 5,
          discountType: DiscountTypeEnum.PERCENTAGE,
          value: 15,
          startDate: '2025-01-01T00:00:00.000Z',
          endDate: '2025-12-31T23:59:59.999Z',
          discountProducts: [{ idProduct: 3 }],
        }),
      );
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [CreateDiscountPage, TranslateModule.forRoot()],
        providers: [
          TranslateService,
          TranslateStore,
          { provide: AuthStore, useValue: { business: () => ({ id: 1, path: 'b' }) } },
          {
            provide: CatalogPrivateService,
            useValue: { findAllMyCatalogs: () => of({ items: [{ id: 5, title: 'C' }] }) },
          },
          {
            provide: ProductPrivateService,
            useValue: {
              getAllByCatalogPaginated: () =>
                of({ items: [{ id: 3, title: 'Producto' }] }),
            },
          },
          {
            provide: CurrencyPrivateService,
            useValue: { findAllCurrencies: () => of([{ id: 2, code: 'USD' } as any]) },
          },
          {
            provide: DiscountPrivateService,
            useValue: {
              createDiscount,
              updateDiscount: jest.fn(() => of({})),
              findOneDiscount,
            },
          },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: { paramMap: { get: (k: string) => (k === 'idDiscount' ? '12' : null) } },
            },
          },
          { provide: UtilsService, useValue: { navigate } },
          { provide: MessageService, useValue: { add: messageAdd } },
        ],
      }).compileComponents();
      fixture = TestBed.createComponent(CreateDiscountPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('debe cargar productos y rellenar formulario en alcance PRODUCT', () => {
      expect(findOneDiscount).toHaveBeenCalledWith(12);
      expect(component.products.length).toBe(1);
      expect(component.discountForm.get('idProduct')?.value).toBe(3);
      expect(component.showProductField).toBe(true);
    });
  });
});
