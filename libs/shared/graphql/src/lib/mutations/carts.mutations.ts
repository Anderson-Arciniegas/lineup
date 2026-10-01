import { gql } from 'apollo-angular';
import { cartSelection } from '../selections/cart.selection';

export const ADD_ITEM_TO_CART_MUTATION = gql`
  mutation AddItemToCart($data: AddToCartInput!) {
    addItemToCart(data: $data) ${cartSelection}
  }
`;

export const UPDATE_CART_ITEM_MUTATION = gql`
  mutation UpdateCartItem($data: UpdateCartItemInput!) {
    updateCartItem(data: $data) ${cartSelection}
  }
`;

export const REMOVE_CART_ITEM_MUTATION = gql`
  mutation RemoveCartItem($data: RemoveCartItemInput!) {
    removeCartItem(data: $data) ${cartSelection}
  }
`;

export const CLEAR_CART_MUTATION = gql`
  mutation ClearCart($businessId: Int!) {
    clearCart(businessId: $businessId) ${cartSelection}
  }
`;
