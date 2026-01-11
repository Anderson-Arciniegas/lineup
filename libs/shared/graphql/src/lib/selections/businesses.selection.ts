/**
 * Selecciones reutilizables de campos GraphQL para businesses
 * Estas selecciones pueden ser usadas en queries y mutations para evitar duplicación
 */

import { fileSelection } from './file.selection';

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
  provider
  status
  tags
  locations {
    id
    address
    addressComponents
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
    idCreationBusiness
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
    status
  }
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
      price
      likes
      tags
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
 * Selección de respuesta de login/refresh token para business
 * Incluye la estructura de respuesta con code, status y business
 */
export const businessLoginResponseSelection = `{
  code
  status
  business ${businessBasicSelection}
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
  telephone
  image ${fileSelection}
}`;
