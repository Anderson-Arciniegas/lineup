import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import type {
  AddToCartInput,
  RemoveCartItemInput,
  UpdateCartItemInput,
} from '../../models';
import type { CartSchema } from '../../schemas';
import { CartPrivateService } from '../../services/private/cart-private.service';

interface CartState {
  carts: CartSchema[];
  drawerOpen: boolean;
  loading: boolean;
  mutating: boolean;
}

const initialState: CartState = {
  carts: [],
  drawerOpen: false,
  loading: false,
  mutating: false,
};

function upsertCart(carts: CartSchema[], cart: CartSchema): CartSchema[] {
  const idx = carts.findIndex((c) => c.id === cart.id);
  if (idx < 0) {
    return [cart, ...carts];
  }
  return carts.map((c, i) => (i === idx ? cart : c));
}

function activeCartsOnly(carts: CartSchema[]): CartSchema[] {
  return carts.filter((c) => (c.itemsCount ?? 0) > 0);
}

function applyCartResult(
  store: {
    carts: () => CartSchema[];
  },
  cart: CartSchema,
): Partial<CartState> {
  if ((cart.itemsCount ?? 0) <= 0) {
    return { carts: store.carts().filter((c) => c.id !== cart.id) };
  }
  return { carts: upsertCart(store.carts(), cart) };
}

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ carts }) => ({
    nonEmptyCarts: computed(() => activeCartsOnly(carts())),
    totalItemsCount: computed(() =>
      activeCartsOnly(carts()).reduce(
        (sum, cart) => sum + (cart.itemsCount ?? 0),
        0,
      ),
    ),
  })),
  withMethods((store, cartService = inject(CartPrivateService)) => ({
    openDrawer(): void {
      patchState(store, { drawerOpen: true });
    },
    closeDrawer(): void {
      patchState(store, { drawerOpen: false });
    },
    setDrawerOpen(open: boolean): void {
      patchState(store, { drawerOpen: open });
    },
    replaceCarts(carts: CartSchema[]): void {
      patchState(store, { carts: activeCartsOnly(carts) });
    },
    patchCart(cart: CartSchema | null): void {
      if (!cart) return;
      patchState(store, applyCartResult(store, cart));
    },
    removeCartByBusiness(businessId: number): void {
      patchState(store, {
        carts: store.carts().filter((c) => c.idBusiness !== businessId),
      });
    },
    loadCarts: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          cartService.getUserCarts().pipe(
            tap((carts) =>
              patchState(store, {
                carts: activeCartsOnly(carts),
                loading: false,
              }),
            ),
            catchError(() => {
              patchState(store, { loading: false });
              return of([]);
            }),
          ),
        ),
      ),
    ),
    addItem: rxMethod<AddToCartInput>(
      pipe(
        tap(() => patchState(store, { mutating: true })),
        switchMap((data) =>
          cartService.addItem(data).pipe(
            tap((cart) => {
              patchState(store, {
                ...applyCartResult(store, cart),
                mutating: false,
                drawerOpen: true,
              });
            }),
            catchError(() => {
              patchState(store, { mutating: false });
              return of(null);
            }),
          ),
        ),
      ),
    ),
    updateItem: rxMethod<UpdateCartItemInput>(
      pipe(
        tap(() => patchState(store, { mutating: true })),
        switchMap((data) =>
          cartService.updateItem(data).pipe(
            tap((cart) => {
              patchState(store, {
                ...applyCartResult(store, cart),
                mutating: false,
              });
            }),
            catchError(() => {
              patchState(store, { mutating: false });
              return of(null);
            }),
          ),
        ),
      ),
    ),
    removeItem: rxMethod<RemoveCartItemInput>(
      pipe(
        tap(() => patchState(store, { mutating: true })),
        switchMap((data) =>
          cartService.removeItem(data).pipe(
            tap((cart) => {
              patchState(store, {
                ...applyCartResult(store, cart),
                mutating: false,
              });
            }),
            catchError(() => {
              patchState(store, { mutating: false });
              return of(null);
            }),
          ),
        ),
      ),
    ),
    clearCart: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { mutating: true })),
        switchMap((businessId) =>
          cartService.clearCart(businessId).pipe(
            tap(() => {
              patchState(store, {
                carts: store
                  .carts()
                  .filter((c) => c.idBusiness !== businessId),
                mutating: false,
              });
            }),
            catchError(() => {
              patchState(store, { mutating: false });
              return of(null);
            }),
          ),
        ),
      ),
    ),
  })),
);
