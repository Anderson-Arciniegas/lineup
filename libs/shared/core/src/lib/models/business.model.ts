import { RolesCodesEnum } from '../enums';
import { BusinessSchema } from '../schemas';

export interface CreateBusinessInput {
  email: string;
  name: string;
  password: string;
  role: RolesCodesEnum;
}

export interface UpdateBusinessInput {
  id: number;
  description?: string;
  email?: string;
  imageCode?: string;
  name?: string;
  path?: string;
  tags?: string[];
  telephone?: string;
}

export interface CreateBusinessResponse {
  // The server returns a LoginResponse-like object for createUser
  createBusiness: {
    code?: string;
    status?: string;
    business: BusinessSchema;
  };
}
