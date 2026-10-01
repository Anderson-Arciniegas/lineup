import { businessBasicSelection } from './businesses.selection';
import { currencySelection } from './currency.selection';
import { fileSelection } from './file.selection';

/** Producto embebido en ítems de carrito (sin ciclos profundos). */
const cartProductSelection = `{
  id
  idCatalog
  idCreationBusiness
  title
  subtitle
  hasVariations
  price
  status
  productFiles {
    id
    idProduct
    imageCode
    order
    status
    file ${fileSelection}
  }
}`;

/** SKU embebido en ítems de carrito. */
const cartProductSkuSelection = `{
  id
  idProduct
  price
  idCurrency
  currency ${currencySelection}
  quantity
  skuCode
  status
  variationOptions
}`;

/** Ítem de carrito con producto y SKU. */
export const cartItemSelection = `{
  id
  idCart
  idProduct
  idProductSku
  quantity
  unitPrice
  subtotal
  variationOptions
  product ${cartProductSelection}
  productSku ${cartProductSkuSelection}
}`;

/** Carrito completo con negocio e ítems. */
export const cartSelection = `{
  id
  idCreationUser
  idBusiness
  total
  itemsCount
  lastActivityDate
  business ${businessBasicSelection}
  items ${cartItemSelection}
}`;
