import { gql } from 'apollo-angular';
import {
  discountProductAuditSelection,
  discountSelection,
} from '../selections/discount.selection';

export const FIND_ACTIVE_DISCOUNT_BY_PRODUCT_QUERY = gql`
  query FindActiveDiscountByProduct($idProduct: Int!) {
    findActiveDiscountByProduct(idProduct: $idProduct) ${discountSelection}
  }
`;

export const FIND_ALL_MY_DISCOUNTS_BY_SCOPE_QUERY = gql`
  query FindAllMyDiscountsByScope($data: FindDiscountsByScopeInput!, $pagination: InfinityScrollInput!) {
    findAllMyDiscountsByScope(data: $data, pagination: $pagination) {
      items ${discountSelection}
      limit
      page
      total
    }
  }
`;

export const FIND_DISCOUNT_AUDIT_BY_DISCOUNT_QUERY = gql`
  query FindDiscountAuditByDiscount($idDiscount: Int!, $limit: Int) {
    findDiscountAuditByDiscount(idDiscount: $idDiscount, limit: $limit) ${discountProductAuditSelection}
  }
`;

export const FIND_DISCOUNT_AUDIT_BY_PRODUCT_QUERY = gql`
  query FindDiscountAuditByProduct($idProduct: Int!, $limit: Int) {
    findDiscountAuditByProduct(idProduct: $idProduct, limit: $limit) ${discountProductAuditSelection}
  }
`;

export const FIND_ONE_DISCOUNT_QUERY = gql`
  query FindOneDiscount($id: Int!) {
    findOneDiscount(id: $id) ${discountSelection}
  }
`;
