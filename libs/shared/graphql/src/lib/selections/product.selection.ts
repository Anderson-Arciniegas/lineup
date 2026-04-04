import { businessBasicSelection } from './businesses.selection';
import { catalogSelection } from './catalog.selection';
import { currencySelection } from './currency.selection';
import { fileSelection } from './file.selection';
import { userBasicSelection } from './users.selection';

/**
 * Selección para TagSchema
 */
export const tagSelection = `{
  id
  name
}`;

/**
 * TagSchema con negocio creador (p. ej. getMainTags)
 */
export const tagMainSelection = `{
  id
  idCreationBusiness
  name
  slug
  creationBusiness ${businessBasicSelection}
}`;

/**
 * Selección para ProductTagSchema
 */
export const productTagSelection = `{
  idProduct
  idTag
  product { id }
  tag ${tagSelection}
}`;

/**
 * Selección para ProductFileSchema
 */
export const productFileSelection = `{
  id
  idCreationBusiness
  idProduct
  imageCode
  order
  status
  business ${businessBasicSelection}
  file ${fileSelection}
  modificationBusiness ${businessBasicSelection}
}`;

/**
 * Selección para ProductVariationSchema
 */
export const productVariationSelection = `{
  id
  idCreationBusiness
  idProduct
  options
  status
  title
  business ${businessBasicSelection}
  modificationBusiness ${businessBasicSelection}
}`;

/**
 * Selección para ProductReactionSchema
 */
export const productReactionSelection = `{
  id
  idCreationUser
  idProduct
  status
  type
  creationUser ${userBasicSelection}
}`;

/**
 * Selección mínima de ProductSchema (sin listas anidadas) para usar dentro de ProductSku y evitar ciclos
 */
export const productBasicSelection = `{
  id
  idCatalog
  idCreationBusiness
  creationDate
  title
  subtitle
  description
  hasVariations
  isPrimary
  likes
  visits
  ratingAverage
  status
  price
  productFiles ${productFileSelection}
  business ${businessBasicSelection}
  catalog ${catalogSelection}
  modificationBusiness ${businessBasicSelection}
}`;

/**
 * Selección para DiscountProductSchema
 */
export const discountProductSelection = `{
  creationBusiness ${businessBasicSelection}
  creationDate
  discount {
    id
    idCatalog
    idCreationBusiness
    idCurrency
    creationDate
    modificationDate
    startDate
    endDate
    value
    discountType
    status
    currency ${currencySelection}
  }
  id
  idCreationBusiness
  idDiscount
  idProduct
  modificationDate
}`;

/**
 * Selección para ProductSearchIndexSchema
 */
export const productSearchIndexSelection = `{
  id
  idBusiness
  idCatalog
  idProduct
  likes
  locationsText
  price
  ratingAverage
  searchVector
  visits
  business ${businessBasicSelection}
  catalog ${catalogSelection}
  product ${productBasicSelection}
}`;

/**
 * Selección para ProductVisitSchema
 */
export const productVisitSelection = `{
  id
  idCreationUser
  idProduct
  creationUser ${userBasicSelection}
  product ${productBasicSelection}
}`;

/**
 * Selección para ProductSkuSchema
 */
export const productSkuSelection = `{
  id
  idCreationBusiness
  idProduct
  price
  idCurrency
  currency ${currencySelection}
  quantity
  skuCode
  status
  variationOptions
  business ${businessBasicSelection}
  modificationBusiness ${businessBasicSelection}
  product ${productBasicSelection}
}`;

/**
 * Selección para ProductRatingSchema
 */
export const productRatingSelection = `{
  id
  idCreationUser
  idProduct
  stars
  status
  comment
  creationUser ${userBasicSelection}
  product ${productBasicSelection}
}`;

/**
 * Selección para ProductSchema
 */
export const productSelection = `{
  id
  idCatalog
  idCreationBusiness
  creationDate
  title
  subtitle
  description
  hasVariations
  isPrimary
  likes
  visits
  ratingAverage
  price
  discountProduct ${discountProductSelection}
  productTags ${productTagSelection}
  status
  business ${businessBasicSelection}
  catalog ${catalogSelection}
  modificationBusiness ${businessBasicSelection}
  productFiles ${productFileSelection}
  productSearchIndexes ${productSearchIndexSelection}
  productVisits ${productVisitSelection}
  ratings ${productRatingSelection}
  reactions ${productReactionSelection}
  skus ${productSkuSelection}
  variations ${productVariationSelection}
}`;

/**
 * Selección para ProductCollectionSchema
 */
export const productCollectionSelection = `{
  id
  title
  products ${productSelection}
}`;

/**
 * Selección de producto para búsqueda (alias en description para evitar conflicto de tipos en union)
 */
export const productSearchSelection = productSelection.replace(
  /\n {2}description\n/,
  '\n  productDescription: description\n',
);

/**
 * Selección para StockMovementSchema
 */
export const stockMovementSelection = `{
  id
  idCreationBusiness
  idProductSku
  creationDate
  newQuantity
  notes
  previousQuantity
  price
  quantityDelta
  type
  business ${businessBasicSelection}
  productSku ${productSkuSelection}
}`;
