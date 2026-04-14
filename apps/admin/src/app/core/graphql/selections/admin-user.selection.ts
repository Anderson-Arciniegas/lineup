/**
 * Reutiliza selecciones del paquete compartido (mismo shape que `UserSchema` en el API admin).
 */
export {
  loginResponseSelection as adminLoginResponseSelection,
  userBasicSelection as adminUserListItemSelection,
  userFullSelection as adminUserFullSelection,
} from '@libs/graphql';
