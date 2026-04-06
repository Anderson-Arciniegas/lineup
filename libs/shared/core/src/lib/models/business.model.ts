import { RolesCodesEnum, WeekDayEnum } from '../enums';
import { BusinessSchema } from '../schemas';

export interface RegisterGoogleBusinessInput {
  token: string;
}

export interface CreateBusinessInput {
  email: string;
  emailValidated?: boolean;
  name: string;
  password: string;
  role: RolesCodesEnum;
}

export interface UpdateBusinessInput {
  id: number;
  description?: string;
  hexColor?: string;
  imageCode?: string;
  isBsEquivalentPriceEnabled?: boolean;
  isOnline?: boolean;
  name?: string;
  path?: string;
  tags?: string[];
  telephone?: string;
}

export interface UpdateBusinessEmailInput {
  email: string;
}

export interface CreateBusinessResponse {
  // The server returns a LoginResponse-like object for createUser
  createBusiness: {
    code?: string;
    status?: string;
    business: BusinessSchema;
  };
}

export interface PaginatedBusinesses {
  items: BusinessSchema[];
  limit: number;
  page: number;
  total: number;
}

export interface CreateBusinessHourItemInput {
  closesAtMinute: number;
  dayOfWeek: WeekDayEnum;
  opensAtMinute: number;
  slotOrder: number;
}

export interface CreateBusinessHoursInput {
  slots: CreateBusinessHourItemInput[];
}

export interface UpdateBusinessHourInput {
  closesAtMinute?: number;
  dayOfWeek?: WeekDayEnum;
  id: number;
  opensAtMinute?: number;
  slotOrder?: number;
}
