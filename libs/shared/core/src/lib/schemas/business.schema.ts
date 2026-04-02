import type {
  BusinessRoleSchema,
  CatalogSchema,
  FileSchema,
  LocationSchema,
  ProductFileSchema,
  ProductSchema,
  ProductVariationSchema,
} from '.';
import type { ProvidersEnum, StatusEnum } from '../enums';
import { BusinessFollowerSchema } from './business-follower.schema';
import type { BusinessHourSchema } from './business-hour.schema';

export interface BusinessSchema {
  businessFollowers: BusinessFollowerSchema[];
  businessHours?: BusinessHourSchema[];
  businessRoles: BusinessRoleSchema[];
  catalogs: CatalogSchema[];
  description?: string;
  email: string;
  emailValidated: boolean;
  files: FileSchema[];
  followers: number;
  hexColor?: string;
  id: number;
  isOnline?: boolean;
  image?: FileSchema;
  imageCode?: string;
  locations: LocationSchema[];
  modifiedProductFiles: ProductFileSchema[];
  modifiedProductVariations: ProductVariationSchema[];
  name: string;
  path: string;
  productFiles: ProductFileSchema[];
  productVariations: ProductVariationSchema[];
  products: ProductSchema[];
  provider: ProvidersEnum;
  status: StatusEnum;
  tags?: string[];
  telephone?: string;
  visits: number;
  __typename: 'BusinessSchema';
}
