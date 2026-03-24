import { businessBasicSelection } from './businesses.selection';
import { catalogSelection } from './catalog.selection';
import { currencySelection } from './currency.selection';
import { productBasicSelection } from './product.selection';

/**
 * DiscountSchema sin discountProducts (evita recursión al anidar en DiscountProductSchema.discount)
 */
export const discountWithoutDiscountProductsSelection = `{
  business ${businessBasicSelection}
  catalog ${catalogSelection}
  creationDate
  currency ${currencySelection}
  discountType
  endDate
  id
  idCatalog
  idCreationBusiness
  idCurrency
  modificationBusiness ${businessBasicSelection}
  modificationDate
  scope
  startDate
  status
  value
}`;

/**
 * Selección para DiscountProductSchema
 */
export const discountProductRelationSelection = `{
  creationBusiness ${businessBasicSelection}
  creationDate
  discount ${discountWithoutDiscountProductsSelection}
  id
  idCreationBusiness
  idDiscount
  idProduct
  modificationDate
  product ${productBasicSelection}
}`;

/**
 * Selección para DiscountSchema
 */
export const discountSelection = `{
  business ${businessBasicSelection}
  catalog ${catalogSelection}
  creationDate
  currency ${currencySelection}
  discountProducts ${discountProductRelationSelection}
  discountType
  endDate
  id
  idCatalog
  idCreationBusiness
  idCurrency
  modificationBusiness ${businessBasicSelection}
  modificationDate
  scope
  startDate
  status
  value
}`;

/**
 * Selección para DiscountProductAuditSchema
 */
export const discountProductAuditSelection = `{
  id
  idCreationBusiness
  idProduct
  idDiscountNew
  idDiscountOld
  creationDate
  operation
  creationBusiness ${businessBasicSelection}
  product ${productBasicSelection}
}`;
