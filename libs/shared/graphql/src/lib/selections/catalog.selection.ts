import { businessBasicSelection } from './businesses.selection';
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
