import { businessBasicSelection } from './businesses.selection';
import { catalogSelection } from './catalog.selection';
import { currencySelection } from './currency.selection';
import { fileSelection } from './file.selection';
import { userBasicSelection } from './users.selection';

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
 * Selección para ProductSchema
 */
export const productSelection = `{
  id
  idCatalog
  idCreationBusiness
  idCurrency
  title
  subtitle
  description
  price
  likes
  tags
  status
  business ${businessBasicSelection}
  catalog ${catalogSelection}
  currency ${currencySelection}
  modificationBusiness ${businessBasicSelection}
  productFiles ${productFileSelection}
  reactions ${productReactionSelection}
  variations ${productVariationSelection}
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
  product ${productSelection}
}`;

/**
 * Selección de producto para búsqueda (alias en description/tags para evitar conflicto de tipos en union)
 */
export const productSearchSelection = productSelection
  .replace(/\n  description\n  price/, '\n  productDescription: description\n  price')
  .replace(/\n  tags\n  status/, '\n  productTags: tags\n  status');
