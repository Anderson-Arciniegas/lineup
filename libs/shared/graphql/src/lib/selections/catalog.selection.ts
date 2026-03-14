import { businessBasicSelection } from './businesses.selection';
import { fileSelection } from './file.selection';

export const catalogSelection = `{
  id
  idCreationBusiness
  title
  imageCode
  status
  tags
  business ${businessBasicSelection}
  image ${fileSelection}
  modificationBusiness ${businessBasicSelection}
  path
  productsCount
  products {
    id
    title
    subtitle
    description
    price
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
  /\n  tags\n  business/,
  '\n  catalogTags: tags\n  business',
);
