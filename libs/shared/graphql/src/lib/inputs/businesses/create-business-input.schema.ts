import type { RolesCodesEnum } from '../../../../../core/src/lib/enums';

export interface CreateBusinessInput {
  email: string;
  name: string;
  password: string;
  role: RolesCodesEnum;
  [key: string]: unknown;
}
