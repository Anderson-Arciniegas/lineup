import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import {
  AppConfigService,
  ProductPrivateService,
  ProductSchema,
  UtilsService,
} from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of, Subject, throwError } from 'rxjs';
import { ProductItem } from './product-item';

describe('ProductItem', () => {
  let component: ProductItem;
  let fixture: ComponentFixture<ProductItem>;
  let dialogService: { open: jest.Mock };
  let productService: { removeProduct: jest.Mock };
  let utilsService: { formatPriceWithDiscount: jest.Mock; navigate: jest.Mock };
  let messageService: { add: jest.Mock };
  let onClose$: Subject<boolean>;

  const product = {
    id: 7,
    title: 'Producto panel',
    catalog: { path: 'cat-1' },
    business: { path: 'mi-tienda' },
    productFiles: [{ file: { url: 'https://example.com/img.jpg' } }],
    skus: [{ price: 25, currency: { code: 'USD' } }],
    discountProduct: null,
  } as unknown as ProductSchema;

  beforeEach(async () => {
    onClose$ = new Subject();
    dialogService = {
      open: jest.fn(() => ({ onClose: onClose$.asObservable() })),
    };
    productService = { removeProduct: jest.fn(() => of({})) };
    utilsService = {
      formatPriceWithDiscount: jest.fn(() => 20),
      navigate: jest.fn(),
    };
    messageService = { add: jest.fn() };

    AppConfigService.config = {
      routes: {
        dashboard: 'dashboard',
        catalogs: 'catalogs',
        edit: 'edit',
        inventory: 'inventory',
      },
    } as typeof AppConfigService.config;

    await TestBed.configureTestingModule({
      imports: [ProductItem, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: PLATFORM_ID, useValue: 'browser' },
        TranslateService,
        TranslateStore,
        { provide: DialogService, useValue: dialogService },
        { provide: ProductPrivateService, useValue: productService },
        { provide: UtilsService, useValue: utilsService },
        { provide: MessageService, useValue: messageService },
      ],
    })
      .overrideComponent(ProductItem, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(ProductItem);
    component = fixture.componentInstance;
    component.product = product;
    component.rates = { dollar: 36, euro: 40, sourceDate: '2024-01-01' };
    fixture.detectChanges();
    component.ngOnInit();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe construir URLs del panel en ngOnInit', () => {
    expect(component.url).toContain('/dashboard/catalogs/cat-1/7');
    expect(component.editUrl).toContain('/edit');
    expect(component.inventoryUrl).toContain('/inventory');
    expect(component.price).toBe(20);
    expect(component.originalPrice).toBe(25);
  });

  it('debe usar imagen vacía sin productFiles', () => {
    component.product = { ...product, productFiles: undefined } as ProductSchema;
    component.ngOnInit();
    expect(component.image).toBe('');
    expect(component.hasProductImage).toBe(false);
  });

  it('debe tolerar productFiles vacío', () => {
    component.product = { ...product, productFiles: [] } as ProductSchema;
    component.ngOnInit();
    expect(component.image).toBe('');
    expect(component.hasProductImage).toBe(false);
  });

  it('debe leer url de productFiles cuando file existe', () => {
    component.product = {
      ...product,
      productFiles: [{ file: { url: 'https://cdn.test/img.png' } }],
    } as ProductSchema;
    component.ngOnInit();
    expect(component.image).toBe('https://cdn.test/img.png');
    expect(component.hasProductImage).toBe(true);
  });

  it('debe manejar producto sin SKUs', () => {
    component.product = { ...product, skus: undefined, discountProduct: null } as ProductSchema;
    component.rates = null;
    component.ngOnInit();
    expect(component.originalPrice).toBeNull();
    expect(component.currency).toBeNull();
    expect(utilsService.formatPriceWithDiscount).toHaveBeenCalledWith(null, null, null);
  });

  it('debe calcular precio con descuento', () => {
    component.product = {
      ...product,
      discountProduct: { id: 1, discount: { percentage: 15 } },
    } as unknown as ProductSchema;
    component.ngOnInit();
    expect(utilsService.formatPriceWithDiscount).toHaveBeenCalledWith(
      product.skus![0],
      { percentage: 15 },
      component.rates,
    );
  });

  describe('setLabel', () => {
    it('debe truncar títulos largos', () => {
      expect(component.setLabel('a'.repeat(25))).toBe(`${'a'.repeat(20)}...`);
    });

    it('debe devolver título corto sin cambios', () => {
      expect(component.setLabel('Hola')).toBe('Hola');
    });

    it('debe manejar null/undefined', () => {
      expect(component.setLabel(null)).toBe('');
    });
  });

  describe('deleteProduct', () => {
    it('debe eliminar producto tras confirmación', () => {
      jest.spyOn(component.productDeletionEvent, 'emit');
      component.deleteProduct();
      onClose$.next(true);
      expect(productService.removeProduct).toHaveBeenCalledWith(7);
      expect(messageService.add).toHaveBeenCalled();
      expect(component.productDeletionEvent.emit).toHaveBeenCalledWith(7);
    });

    it('no debe eliminar si se cancela', () => {
      component.deleteProduct();
      onClose$.next(false);
      expect(productService.removeProduct).not.toHaveBeenCalled();
    });

    it('debe manejar error al eliminar', () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
      productService.removeProduct.mockReturnValue(
        throwError(() => new Error('fail')),
      );
      component.deleteProduct();
      onClose$.next(true);
      expect(component.attemptDelete).toBe(false);
    });

    it('no debe eliminar dos veces si attemptDelete está activo', () => {
      component.attemptDelete = true;
      component.deleteProduct();
      onClose$.next(true);
      expect(productService.removeProduct).not.toHaveBeenCalled();
    });
  });

  describe('menú contextual', () => {
    it('debe tener 4 acciones en items', () => {
      expect(component.items).toHaveLength(4);
    });

    it('debe abrir vista pública con viewProduct', () => {
      const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
      component.items![0].command?.({} as import('primeng/api').MenuItemCommandEvent);
      expect(openSpy).toHaveBeenCalledWith(
        '/mi-tienda/cat-1/7',
        '_blank',
      );
      openSpy.mockRestore();
    });

    it('debe navegar a inventario', () => {
      component.items![1].command?.({} as import('primeng/api').MenuItemCommandEvent);
      expect(utilsService.navigate).toHaveBeenCalledWith([component.inventoryUrl]);
    });

    it('debe navegar a editar', () => {
      component.items![2].command?.({} as import('primeng/api').MenuItemCommandEvent);
      expect(utilsService.navigate).toHaveBeenCalledWith([component.editUrl]);
    });

    it('debe abrir confirmación al eliminar desde menú', () => {
      component.items![3].command?.({} as import('primeng/api').MenuItemCommandEvent);
      expect(dialogService.open).toHaveBeenCalled();
    });
  });
});
