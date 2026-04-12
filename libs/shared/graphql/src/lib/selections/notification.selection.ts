import { businessBasicSelection } from './businesses.selection';
import { userBasicSelection } from './users.selection';

/** Campos de NotificationPayloadSchema */
export const notificationPayloadSelection = `{
  catalogPath
  data
  entity
  id
  idBusiness
  idUser
  link
  productTitle
  scenario
}`;

/** Selección alineada con NotificationSchema en el API */
export const notificationSelection = `{
  id
  body
  creationDate
  idCreationBusiness
  readAt
  title
  type
  payload ${notificationPayloadSelection}
  business ${businessBasicSelection}
  user ${userBasicSelection}
}`;
