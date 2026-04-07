import type { NotificationTypeEnum } from '../enums';
import type { BusinessSchema } from './business.schema';
import type { NotificationPayloadSchema } from './notification-payload.schema';
import type { UserSchema } from './user.schema';

/** GraphQL NotificationSchema */
export interface NotificationSchema {
  body: string;
  business?: BusinessSchema | null;
  creationDate: string;
  id: number;
  idCreationBusiness?: number | null;
  idCreationUser: number;
  payload?: NotificationPayloadSchema | null;
  readAt?: string | null;
  title: string;
  type: NotificationTypeEnum;
  user?: UserSchema | null;
  __typename?: 'NotificationSchema';
}
