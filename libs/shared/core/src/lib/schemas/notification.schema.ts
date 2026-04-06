import type { NotificationTypeEnum } from '../enums';
import type { BusinessSchema } from './business.schema';
import type { UserSchema } from './user.schema';

/** GraphQL NotificationSchema */
export interface NotificationSchema {
  body: string;
  creationBusiness?: BusinessSchema;
  creationDate: string;
  creationUser?: UserSchema;
  id: number;
  idCreationBusiness?: number | null;
  /** Opcional: no siempre se pide en la query GraphQL. */
  idCreationUser?: number;
  payload?: Record<string, unknown> | null;
  readAt?: string | null;
  title: string;
  type: NotificationTypeEnum;
  __typename?: 'NotificationSchema';
}
