import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';
import { createApolloMock } from '../../../testing';
import { CartPrivateService } from './cart-private.service';

describe('CartPrivateService', () => {
  let service: CartPrivateService;
  let querySpy: jest.Mock;
  let mutateSpy: jest.Mock;

  const cart = {
    id: 1,
    idBusiness: 10,
    idCreationUser: 5,
    total: 20,
    itemsCount: 2,
    items: [] as unknown[],
  };

  beforeEach(() => {
    const apollo = createApolloMock({
      query: () =>
        of({
          data: {
            getUserCarts: [cart],
            getCartByBusiness: cart,
          } as Record<string, unknown>,
        }),
      mutate: () =>
        of({
          data: {
            addItemToCart: cart,
            updateCartItem: cart,
            removeCartItem: cart,
            clearCart: cart,
          } as Record<string, unknown>,
        }),
    });
    querySpy = apollo.querySpy;
    mutateSpy = apollo.mutateSpy;
    TestBed.configureTestingModule({
      providers: [
        CartPrivateService,
        { provide: Apollo, useValue: apollo.mock },
      ],
    });
    service = TestBed.inject(CartPrivateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getUserCarts calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.getUserCarts());
    expect(result).toEqual([cart]);
    expect(querySpy).toHaveBeenCalled();
  });

  it('getCartByBusiness calls Apollo and returns data', async () => {
    const result = await firstValueFrom(
      service.getCartByBusiness({ businessId: 10 }),
    );
    expect(result).toEqual(cart);
    expect(querySpy).toHaveBeenCalled();
  });

  it('addItem calls Apollo and returns data', async () => {
    const result = await firstValueFrom(
      service.addItem({
        businessId: 10,
        productId: 1,
        quantity: 1,
        productSkuId: 100,
      }),
    );
    expect(result).toEqual(cart);
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('updateItem calls Apollo and returns data', async () => {
    const result = await firstValueFrom(
      service.updateItem({ cartItemId: 1, quantity: 3 }),
    );
    expect(result).toEqual(cart);
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('removeItem calls Apollo and returns data', async () => {
    const result = await firstValueFrom(
      service.removeItem({ cartItemId: 1 }),
    );
    expect(result).toEqual(cart);
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('clearCart calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.clearCart(10));
    expect(result).toEqual(cart);
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('addItem throws when mutation has no data', async () => {
    mutateSpy.mockReturnValueOnce(of({ data: null }));
    await expect(
      firstValueFrom(
        service.addItem({
          businessId: 10,
          productId: 1,
          quantity: 1,
        }),
      ),
    ).rejects.toThrow('No data returned from mutation');
  });
});
