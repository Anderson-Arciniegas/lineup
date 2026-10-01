import { inject, Injectable } from '@angular/core';
import {
  ADD_ITEM_TO_CART_MUTATION,
  CLEAR_CART_MUTATION,
  GET_CART_BY_BUSINESS_QUERY,
  GET_USER_CARTS_QUERY,
  REMOVE_CART_ITEM_MUTATION,
  UPDATE_CART_ITEM_MUTATION,
} from '@libs/graphql';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type {
  AddToCartInput,
  GetCartByBusinessInput,
  RemoveCartItemInput,
  UpdateCartItemInput,
} from '../../models';
import type { CartSchema } from '../../schemas';
import { ApiClient } from '../graphql.service';

@Injectable({
  providedIn: 'root',
})
export class CartPrivateService {
  private readonly apollo = inject(Apollo);

  getUserCarts(): Observable<CartSchema[]> {
    return this.apollo
      .use(ApiClient.USER)
      .query<{ getUserCarts: CartSchema[] }>({
        query: GET_USER_CARTS_QUERY,
        fetchPolicy: 'network-only',
        context: { withCredentials: true },
      })
      .pipe(map((result) => result.data.getUserCarts ?? []));
  }

  getCartByBusiness(data: GetCartByBusinessInput): Observable<CartSchema | null> {
    return this.apollo
      .use(ApiClient.USER)
      .query<{ getCartByBusiness: CartSchema | null }>({
        query: GET_CART_BY_BUSINESS_QUERY,
        variables: { data },
        fetchPolicy: 'network-only',
        context: { withCredentials: true },
      })
      .pipe(map((result) => result.data.getCartByBusiness ?? null));
  }

  addItem(data: AddToCartInput): Observable<CartSchema> {
    return this.apollo
      .use(ApiClient.USER)
      .mutate<{ addItemToCart: CartSchema }>({
        mutation: ADD_ITEM_TO_CART_MUTATION,
        variables: { data },
        context: { withCredentials: true },
      })
      .pipe(
        map((result) => {
          if (!result.data?.addItemToCart) {
            throw new Error('No data returned from mutation');
          }
          return result.data.addItemToCart;
        }),
      );
  }

  updateItem(data: UpdateCartItemInput): Observable<CartSchema> {
    return this.apollo
      .use(ApiClient.USER)
      .mutate<{ updateCartItem: CartSchema }>({
        mutation: UPDATE_CART_ITEM_MUTATION,
        variables: { data },
        context: { withCredentials: true },
      })
      .pipe(
        map((result) => {
          if (!result.data?.updateCartItem) {
            throw new Error('No data returned from mutation');
          }
          return result.data.updateCartItem;
        }),
      );
  }

  removeItem(data: RemoveCartItemInput): Observable<CartSchema> {
    return this.apollo
      .use(ApiClient.USER)
      .mutate<{ removeCartItem: CartSchema }>({
        mutation: REMOVE_CART_ITEM_MUTATION,
        variables: { data },
        context: { withCredentials: true },
      })
      .pipe(
        map((result) => {
          if (!result.data?.removeCartItem) {
            throw new Error('No data returned from mutation');
          }
          return result.data.removeCartItem;
        }),
      );
  }

  clearCart(businessId: number): Observable<CartSchema | null> {
    return this.apollo
      .use(ApiClient.USER)
      .mutate<{ clearCart: CartSchema | null }>({
        mutation: CLEAR_CART_MUTATION,
        variables: { businessId },
        context: { withCredentials: true },
      })
      .pipe(map((result) => result.data?.clearCart ?? null));
  }
}
