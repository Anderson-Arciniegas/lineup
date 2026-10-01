import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CartPrivateService } from '../../services/private/cart-private.service';
import { CartStore } from './cart.store';

describe('CartStore', () => {
  let store: InstanceType<typeof CartStore>;
  let cartService: {
    getUserCarts: jest.Mock;
    addItem: jest.Mock;
    updateItem: jest.Mock;
    removeItem: jest.Mock;
    clearCart: jest.Mock;
  };

  const cart = {
    id: 1,
    idBusiness: 10,
    idCreationUser: 5,
    total: 20,
    itemsCount: 2,
    items: [{ id: 1, quantity: 2 }],
  };

  beforeEach(() => {
    cartService = {
      getUserCarts: jest.fn(() => of([cart, { ...cart, id: 2, itemsCount: 0 }])),
      addItem: jest.fn(() => of(cart)),
      updateItem: jest.fn(() => of(cart)),
      removeItem: jest.fn(() => of({ ...cart, itemsCount: 0 })),
      clearCart: jest.fn(() => of(null)),
    };

    TestBed.configureTestingModule({
      providers: [
        CartStore,
        { provide: CartPrivateService, useValue: cartService },
      ],
    });
    store = TestBed.inject(CartStore);
  });

  it('openDrawer y closeDrawer actualizan drawerOpen', () => {
    store.openDrawer();
    expect(store.drawerOpen()).toBe(true);
    store.closeDrawer();
    expect(store.drawerOpen()).toBe(false);
  });

  it('loadCarts filtra carritos vacíos', () => {
    store.loadCarts();
    expect(cartService.getUserCarts).toHaveBeenCalled();
    expect(store.nonEmptyCarts().length).toBe(1);
    expect(store.nonEmptyCarts()[0].id).toBe(1);
  });

  it('addItem abre el drawer y actualiza carts', () => {
    store.addItem({
      businessId: 10,
      productId: 1,
      quantity: 1,
      productSkuId: 100,
    });
    expect(cartService.addItem).toHaveBeenCalled();
    expect(store.drawerOpen()).toBe(true);
    expect(store.carts().some((c) => c.id === 1)).toBe(true);
  });

  it('clearCart elimina el carrito del estado', () => {
    store.replaceCarts([cart as never]);
    store.clearCart(10);
    expect(cartService.clearCart).toHaveBeenCalledWith(10);
    expect(store.carts().length).toBe(0);
  });
});
