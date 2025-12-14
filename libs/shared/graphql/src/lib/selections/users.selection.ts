/**
 * Selecciones reutilizables de campos GraphQL para usuarios
 * Estas selecciones pueden ser usadas en queries y mutations para evitar duplicación
 */

/**
 * Selección básica de roles de usuario
 */
export const userRoleSelection = `{
  idRole
  idUser
  idCreationUser
  status
  creationDate
  creationIp
  modificationDate
  modificationIp
  creationCoordinate {
    latitude
    longitude
  }
  modificationCoordinate {
    latitude
    longitude
  }
  role {
    id
    code
    description
    status
  }
}`;

/**
 * Selección básica de usuario (sin campos de auditoría completos)
 * Útil para respuestas de login y operaciones simples
 */
export const userBasicSelection = `{
  id
  email
  username
  firstName
  lastName
  provider
  status
  emailValidated
  creationDate
  creationIp
  userRoles ${userRoleSelection}
}`;

/**
 * Selección completa de usuario (con todos los campos de auditoría)
 * Útil para operaciones que requieren información completa del usuario
 */
export const userFullSelection = `{
  id
  email
  emailValidated
  firstName
  lastName
  username
  provider
  status
  creationDate
  creationIp
  modificationDate
  modificationIp
  creationCoordinate {
    latitude
    longitude
  }
  modificationCoordinate {
    latitude
    longitude
  }
  userRoles ${userRoleSelection}
}`;

/**
 * Selección de respuesta de login/refresh token
 * Incluye la estructura de respuesta con code, status y user
 */
export const loginResponseSelection = `{
  code
  status
  user ${userBasicSelection}
}`;
