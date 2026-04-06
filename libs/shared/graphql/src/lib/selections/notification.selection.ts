/**
 * Solo campos que el API resuelve sin relaciones. Pedir `idCreationBusiness` / `creationUser`
 * u objetos anidados puede hacer que el servidor intente la relación `creationBusiness` y falle.
 */
export const notificationSelection = `{
  id
  body
  creationDate
  payload
  readAt
  title
  type
}`;
