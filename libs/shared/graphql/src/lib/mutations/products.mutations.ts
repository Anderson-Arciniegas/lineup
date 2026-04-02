import { gql } from 'apollo-angular';
import {
  productSelection,
  productSkuSelection,
} from '../selections/product.selection';

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
  mutation RemoveProduct($id: Int!) {
    removeProduct(id: $id)
  }
`;

export const ADJUST_STOCK_MUTATION = gql`
  mutation AdjustStock($data: AdjustStockInput!) {
    adjustStock(data: $data) ${productSkuSelection}
  }
`;

export const REGISTER_SALE_MUTATION = gql`
  mutation RegisterSale($data: [RegisterPurchaseInput!]!) {
    registerSale(data: $data) ${productSkuSelection}
  }
`;

export const UPDATE_PRODUCT_SKUS_MUTATION = gql`
  mutation UpdateProductSkus($data: UpdateProductSkusInput!) {
    updateProductSkus(data: $data) ${productSkuSelection}
  }
`;

export const TOGGLE_PRODUCT_IS_PRIMARY_MUTATION = gql`
  mutation ToggleProductIsPrimary($idProduct: Int!) {
    toggleProductIsPrimary(idProduct: $idProduct) ${productSelection}
  }
`;
