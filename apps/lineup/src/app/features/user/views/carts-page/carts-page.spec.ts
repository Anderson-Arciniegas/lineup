import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  CartStore,
  SocialNetworkPrivateService,
  ToastService,
  UtilsService,
} from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { CartsPage } from './carts-page';

describe('CartsPage', () => {
  let component: CartsPage;
  let fixture: ComponentFixture<CartsPage>;
  let cartStore: {
    loadCarts: jest.Mock;
    updateItem: jest.Mock;
    removeItem: jest.Mock;
    clearCart: jest.Mock;
    loading: jest.Mock;
    mutating: jest.Mock;
    nonEmptyCarts: jest.Mock;
  };
  let dialogService: { open: jest.Mock };
  let socialMediaService: { findByBusiness: jest.Mock };
  let utils: { formatWhatsappPhone: jest.Mock };
  let toast: { warn: jest.Mock; error: jest.Mock };

  const cart = {
    id: 1,
    idBusiness: 10,
    idCreationUser: 2,
    total: 30,
    itemsCount: 1,
    business: { id: 10, name: 'Tienda', path: 'tienda' },
    items: [
      {
        id: 5,
        idCart: 1,
        idProduct: 1,
        quantity: 2,
        unitPrice: 15,
        subtotal: 30,
        product: { id: 1, title: 'Producto' },
      },
    ],
  };

  beforeEach(async () => {
    cartStore = {
      loadCarts: jest.fn(),
      updateItem: jest.fn(),
      removeItem: jest.fn(),
      clearCart: jest.fn(),
      loading: jest.fn(() => false),
      mutating: jest.fn(() => false),
      nonEmptyCarts: jest.fn(() => [cart]),
    };
    dialogService = {
      open: jest.fn(() => ({
        onClose: of(true),
        close: jest.fn(),
      })),
    };
    socialMediaService = {
      findByBusiness: jest.fn(() => of([{ phone: '584121111111' }])),
    };
    utils = {
      formatWhatsappPhone: jest.fn(
        (phone, text) =>
          `https://api.whatsapp.com/send?phone=${phone}&text=${text}`,
      ),
    };
    toast = { warn: jest.fn(), error: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [CartsPage, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        TranslateService,
        TranslateStore,
        { provide: CartStore, useValue: cartStore },
        { provide: DialogService, useValue: dialogService },
        { provide: SocialNetworkPrivateService, useValue: socialMediaService },
        { provide: UtilsService, useValue: utils },
        { provide: ToastService, useValue: toast },
      ],
    })
      .overrideComponent(CartsPage, {
        set: {
          template: '',
          providers: [{ provide: DialogService, useValue: dialogService }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CartsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe cargar carritos al iniciar', () => {
    expect(cartStore.loadCarts).toHaveBeenCalled();
  });

  it('increaseQty y decreaseQty delegan en el store', () => {
    component.increaseQty(5, 2);
    expect(cartStore.updateItem).toHaveBeenCalledWith({
      cartItemId: 5,
      quantity: 3,
    });
    component.decreaseQty(5, 2);
    expect(cartStore.updateItem).toHaveBeenCalledWith({
      cartItemId: 5,
      quantity: 1,
    });
    component.decreaseQty(5, 1);
    expect(cartStore.removeItem).toHaveBeenCalledWith({ cartItemId: 5 });
  });

  it('confirmClearCart elimina tras confirmación', () => {
    component.confirmClearCart(cart as never);
    expect(dialogService.open).toHaveBeenCalled();
    expect(cartStore.clearCart).toHaveBeenCalledWith(10);
  });

  it('checkoutViaWhatsapp abre WhatsApp con el listado', () => {
    const openSpy = jest
      .spyOn(globalThis, 'open')
      .mockImplementation(() => null);
    component.checkoutViaWhatsapp(cart as never);
    expect(socialMediaService.findByBusiness).toHaveBeenCalledWith(10);
    expect(utils.formatWhatsappPhone).toHaveBeenCalled();
    expect(openSpy).toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('businessPath resuelve la ruta pública del negocio', () => {
    expect(component.businessPath(cart as never)).toBe('/tienda');
    expect(
      component.businessPath({
        ...cart,
        business: { id: 10, name: 'X', path: '  ' },
      } as never),
    ).toBeNull();
  });
});
