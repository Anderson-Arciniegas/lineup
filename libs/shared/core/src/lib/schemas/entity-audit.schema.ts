import type { BusinessSchema } from './business.schema';
import type { AuditOperationEnum } from '../enums';

/** GraphQL EntityAuditSchema */
export interface EntityAuditSchema {
  creationBusiness?: BusinessSchema;
  creationDate?: string;
  entityId?: number;
  entityType?: string;
  id: number;
  idCreationBusiness?: number;
  operation?: AuditOperationEnum;
  __typename?: 'EntityAuditSchema';
}
