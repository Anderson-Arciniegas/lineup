import type { BusinessSchema } from './business.schema';
import type { UserSchema } from './user.schema';

/** GraphQL BusinessVisitSchema */
export interface BusinessVisitSchema {
  business?: BusinessSchema;
  creationUser?: UserSchema;
  id: number;
  idBusiness: number;
  idCreationUser?: number;
  __typename?: 'BusinessVisitSchema';
}
