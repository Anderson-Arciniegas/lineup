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
    tags
    status
    idCatalog
    idCreationBusiness
  }
}`;
