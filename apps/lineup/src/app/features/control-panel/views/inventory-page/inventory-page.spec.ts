import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import {
  AuthStore,
  CatalogPrivateService,
  ProductPrivateService,
  StatusEnum,
  UtilsService,
} from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { InventoryPage } from './inventory-page';

describe('InventoryPage', () => {
  let component: InventoryPage;
  let fixture: ComponentFixture<InventoryPage>;
  let messageAdd: jest.Mock;
  let getAllByCatalog: jest.Mock;
  let getStockByProduct: jest.Mock;
  let findAllMyCatalogs: jest.Mock;
  let anchorClick: jest.Mock;

  const catalog = { id: 10, title: 'Cat A', path: 'cat-a' };
  const product = {
    id: 1,
    idCatalog: 10,
    title: 'Product 1',
    price: 25,
    status: StatusEnum.ACTIVE,
    currency: { code: 'USD' },
    skus: [],
  };
  const skuLow = {
    id: 100,
    skuCode: 'SKU-LOW',
    quantity: 3,
    price: 25,
    status: StatusEnum.ACTIVE,
    variationOptions: { size: 'M' },
    currency: { code: 'USD' },
  };
  const skuOut = { ...skuLow, id: 101, skuCode: 'SKU-OUT', quantity: 0 };
  const skuNull = { ...skuLow, id: 102, skuCode: 'SKU-NULL', quantity: null };
  const skuHealthy = { ...skuLow, id: 103, skuCode: 'SKU-OK', quantity: 20 };

  beforeEach(async () => {
    messageAdd = jest.fn();
    anchorClick = jest.fn();
    getStockByProduct = jest.fn((id: number) => {
      if (id === 1) {
        return of([skuLow, skuOut, skuNull, skuHealthy]);
      }
      return of([]);
    });
    getAllByCatalog = jest.fn(() => of([product]));
    findAllMyCatalogs = jest.fn(() =>
      of({
        items: [catalog],
        page: 1,
        limit: 200,
        total: 1,
      }),
    );

    await TestBed.configureTestingModule({
      imports: [InventoryPage, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: AuthStore,
          useValue: {
            business: () => ({ id: 1, name: 'Test Business' }),
          },
        },
        {
          provide: CatalogPrivateService,
          useValue: { findAllMyCatalogs },
        },
        {
          provide: ProductPrivateService,
          useValue: {
            getAllByCatalog,
            getAllByCatalogPaginated: jest.fn(),
            getStockByProduct,
          },
        },
        { provide: MessageService, useValue: { add: messageAdd } },
        {
          provide: UtilsService,
          useValue: {
            navigate: jest.fn(),
            document: {
              createElement: () => ({
                click: anchorClick,
                href: '',
                download: '',
              }),
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente y cargar catálogos', () => {
    expect(component).toBeTruthy();
    expect(findAllMyCatalogs).toHaveBeenCalled();
    expect(component.catalogs.length).toBe(1);
    expect(component.selectedCatalogId).toBe(10);
  });

  it('debe cargar productos y stock al seleccionar catálogo', () => {
    expect(getAllByCatalog).toHaveBeenCalledWith(10);
    expect(component.products.length).toBe(1);
    expect(getStockByProduct).toHaveBeenCalledWith(1);
  });

  describe('getters de stock', () => {
    beforeEach(() => {
      component.products = [product as any];
      (component as any)._stockByProductId.set(1, [
        skuLow,
        skuOut,
        skuNull,
        skuHealthy,
      ]);
    });

    it('debe calcular totales y contadores por tipo de stock', () => {
      expect(component.totalSkus).toBe(4);
      expect(component.totalUnits).toBe(23);
      expect(component.stockNotRegisteredSkusCount).toBe(1);
      expect(component.lowStockSkusCount).toBe(1);
      expect(component.outOfStockSkusCount).toBe(1);
      expect(component.healthyStockSkusCount).toBe(1);
    });

    it('selectedCatalog debe resolver el catálogo activo', () => {
      component.catalogs = [catalog as any];
      component.selectedCatalogId = 10;
      expect(component.selectedCatalog?.path).toBe('cat-a');
    });
  });

  describe('SKU helpers', () => {
    it('isSkuStockNotRegistered distingue null de cero', () => {
      expect(component.isSkuStockNotRegistered(null)).toBe(true);
      expect(component.isSkuStockNotRegistered(undefined)).toBe(true);
      expect(component.isSkuStockNotRegistered(0)).toBe(false);
    });

    it('isSkuOutOfStock solo es true con cantidad 0', () => {
      expect(component.isSkuOutOfStock(0)).toBe(true);
      expect(component.isSkuOutOfStock(null)).toBe(false);
      expect(component.isSkuOutOfStock(5)).toBe(false);
    });
  });

  describe('expansión de productos', () => {
    beforeEach(() => {
      (component as any)._stockByProductId.set(1, [skuLow]);
    });

    it('toggleProductExpansion alterna el estado', () => {
      expect(component.isProductExpanded(1)).toBe(false);
      component.toggleProductExpansion(1);
      expect(component.isProductExpanded(1)).toBe(true);
      component.toggleProductExpansion(1);
      expect(component.isProductExpanded(1)).toBe(false);
    });

    it('getProductSkus y métricas por producto', () => {
      expect(component.getProductSkus(1).length).toBe(1);
      expect(component.getProductTotalUnits(1)).toBe(3);
      expect(component.getProductStockNotRegisteredSkus(1)).toBe(0);
      expect(component.getProductOutOfStockSkus(1)).toBe(0);
      expect(component.getProductLowStockSkus(1)).toBe(1);
    });
  });

  describe('onCatalogChange', () => {
    it('debe limpiar productos si no hay catálogo seleccionado', () => {
      component.products = [product as any];
      component.selectedCatalogId = null;
      component.onCatalogChange();
      expect(component.products).toEqual([]);
    });
  });

  describe('trackBy', () => {
    it('debe devolver ids estables', () => {
      expect(component.trackByCatalog(0, catalog as any)).toBe(10);
      expect(component.trackByProduct(0, product as any)).toBe(1);
      expect(component.trackBySku(0, skuLow as any)).toBe(100);
    });
  });

  describe('navigateToInventory', () => {
    it('debe incluir path del catálogo e id de producto', () => {
      component.catalogs = [catalog as any];
      component.selectedCatalogId = 10;
      const url = component.navigateToInventory(1);
      expect(url).toContain('cat-a');
      expect(url).toContain('inventory');
    });
  });

  describe('downloadCurrentCatalogCsv', () => {
    beforeEach(() => {
      component.catalogs = [catalog as any];
      component.selectedCatalogId = 10;
      component.products = [product as any];
      (component as any)._stockByProductId.set(1, [skuLow]);
      component.loadingProducts = false;
      component.loadingStock = false;
    });

    it('debe descargar CSV y mostrar toast de éxito', () => {
      component.downloadCurrentCatalogCsv();
      expect(anchorClick).toHaveBeenCalled();
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success' }),
      );
    });

    it('no debe descargar si falta catálogo o hay carga activa', () => {
      component.selectedCatalogId = null;
      component.downloadCurrentCatalogCsv();
      expect(anchorClick).not.toHaveBeenCalled();
    });
  });

  describe('downloadAllCatalogsAsCsv', () => {
    it('debe exportar todos los catálogos en browser', fakeAsync(() => {
      component.catalogs = [catalog as any];
      component.downloadAllCatalogsAsCsv();
      tick(500);
      expect(anchorClick).toHaveBeenCalled();
      expect(messageAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success' }),
      );
    }));

    it('no debe iniciar exportación en servidor', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [InventoryPage, TranslateModule.forRoot()],
        providers: [
          provideRouter([]),
          provideNoopAnimations(),
          { provide: PLATFORM_ID, useValue: 'server' },
          {
            provide: AuthStore,
            useValue: { business: () => ({ id: 1 }) },
          },
          {
            provide: CatalogPrivateService,
            useValue: { findAllMyCatalogs: () => of({ items: [catalog], page: 1, limit: 200, total: 1 }) },
          },
          {
            provide: ProductPrivateService,
            useValue: {
              getAllByCatalog: () => of([product]),
              getStockByProduct: () => of([]),
            },
          },
          { provide: MessageService, useValue: { add: messageAdd } },
          { provide: UtilsService, useValue: { document: { createElement: jest.fn() } } },
        ],
      }).compileComponents();
      const fix = TestBed.createComponent(InventoryPage);
      const cmp = fix.componentInstance;
      fix.detectChanges();
      cmp.catalogs = [catalog as any];
      cmp.downloadAllCatalogsAsCsv();
      expect(cmp.downloadingCsv).toBe(false);
    });
  });
});

describe('InventoryPage errores de carga', () => {
  it('debe mostrar error si falla findAllMyCatalogs', async () => {
    const messageAdd = jest.fn();
    await TestBed.configureTestingModule({
      imports: [InventoryPage, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: AuthStore, useValue: { business: () => ({ id: 1 }) } },
        {
          provide: CatalogPrivateService,
          useValue: {
            findAllMyCatalogs: () => throwError(() => new Error('fail')),
          },
        },
        {
          provide: ProductPrivateService,
          useValue: {
            getAllByCatalog: () => of([]),
            getStockByProduct: () => of([]),
          },
        },
        { provide: MessageService, useValue: { add: messageAdd } },
        { provide: UtilsService, useValue: { document: { createElement: jest.fn() } } },
      ],
    }).compileComponents();
    const fix = TestBed.createComponent(InventoryPage);
    fix.detectChanges();
    expect(messageAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error' }),
    );
  });
});
