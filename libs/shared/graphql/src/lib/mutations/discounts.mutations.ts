import { gql } from 'apollo-angular';
import { discountSelection } from '../selections/discount.selection';

export const CREATE_DISCOUNT_MUTATION = gql`
  mutation CreateDiscount($data: CreateDiscountInput!) {
    createDiscount(data: $data) ${discountSelection}
  }
`;

export const REMOVE_DISCOUNT_MUTATION = gql`
  mutation RemoveDiscount($id: Int!) {
    removeDiscount(id: $id)
  }
`;

export const UPDATE_DISCOUNT_MUTATION = gql`
  mutation UpdateDiscount($data: UpdateDiscountInput!) {
    updateDiscount(data: $data) ${discountSelection}
  }
`;
