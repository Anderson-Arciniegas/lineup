import { gql } from 'apollo-angular';
import { productSelection } from '../selections/product.selection';

export const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct($data: CreateProductInput!) {
    createProduct(data: $data) ${productSelection}
  }
`;

export const UPDATE_PRODUCT_MUTATION = gql`
  mutation UpdateProduct($data: UpdateProductInput!) {
    updateProduct(data: $data) ${productSelection}
  }
`;

export const REMOVE_PRODUCT_MUTATION = gql`
  mutation RemoveProduct($id: Float!) {
    removeProduct(id: $id) ${productSelection}
  }
`;
