import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  AuthStore,
  CatalogPrivateService,
  DiscountTypeEnum,
  ProductPrivateService,
  RatesPrivateService,
  StatusEnum,
  UtilsService,
} from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { RegisterSalePage } from './register-sale-page';

describe('RegisterSalePage', () => {
  let component: RegisterSalePage;
  let fixture: ComponentFixture<RegisterSalePage>;
  let messageAdd: jest.Mock;
  let registerSale: jest.Mock;
  let formatPriceWithDiscount: jest.Mock;

  beforeEach(async () => {
    messageAdd = jest.fn();
    formatPriceWithDiscount = jest.fn(() => 15);
    registerSale = jest.fn(() =>
      of([
        {
          id: 100,
          skuCode: 'SKU-1',
          quantity: 4,
        },
      ]),
    );
    await TestBed.configureTestingModule({
      imports: [RegisterSalePage, TranslateModule.forRoot()],
      providers: [
        provideNoopAnimations(),
        {
          provide: AuthStore,
          useValue: {
            business: () => ({ id: 1, name: 'Test Business' }),
          },
        },
        {
          provide: CatalogPrivateService,
          useValue: {
            findAllMyCatalogs: () =>
              of({
                items: [
                  {
                    id: 10,
                    title: 'Cat A',
                    path: 'cat-a',
                  },
                ],
                page: 1,
                limit: 200,
                total: 1,
              }),
          },
        },
        {
          provide: ProductPrivateService,
          useValue: {
            getAllByCatalogPaginated: () =>
              of({
                items: [
                  {
                    id: 1,
                    idCatalog: 10,
                    title: 'Product 1',
                    skus: [
                      {
                        id: 100,
                        skuCode: 'SKU-1',
                        quantity: 5,
                        price: 25,
                        status: StatusEnum.ACTIVE,
                        variationOptions: {},
                        currency: { code: 'USD' },
                      },
                    ],
                  },
                ],
                page: 1,
                limit: 100,
                total: 1,
              }),
            getAllByCatalog: () =>
              of([
                {
                  id: 1,
                  idCatalog: 10,
                  title: 'Product 1',
                  skus: [
                    {
                      id: 100,
                      skuCode: 'SKU-1',
                      quantity: 5,
                      price: 25,
                      status: StatusEnum.ACTIVE,
                      variationOptions: {},
                      currency: { code: 'USD' },
                    },
                  ],
                },
              ]),
            findOneProduct: () =>
              of({
                id: 1,
                idCatalog: 10,
                title: 'Product 1',
                skus: [
                  {
                    id: 100,
                    skuCode: 'SKU-1',
                    quantity: 5,
                    price: 25,
                    status: StatusEnum.ACTIVE,
                    variationOptions: {},
                    currency: { code: 'USD' },
                  },
                ],
              }),
            registerSale,
          },
        },
        {
          provide: MessageService,
          useValue: {
            add: messageAdd,
          },
        },
        {
          provide: RatesPrivateService,
          useValue: {
            findBcvOfficialRates: () =>
              of({ dollar: 1, euro: 1, sourceDate: '2024-01-01' }),
          },
        },
        {
          provide: UtilsService,
          useValue: { formatPriceWithDiscount },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterSalePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function debounceWait(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 350));
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load catalogs and default products', async () => {
    await debounceWait();
    fixture.detectChanges();
    expect(component.catalogs.length).toBe(1);
    expect(component.selectedCatalogId).toBe(10);
    expect(component.products.length).toBe(1);
  });

  it('should add single-sku product to cart', async () => {
    await debounceWait();
    fixture.detectChanges();
    const product = component.products[0];
    component.addToCart(product);
    expect(component.cart.length).toBe(1);
    expect(component.cart[0].lines[0].idProductSku).toBe(100);
    expect(component.cart[0].lines[0].quantity).toBe(1);
  });

  it('should not add duplicate product to cart', async () => {
    await debounceWait();
    fixture.detectChanges();
    const product = component.products[0];
    component.addToCart(product);
    component.addToCart(product);
    expect(component.cart.length).toBe(1);
  });

  it('should remove cart entry', async () => {
    await debounceWait();
    fixture.detectChanges();
    component.addToCart(component.products[0]);
    component.removeCartEntry(component.products[0].id);
    expect(component.cart.length).toBe(0);
  });

  it('stockWarning debe detectar cantidad mayor al stock', async () => {
    await debounceWait();
    fixture.detectChanges();
    const sku = component.products[0].skus![0];
    expect(component.stockWarning(sku, 10)).toBe(true);
    expect(component.stockWarning(sku, 2)).toBe(false);
  });

  it('registerSale debe avisar si el carrito está vacío', () => {
    component.cart = [];
    component.registerSale();
    expect(messageAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'warn' }),
    );
    expect(registerSale).not.toHaveBeenCalled();
  });

  it('registerSale debe enviar venta y vaciar carrito', async () => {
    await debounceWait();
    fixture.detectChanges();
    component.addToCart(component.products[0]);
    component.registerSale();
    expect(registerSale).toHaveBeenCalled();
    expect(component.cart.length).toBe(0);
    expect(messageAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' }),
    );
  });

  it('navigateToInventory debe construir ruta al inventario', async () => {
    await debounceWait();
    fixture.detectChanges();
    const url = component.navigateToInventory(component.products[0]);
    expect(url).toContain('inventory');
    expect(url).toContain('cat-a');
  });

  it('skuLabel debe incluir código SKU', async () => {
    await debounceWait();
    const sku = component.products[0].skus![0];
    expect(component.skuLabel(sku)).toContain('SKU-1');
  });

  it('onCatalogChange debe recargar productos', async () => {
    await debounceWait();
    component.selectedCatalogId = null;
    component.onCatalogChange();
    expect(component.products).toEqual([]);
  });

  it('lineTotals debe calcular subtotales del carrito', async () => {
    await debounceWait();
    component.addToCart(component.products[0]);
    const entry = component.cart[0];
    const totals = component.lineTotals(entry, entry.lines[0]);
    expect(totals.quantity).toBe(1);
    expect(totals.subtotalFinal).toBeGreaterThan(0);
  });

  it('invoiceTotalsByCurrency agrega por moneda', async () => {
    await debounceWait();
    component.addToCart(component.products[0]);
    const invoice = component.invoiceTotalsByCurrency();
    expect(invoice.length).toBeGreaterThan(0);
  });

  it('findSku debe localizar SKU por id', async () => {
    await debounceWait();
    const sku = component.findSku(component.products[0], 100);
    expect(sku?.skuCode).toBe('SKU-1');
  });

  it('isInCart detecta producto en carrito', async () => {
    await debounceWait();
    component.addToCart(component.products[0]);
    expect(component.isInCart(component.products[0].id)).toBe(true);
  });

  it('getOptionLabel resuelve color o size', () => {
    expect(component.getOptionLabel('unknown')).toBe('unknown');
  });

  it('skuLabel incluye variaciones cuando existen', () => {
    const sku = {
      skuCode: 'SKU-X',
      variationOptions: { 'variations.color': 'red' },
    } as any;
    expect(component.skuLabel(sku)).toContain('SKU-X');
  });

  it('onSearchInput dispara carga con término', async () => {
    await debounceWait();
    component.searchText = 'prod';
    component.onSearchInput();
    await debounceWait();
    expect(component.loadingProducts).toBe(false);
  });

  it('addSkuLine añade línea cuando hay múltiples SKUs', async () => {
    await debounceWait();
    const multiSkuProduct = {
      ...component.products[0],
      skus: [
        { id: 100, skuCode: 'A', quantity: 5, price: 10, status: StatusEnum.ACTIVE, variationOptions: {}, currency: { code: 'USD' } },
        { id: 101, skuCode: 'B', quantity: 3, price: 12, status: StatusEnum.ACTIVE, variationOptions: {}, currency: { code: 'USD' } },
      ],
    };
    component.addToCart(multiSkuProduct);
    component.addSkuLine(component.cart[0]);
    expect(component.cart[0].lines.length).toBe(2);
  });

  it('registerSale debe avisar si falta SKU en línea', async () => {
    await debounceWait();
    const multiSkuProduct = {
      id: 2,
      title: 'Multi',
      skus: [
        { id: 200, skuCode: 'A', quantity: 5, price: 10, status: StatusEnum.ACTIVE, variationOptions: {}, currency: { code: 'USD' } },
        { id: 201, skuCode: 'B', quantity: 3, price: 12, status: StatusEnum.ACTIVE, variationOptions: {}, currency: { code: 'USD' } },
      ],
    } as any;
    component.cart = [
      { productId: 2, product: multiSkuProduct, lines: [{ idProductSku: null, quantity: 1 }] },
    ];
    component.registerSale();
    expect(messageAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'warn' }),
    );
  });

  it('navigateToInventory sin productId devuelve dashboard', () => {
    expect(component.navigateToInventory({ id: undefined } as any)).toContain('dashboard');
  });

  it('availableSkusForLine excluye SKUs ya seleccionados', async () => {
    await debounceWait();
    const product = component.products[0];
    component.addToCart(product);
    const entry = component.cart[0];
    const available = component.availableSkusForLine(entry, 0);
    expect(available.length).toBeGreaterThan(0);
  });

  it('removeSkuLine elimina línea extra', async () => {
    await debounceWait();
    const multiSkuProduct = {
      ...component.products[0],
      skus: [
        { id: 100, skuCode: 'A', quantity: 5, price: 10, status: StatusEnum.ACTIVE, variationOptions: {}, currency: { code: 'USD' } },
        { id: 101, skuCode: 'B', quantity: 3, price: 12, status: StatusEnum.ACTIVE, variationOptions: {}, currency: { code: 'USD' } },
      ],
    };
    component.addToCart(multiSkuProduct);
    component.addSkuLine(component.cart[0]);
    component.removeSkuLine(component.cart[0], 1);
    expect(component.cart[0].lines.length).toBe(1);
  });

  it('registerSale error muestra mensaje de error', async () => {
    registerSale.mockReturnValue(throwError(() => new Error('fail')));
    await debounceWait();
    component.addToCart(component.products[0]);
    component.registerSale();
    expect(messageAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error' }),
    );
  });

  it('registerSale avisa cantidad inválida', async () => {
    await debounceWait();
    component.addToCart(component.products[0]);
    component.cart[0].lines[0].quantity = 0;
    component.registerSale();
    expect(messageAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'warn' }),
    );
  });

  it('registerSale avisa SKU duplicado', async () => {
    await debounceWait();
    component.addToCart(component.products[0]);
    component.cart.push({
      productId: 99,
      product: { ...component.products[0], id: 99, title: 'Otro' },
      lines: [{ idProductSku: 100, quantity: 1 }],
    });
    component.registerSale();
    expect(messageAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'warn' }),
    );
  });

  it('stockWarning con stock null no advierte', () => {
    expect(component.stockWarning({ quantity: null } as any, 5)).toBe(false);
  });

  it('selectedCatalog devuelve catálogo activo', async () => {
    await debounceWait();
    expect(component.selectedCatalog?.id).toBe(10);
  });

  it('trackByProduct devuelve id', () => {
    expect(component.trackByProduct(0, { id: 42 } as any)).toBe(42);
  });

  it('getSkuDiscountedUnitPrice sin descuento devuelve precio', async () => {
    await debounceWait();
    const sku = component.products[0].skus![0];
    expect(component.getSkuDiscountedUnitPrice(sku, undefined)).toBe(25);
  });

  it('skuShowsDiscountedPrice false sin descuento', async () => {
    await debounceWait();
    const sku = component.products[0].skus![0];
    expect(component.skuShowsDiscountedPrice(sku, undefined)).toBe(false);
  });

  it('addToCart sin SKUs activos muestra aviso', async () => {
    await debounceWait();
    const findOneProduct = jest.fn(() =>
      of({ id: 5, title: 'Sin SKU', skus: [] }),
    );
    (TestBed.inject(ProductPrivateService) as any).findOneProduct = findOneProduct;
    component.addToCart({ id: 5, title: 'Sin SKU', skus: [] } as any);
    await debounceWait();
    expect(messageAdd).toHaveBeenCalled();
  });

  it('onSearchInput con id numérico recarga productos', async () => {
    await debounceWait();
    component.searchText = '1';
    component.onSearchInput();
    await debounceWait();
    expect(component.loadingProducts).toBe(false);
  });

  it('removeSkuLine no elimina si solo hay una línea', async () => {
    await debounceWait();
    component.addToCart(component.products[0]);
    component.removeSkuLine(component.cart[0], 0);
    expect(component.cart[0].lines.length).toBe(1);
  });

  it('removeSkuLine no hace nada si el producto no está en carrito', () => {
    component.removeSkuLine(
      { productId: 999, product: { id: 999 } as any, lines: [] },
      0,
    );
    expect(component.cart.length).toBe(0);
  });

  it('getSkuDiscountedUnitPrice aplica descuento FIXED', async () => {
    await debounceWait();
    const sku = {
      id: 100,
      price: 25,
      idCurrency: 1,
      currency: { code: 'USD' },
    } as any;
    const discount = {
      discountType: DiscountTypeEnum.FIXED,
      idCurrency: 1,
      value: 10,
    } as any;
    expect(component.getSkuDiscountedUnitPrice(sku, discount)).toBe(15);
    expect(formatPriceWithDiscount).toHaveBeenCalledWith(sku, discount, component.rates);
  });

  it('skuShowsDiscountedPrice true cuando el precio baja', async () => {
    await debounceWait();
    const sku = {
      id: 100,
      price: 25,
      idCurrency: 1,
      currency: { code: 'USD' },
    } as any;
    const discount = {
      discountType: DiscountTypeEnum.PERCENTAGE,
      value: 20,
    } as any;
    formatPriceWithDiscount.mockReturnValue(20);
    expect(component.skuShowsDiscountedPrice(sku, discount)).toBe(true);
  });

  it('registerSale avisa si falta precio en SKU', async () => {
    await debounceWait();
    const product = {
      ...component.products[0],
      skus: [
        {
          id: 100,
          skuCode: 'SKU-1',
          quantity: 5,
          price: null,
          status: StatusEnum.ACTIVE,
          variationOptions: {},
          currency: { code: 'USD' },
        },
      ],
    };
    component.cart = [
      {
        productId: product.id,
        product,
        lines: [{ idProductSku: 100, quantity: 1 }],
      },
    ];
    component.registerSale();
    expect(messageAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'warn' }),
    );
    expect(registerSale).not.toHaveBeenCalled();
  });

  it('loadCatalogs error muestra toast de error', async () => {
    TestBed.resetTestingModule();
    messageAdd = jest.fn();
    formatPriceWithDiscount = jest.fn(() => 15);
    await TestBed.configureTestingModule({
      imports: [RegisterSalePage, TranslateModule.forRoot()],
      providers: [
        provideNoopAnimations(),
        { provide: AuthStore, useValue: { business: () => ({ id: 1, name: 'Test Business' }) } },
        {
          provide: CatalogPrivateService,
          useValue: {
            findAllMyCatalogs: () => throwError(() => new Error('catalog fail')),
          },
        },
        {
          provide: ProductPrivateService,
          useValue: {
            getAllByCatalogPaginated: () => of({ items: [], page: 1, limit: 100, total: 0 }),
            getAllByCatalog: () => of([]),
            findOneProduct: jest.fn(),
            registerSale: jest.fn(),
          },
        },
        { provide: MessageService, useValue: { add: messageAdd } },
        {
          provide: RatesPrivateService,
          useValue: { findBcvOfficialRates: () => of({ dollar: 1, euro: 1, sourceDate: '2024-01-01' }) },
        },
        { provide: UtilsService, useValue: { formatPriceWithDiscount } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(RegisterSalePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(messageAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error' }),
    );
  });

  it('getRates error deja rates undefined sin bloquear ventas', async () => {
    TestBed.resetTestingModule();
    messageAdd = jest.fn();
    formatPriceWithDiscount = jest.fn(() => 15);
    await TestBed.configureTestingModule({
      imports: [RegisterSalePage, TranslateModule.forRoot()],
      providers: [
        provideNoopAnimations(),
        { provide: AuthStore, useValue: { business: () => ({ id: 1, name: 'Test Business' }) } },
        {
          provide: CatalogPrivateService,
          useValue: {
            findAllMyCatalogs: () =>
              of({ items: [{ id: 10, title: 'Cat A', path: 'cat-a' }], page: 1, limit: 200, total: 1 }),
          },
        },
        {
          provide: ProductPrivateService,
          useValue: {
            getAllByCatalogPaginated: () =>
              of({ items: [], page: 1, limit: 100, total: 0 }),
            getAllByCatalog: () => of([]),
            findOneProduct: jest.fn(),
            registerSale: jest.fn(),
          },
        },
        { provide: MessageService, useValue: { add: messageAdd } },
        {
          provide: RatesPrivateService,
          useValue: {
            findBcvOfficialRates: () => throwError(() => new Error('rates fail')),
          },
        },
        { provide: UtilsService, useValue: { formatPriceWithDiscount } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(RegisterSalePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.rates).toBeUndefined();
  });

  it('mergeByNumericProductId agrega producto por id en búsqueda numérica', async () => {
    const findOneProduct = jest.fn(() =>
      of({
        id: 1,
        idCatalog: 10,
        title: 'Producto por id',
        skus: [
          {
            id: 100,
            skuCode: 'SKU-1',
            quantity: 5,
            price: 25,
            status: StatusEnum.ACTIVE,
            variationOptions: {},
            currency: { code: 'USD' },
          },
        ],
      }),
    );
    const getAllByCatalog = jest.fn(() => of([]));
    (TestBed.inject(ProductPrivateService) as any).findOneProduct = findOneProduct;
    (TestBed.inject(ProductPrivateService) as any).getAllByCatalog = getAllByCatalog;
    await debounceWait();
    component.searchText = '1';
    component.onSearchInput();
    await debounceWait();
    expect(findOneProduct).toHaveBeenCalledWith(1);
    expect(component.products.some((p) => p.id === 1)).toBe(true);
  });

  it('prioritizeTagMatches ordena productos con etiquetas coincidentes', async () => {
    const taggedProduct = {
      id: 2,
      idCatalog: 10,
      title: 'Con tag',
      productTags: [{ tag: { name: 'promo', slug: 'promo' } }],
      skus: [
        {
          id: 200,
          skuCode: 'SKU-2',
          quantity: 5,
          price: 10,
          status: StatusEnum.ACTIVE,
          variationOptions: {},
          currency: { code: 'USD' },
        },
      ],
    };
    const plainProduct = {
      id: 3,
      idCatalog: 10,
      title: 'Sin tag',
      skus: [
        {
          id: 300,
          skuCode: 'SKU-3',
          quantity: 5,
          price: 10,
          status: StatusEnum.ACTIVE,
          variationOptions: {},
          currency: { code: 'USD' },
        },
      ],
    };
    (TestBed.inject(ProductPrivateService) as any).getAllByCatalog = jest.fn(() =>
      of([plainProduct, taggedProduct]),
    );
    await debounceWait();
    component.searchText = 'promo';
    component.onSearchInput();
    await debounceWait();
    expect(component.products[0]?.id).toBe(2);
  });
});
