import { businessBasicSelection } from './businesses.selection';
import { currencySelection } from './currency.selection';
import { fileSelection } from './file.selection';

export const catalogSelection = `{
  id
  idCreationBusiness
  title
  hexColor
  imageCode
  status
  tags
  business ${businessBasicSelection}
  image ${fileSelection}
  modificationBusiness ${businessBasicSelection}
  path
  productsCount
  visits
   discounts {
    id
    idCatalog
    idCreationBusiness
    idCurrency
    creationDate
    modificationDate
    startDate
    endDate
    status
    scope
    value
    discountType
    currency ${currencySelection}
  }
  products {
    id
    title
    subtitle
    description
    likes
    productTags {
      idProduct
      idTag
      product { id }
      tag { id name }
    }
    status
    idCatalog
    idCreationBusiness
  }
}`;

/**
 * Selección de catálogo para búsqueda (alias en tags para evitar conflicto de tipos en union)
 */
export const catalogSearchSelection = catalogSelection.replace(
  /\n {2}tags\n {2}business/,
  '\n  catalogTags: tags\n  business',
);
