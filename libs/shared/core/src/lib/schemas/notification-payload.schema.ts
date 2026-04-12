/** GraphQL NotificationPayloadSchema (JSON scalar en `data`) */
export interface NotificationPayloadSchema {
  catalogPath?: string | null;
  data?: unknown | null;
  entity?: string | null;
  id?: number | null;
  idBusiness?: number | null;
  idUser?: number | null;
  link?: string | null;
  productTitle?: string | null;
  scenario?: string | null;
  __typename?: 'NotificationPayloadSchema';
}
