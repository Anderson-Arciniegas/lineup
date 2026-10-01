import { gql } from 'apollo-angular';
import { cartSelection } from '../selections/cart.selection';

export const GET_USER_CARTS_QUERY = gql`
  query GetUserCarts {
    getUserCarts ${cartSelection}
  }
`;

export const GET_CART_BY_BUSINESS_QUERY = gql`
  query GetCartByBusiness($data: GetCartByBusinessInput!) {
    getCartByBusiness(data: $data) ${cartSelection}
  }
`;
