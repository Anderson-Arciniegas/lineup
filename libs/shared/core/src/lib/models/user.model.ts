import { ProvidersEnum, RolesCodesEnum, VisitTypeEnum } from '../enums';
import type {
  BusinessSchema,
  CatalogSchema,
  ProductRatingSchema,
  ProductSchema,
  UserSchema,
} from '../schemas';

export interface RecordVisitInput {
  id: number;
  type: VisitTypeEnum;
}

export interface CreateUserInput {
  email: string;
  emailValidated?: boolean;
  firstName: string;
  lastName: string;
  username?: string;
  provider?: ProvidersEnum;
  password: string;
  role: RolesCodesEnum;
}

export interface CreateUserResponse {
  // The server returns a LoginResponse-like object for createUser
  createUser: {
    code?: string;
    status?: string;
    user: UserSchema;
  };
}

export interface UpdateUserInput {
  firstName?: string;
  idState?: number;
  imageCode?: string;
  lastName?: string;
  username?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface RateProductInput {
  idProduct: number;
  stars: number;
  comment?: string;
}

export interface RegisterGoogleInput {
  token: string;
  role: RolesCodesEnum;
}

export interface LoginGoogleInput {
  token: string;
}

export interface LoginResponse {
  code: number;
  message: string;
  status: boolean;
  user?: UserSchema;
  business?: BusinessSchema;
}

export interface PaginatedProductRatings {
  items: ProductRatingSchema[];
  limit: number;
  page: number;
  total: number;
}

export type SearchResultItem = BusinessSchema | CatalogSchema | ProductSchema;

export interface PaginatedSearchResults {
  items: SearchResultItem[];
  limit: number;
  page: number;
  total: number;
}
