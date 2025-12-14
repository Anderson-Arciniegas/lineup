import { RolesCodesEnum } from '../enums';
import { BusinessSchema } from '../schemas';

export interface CreateBusinessInput {
  email: string;
  name: string;
  password: string;
  role: RolesCodesEnum;
}

export interface CreateBusinessResponse {
  // The server returns a LoginResponse-like object for createUser
  createBusiness: {
    code?: string;
    status?: string;
    business: BusinessSchema;
  };
}
