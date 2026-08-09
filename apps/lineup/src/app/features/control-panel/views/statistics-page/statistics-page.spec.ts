import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  CurrencyPrivateService,
  StatsPrivateService,
  UtilsService,
} from '@lineup/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { StatisticsPage, StatisticsPeriodMode } from './statistics-page';

describe('StatisticsPage', () => {
  let component: StatisticsPage;
  let fixture: ComponentFixture<StatisticsPage>;
  let messageAdd: jest.Mock;
  let locationBack: jest.Mock;

  beforeEach(async () => {
    messageAdd = jest.fn();
    locationBack = jest.fn();

    await TestBed.configureTestingModule({
      imports: [StatisticsPage, TranslateModule.forRoot()],
      providers: [
        TranslateService,
        { provide: MessageService, useValue: { add: messageAdd } },
        { provide: Location, useValue: { back: locationBack } },
        {
          provide: UtilsService,
          useValue: {
            document: {
              createElement: () => ({
                click: (): void => undefined,
                href: '',
                download: '',
              }),
            },
          },
        },
        {
          provide: CurrencyPrivateService,
          useValue: { findAllCurrencies: () => of([]) },
        },
        {
          provide: StatsPrivateService,
          useValue: {
            businessEngagementStats: () =>
              of({
                newFollowers: { total: 0 },
                visits: {
                  visits: { total: 0 },
                  visitsByAuthType: {
                    anonymous: 0,
                    identified: 0,
                    data: [],
                  },
                },
              }),
            catalogStats: () =>
              of({
                catalogVisitsOverTime: { total: 0 },
                topByVisits: [],
                productsPerCatalog: [],
              }),
            discountStats: () =>
              of({
                byStatus: [],
                byType: [],
                expiringSoon: { total: 0 },
              }),
            inventoryStats: () =>
              of({
                productsWithoutStockCount: 0,
                skusLowOrOutOfStockCount: 0,
                recentStockMovements: [],
              }),
            productStats: () =>
              of({
                topByLikes: [],
                topByRating: [],
                topByVisits: [],
                visitToLikeRatio: {
                  ratio: 0,
                  totalLikes: 0,
                  totalVisits: 0,
                },
                withoutRatingsCount: 0,
                withoutVisitsCount: 0,
              }),
            businessSalesInTimePeriod: () =>
              of({ sales: [], salesCount: { total: 0 } }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatisticsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('distingue stock no registrado (null) de agotado (0) para quantity de SKU', () => {
    expect(component.isSkuStockNotRegistered(null)).toBe(true);
    expect(component.isSkuStockNotRegistered(undefined)).toBe(true);
    expect(component.isSkuStockNotRegistered(0)).toBe(false);
    expect(component.isSkuOutOfStock(0)).toBe(true);
    expect(component.isSkuOutOfStock(null)).toBe(false);
    expect(component.isSkuOutOfStock(5)).toBe(false);
  });

  describe('periodo y navegación', () => {
    it('goBack debe delegar en Location', () => {
      component.goBack();
      expect(locationBack).toHaveBeenCalled();
    });

    it('statsDatePickerFormat debe usar formato ES por defecto', () => {
      expect(component.statsDatePickerFormat).toBe('dd/mm/yy');
    });

    it('applyCustomPeriod debe avisar si faltan fechas', () => {
      component.customStartDate = null;
      component.customEndDate = null;
      component.applyCustomPeriod();
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'warn' }),
      );
    });

    it('applyCustomPeriod debe avisar si el rango es inválido', () => {
      component.customStartDate = new Date('2025-02-01');
      component.customEndDate = new Date('2025-01-01');
      component.applyCustomPeriod();
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'warn' }),
      );
    });

    it('onPeriodModeChange no debe recargar en modo CUSTOM', () => {
      component.periodMode = StatisticsPeriodMode.CUSTOM;
      component.loading = false;
      component.onPeriodModeChange();
      expect(component.loading).toBe(false);
    });
  });

  describe('carga inicial', () => {
    it('debe completar carga y poblar opciones de periodo', () => {
      expect(component.loading).toBe(false);
      expect(component.periodOptions.length).toBeGreaterThan(0);
      expect(component.inventory).toBeDefined();
    });
  });

  describe('periodo y recarga', () => {
    it('onPeriodModeChange debe recargar fuera de CUSTOM', () => {
      component.periodMode = StatisticsPeriodMode.DAY;
      const reloadSpy = jest.spyOn(component['_reload$'], 'next');
      component.onPeriodModeChange();
      expect(reloadSpy).toHaveBeenCalled();
    });

    it('applyCustomPeriod válido debe recargar', () => {
      component.customStartDate = new Date('2025-01-01');
      component.customEndDate = new Date('2025-01-31');
      component.applyCustomPeriod();
      expect(messageAdd).not.toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'warn' }),
      );
    });

    it('statsDatePickerFormat debe usar mm/dd/yy en inglés', () => {
      component['_translate'].use('en');
      expect(component.statsDatePickerFormat).toBe('mm/dd/yy');
    });
  });

  describe('saleCurrencyCode', () => {
    it('debe resolver código desde catálogo de monedas', () => {
      component['_currencyCodeById'].set(2, 'EUR');
      const code = component.saleCurrencyCode({
        productSku: { idCurrency: 2, currency: { code: 'USD' } },
      } as any);
      expect(code).toBe('EUR');
    });

    it('debe usar currency del SKU como fallback', () => {
      const code = component.saleCurrencyCode({
        productSku: { currency: { code: 'VES' } },
      } as any);
      expect(code).toBe('VES');
    });
  });

  describe('exportación CSV', () => {
    let anchorClick: jest.Mock;

    beforeEach(() => {
      anchorClick = jest.fn();
      component['_utils'] = {
        document: {
          createElement: () => ({
            click: anchorClick,
            href: '',
            download: '',
          }),
        },
      } as any;
    });

    it('downloadInventoryCsv debe descargar cuando hay datos', () => {
      component.downloadInventoryCsv();
      expect(anchorClick).toHaveBeenCalled();
    });

    it('downloadSalesCsv debe descargar cuando hay datos', () => {
      component.downloadSalesCsv();
      expect(anchorClick).toHaveBeenCalled();
    });

    it('downloadProductsCsv debe descargar cuando hay datos', () => {
      component.downloadProductsCsv();
      expect(anchorClick).toHaveBeenCalled();
    });

    it('downloadCatalogsCsv debe descargar cuando hay datos', () => {
      component.downloadCatalogsCsv();
      expect(anchorClick).toHaveBeenCalled();
    });

    it('downloadDiscountsCsv debe descargar cuando hay datos', () => {
      component.downloadDiscountsCsv();
      expect(anchorClick).toHaveBeenCalled();
    });

    it('downloadEngagementCsv debe descargar cuando hay datos', () => {
      component.downloadEngagementCsv();
      expect(anchorClick).toHaveBeenCalled();
    });

    it('debe avisar si no hay datos para exportar', () => {
      component.inventory = undefined;
      component.downloadInventoryCsv();
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'warn' }),
      );
    });
  });

  describe('periodos avanzados y CSV con datos', () => {
    beforeEach(() => {
      component.inventory = {
        productsWithoutStockCount: 2,
        skusLowOrOutOfStockCount: 1,
        recentStockMovements: [
          {
            id: 1,
            creationDate: '2025-01-01',
            quantityDelta: -1,
            type: 'SALE' as any,
            productSku: { idCurrency: 2, currency: { code: 'USD' } },
          },
        ],
      } as any;
      component.sales = {
        salesCount: { total: 1 },
        sales: [
          {
            id: 10,
            creationDate: '2025-01-02',
            idProductSku: 5,
            quantityDelta: -2,
            type: 'SALE' as any,
            price: 20,
            newQuantity: 3,
            notes: 'test,note',
            productSku: {
              skuCode: 'SKU-1',
              product: { title: 'Prod' },
              idCurrency: 2,
              currency: { code: 'USD' },
            },
          },
        ],
      } as any;
      component.products = {
        visitToLikeRatio: { ratio: 0.5, totalLikes: 1, totalVisits: 2 },
        withoutRatingsCount: 1,
        withoutVisitsCount: 0,
        topByVisits: [{ id: 1, title: 'A', visits: 5 }],
        topByLikes: [{ id: 2, title: 'B', likes: 3 }],
        topByRating: [{ id: 3, title: 'C', ratingAverage: 4.5 }],
      } as any;
      component.catalogs = {
        catalogVisitsOverTime: { total: 10 },
        topByVisits: [{ id: 1, title: 'Cat', visits: 8 }],
        productsPerCatalog: [{ label: 'Cat', count: 2 }],
      } as any;
      component.discounts = {
        expiringSoon: { total: 1 },
        byStatus: [{ label: 'ACTIVE', count: 2 }],
        byType: [{ label: 'PCT', count: 1 }],
      } as any;
      component.engagement = {
        newFollowers: { total: 4 },
        visits: {
          visits: { total: 20 },
          visitsByAuthType: { anonymous: 12, identified: 8, data: [] },
        },
      } as any;
      component['_currencyCodeById'].set(2, 'EUR');
    });

    it('descarga CSV de inventario, ventas, productos, catálogos, descuentos y engagement', () => {
      component.downloadInventoryCsv();
      component.downloadSalesCsv();
      component.downloadProductsCsv();
      component.downloadCatalogsCsv();
      component.downloadDiscountsCsv();
      component.downloadEngagementCsv();
      expect(messageAdd).not.toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'warn', detail: expect.stringContaining('csvExportEmpty') }),
      );
    });

    it('onPeriodModeChange recarga en modo WEEK y MONTH', () => {
      const reloadSpy = jest.spyOn(component['_reload$'], 'next');
      component.periodMode = StatisticsPeriodMode.WEEK;
      component.onPeriodModeChange();
      component.periodMode = StatisticsPeriodMode.MONTH;
      component.onPeriodModeChange();
      expect(reloadSpy).toHaveBeenCalledTimes(2);
    });

    it('applyCustomPeriod válido con periodo CUSTOM activo recarga', () => {
      component.periodMode = StatisticsPeriodMode.CUSTOM;
      component.customStartDate = new Date('2025-03-01');
      component.customEndDate = new Date('2025-03-31');
      const reloadSpy = jest.spyOn(component['_reload$'], 'next');
      component.applyCustomPeriod();
      expect(reloadSpy).toHaveBeenCalled();
    });

    it('onLangChange reconstruye opciones de periodo', () => {
      component['_translate'].use('en');
      component['_translate'].onLangChange.emit({ lang: 'en', translations: {} });
      expect(component.periodOptions.length).toBeGreaterThan(0);
    });
  });

  describe('errores y ciclo de vida', () => {
    it('ngOnDestroy desuscribe subscripciones', () => {
      const unsubSpy = jest.spyOn(component['_subscription'], 'unsubscribe');
      component.ngOnDestroy();
      expect(unsubSpy).toHaveBeenCalled();
    });

    it('error al recargar estadísticas muestra toast y detiene loading', async () => {
      TestBed.resetTestingModule();
      messageAdd = jest.fn();
      locationBack = jest.fn();
      await TestBed.configureTestingModule({
        imports: [StatisticsPage, TranslateModule.forRoot()],
        providers: [
          TranslateService,
          { provide: MessageService, useValue: { add: messageAdd } },
          { provide: Location, useValue: { back: locationBack } },
          {
            provide: UtilsService,
            useValue: {
              document: {
                createElement: () => ({
                  click: (): void => undefined,
                  href: '',
                  download: '',
                }),
              },
            },
          },
          {
            provide: CurrencyPrivateService,
            useValue: { findAllCurrencies: () => of([]) },
          },
          {
            provide: StatsPrivateService,
            useValue: {
              businessEngagementStats: () => throwError(() => new Error('fail')),
              catalogStats: () => of({}),
              discountStats: () => of({}),
              inventoryStats: () => of({}),
              productStats: () => of({}),
              businessSalesInTimePeriod: () => of({}),
            },
          },
        ],
      }).compileComponents();
      fixture = TestBed.createComponent(StatisticsPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error' }),
      );
      expect(component.loading).toBe(false);
    });

    it('error al cargar monedas registra en consola', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      TestBed.resetTestingModule();
      messageAdd = jest.fn();
      locationBack = jest.fn();
      await TestBed.configureTestingModule({
        imports: [StatisticsPage, TranslateModule.forRoot()],
        providers: [
          TranslateService,
          { provide: MessageService, useValue: { add: messageAdd } },
          { provide: Location, useValue: { back: locationBack } },
          {
            provide: UtilsService,
            useValue: {
              document: {
                createElement: () => ({
                  click: (): void => undefined,
                  href: '',
                  download: '',
                }),
              },
            },
          },
          {
            provide: CurrencyPrivateService,
            useValue: {
              findAllCurrencies: () => throwError(() => new Error('currency fail')),
            },
          },
          {
            provide: StatsPrivateService,
            useValue: {
              businessEngagementStats: () =>
                of({
                  newFollowers: { total: 0 },
                  visits: {
                    visits: { total: 0 },
                    visitsByAuthType: { anonymous: 0, identified: 0, data: [] },
                  },
                }),
              catalogStats: () =>
                of({ catalogVisitsOverTime: { total: 0 }, topByVisits: [], productsPerCatalog: [] }),
              discountStats: () => of({ byStatus: [], byType: [], expiringSoon: { total: 0 } }),
              inventoryStats: () =>
                of({ productsWithoutStockCount: 0, skusLowOrOutOfStockCount: 0, recentStockMovements: [] }),
              productStats: () =>
                of({
                  topByLikes: [],
                  topByRating: [],
                  topByVisits: [],
                  visitToLikeRatio: { ratio: 0, totalLikes: 0, totalVisits: 0 },
                  withoutRatingsCount: 0,
                  withoutVisitsCount: 0,
                }),
              businessSalesInTimePeriod: () => of({ sales: [], salesCount: { total: 0 } }),
            },
          },
        ],
      }).compileComponents();
      fixture = TestBed.createComponent(StatisticsPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('modos ALL y DAY', () => {
    it('onPeriodModeChange recarga en modo ALL y DAY', () => {
      const reloadSpy = jest.spyOn(component['_reload$'], 'next');
      reloadSpy.mockClear();
      component.periodMode = StatisticsPeriodMode.ALL;
      component.onPeriodModeChange();
      component.periodMode = StatisticsPeriodMode.DAY;
      component.onPeriodModeChange();
      expect(reloadSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('utilidades CSV y moneda', () => {
    it('csvCell escapa comillas, comas y saltos de línea', () => {
      expect(component['csvCell'](null)).toBe('');
      expect(component['csvCell'](undefined)).toBe('');
      expect(component['csvCell']('a,b')).toBe('"a,b"');
      expect(component['csvCell']('say "hi"')).toBe('"say ""hi"""');
      expect(component['csvCell']('line\nbreak')).toBe('"line\nbreak"');
    });

    it('movementTypeLabel usa clave i18n o el tipo desconocido', () => {
      expect(component['movementTypeLabel']('SALE' as any)).toBeTruthy();
      expect(component['movementTypeLabel']('UNKNOWN_TYPE' as any)).toBe(
        'UNKNOWN_TYPE',
      );
    });

    it('saleCurrencyCode con id sin mapa usa currency del SKU', () => {
      const code = component.saleCurrencyCode({
        productSku: { idCurrency: 99, currency: { code: 'USD' } },
      } as any);
      expect(code).toBe('USD');
    });

    it('saleCurrencyCode sin moneda devuelve undefined', () => {
      expect(component.saleCurrencyCode({ productSku: {} } as any)).toBeUndefined();
    });
  });
});
