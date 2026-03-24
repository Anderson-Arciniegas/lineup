/**
 * Selecciones reutilizables de campos GraphQL para businesses
 * Estas selecciones pueden ser usadas en queries y mutations para evitar duplicación
 */

import { fileSelection } from './file.selection';
import { locationFullSelection } from './location.selection';
import { userBasicSelection } from './users.selection';

/**
 * Selección básica de roles de business
 */
export const businessRoleSelection = `{
  idRole
  idCreationBusiness
  role {
    id
    code
    description
  }
}`;

/**
 * Selección básica de business (sin campos de auditoría completos)
 * Útil para respuestas de login y operaciones simples
 */
export const businessBasicSelection = `{
  id
  email
  name
  path
  status
  businessRoles ${businessRoleSelection}
  telephone
  image ${fileSelection}
  path
}`;

/**
 * Selección completa de business (con todos los campos)
 * Útil para operaciones que requieren información completa del business
 */
export const businessFullSelection = `{
  id
  email
  name
  path
  description
  emailValidated
  visits
  followers
  image {
    directory
    extension
    name
    url
    idCreationUser
    creationDate
    creationUser {
      id
      username
      email
      firstName
      lastName
      provider
      status
      emailValidated
    }
  }
  imageCode
  telephone
  isOnline
  provider
  status
  tags
  locations ${locationFullSelection}
  products {
    id
    title
    subtitle
    description
    likes
    skus { price }
    productTags {
      idProduct
      idTag
      product { id }
      tag { id name }
    }
    status
    idCatalog
    idCreationBusiness
    business {
      id
      name
      path
      description
      email
      emailValidated
      image { directory extension name url }
      imageCode
      telephone
      provider
      status
      tags
    }
    catalog { id title }
  }
  catalogs {
    id
    idCreationBusiness
    title
    status
    products {
      id
      title
      subtitle
      description
      likes
      skus { price }
      productTags {
        idProduct
        idTag
        product { id }
        tag { id name }
      }
      status
      idCatalog
      idCreationBusiness
      business {
        id
        name
        path
        description
        email
        emailValidated
        image { directory extension name url }
        imageCode
        telephone
        provider
        status
        tags
      }
      catalog { id title }
    }
    modificationBusiness {
      id
      name
      path
      description
      email
      emailValidated
      image { directory extension name url }
      imageCode
      telephone
      provider
      status
      tags
    }
  }
  businessRoles {
    business {
      id
      name
      path
      description
      email
      emailValidated
      image { directory extension name url idCreationUser }
      imageCode
      telephone
      provider
      status
      tags
    }
    creationCoordinate { latitude longitude }
    creationDate
    creationIp
    idCreationBusiness
    idRole
    modificationCoordinate { latitude longitude }
    modificationDate
    modificationIp
    role {
      id
      code
      description
      idCreationUser
      status
      rolePermissions {
        idCreationUser
        idPermission
        idRole
        permission { id code description }
        creationUser {
          id
          username
          email
          firstName
          lastName
          provider
          status
          emailValidated
        }
        modificationUser {
          id
          username
          email
          firstName
          lastName
          provider
          status
          emailValidated
        }
      }
    }
    status
  }
}`;

/**
 * Selección de business para búsqueda (alias en description/tags para evitar conflicto de tipos en union)
 */
const twoSpaces = '  ';
export const businessSearchSelection = businessFullSelection
  .replace(
    new RegExp(`\\n${twoSpaces}description\\n${twoSpaces}emailValidated`),
    `\n  businessDescription: description\n  emailValidated`,
  )
  .replace(
    new RegExp(`\\n${twoSpaces}tags\\n${twoSpaces}locations`),
    `\n  businessTags: tags\n  locations`,
  );

/**
 * Selección de respuesta de login/refresh token para business
 * Incluye la estructura de respuesta con code, status y business
 */
export const businessLoginResponseSelection = `{
  code
  status
  business ${businessBasicSelection}
}`;

/**
 * Selección de respuesta LoginResponse para loginWithGoogle/registerWithGoogle (business API)
 * Incluye code, message, status, business y user
 */
export const businessLoginResponseWithUserSelection = `{
  code
  message
  status
  business ${businessBasicSelection}
  user ${userBasicSelection}
}`;

/**
 * Selección simplificada de business para myBusiness query
 */
export const businessMyBusinessSelection = `{
  id
  name
  email 
  path
  status
  businessRoles {
    idRole
    role {
      id
      code
      description
    }
  }
  description
  tags
  telephone
  isOnline
  image ${fileSelection}
}`;

/**
 * Selección para BusinessFollowerSchema
 */
export const businessFollowerSelection = `{
  id
  idBusiness
  idCreationUser
  status
  business ${businessBasicSelection}
  creationUser ${userBasicSelection}
}`;
