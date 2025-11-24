import type { 
    BusinessRoleSchema,
    CatalogSchema,
    FileSchema,
    LocationSchema,
    ProductSchema
} from '.';
import type { ProvidersEnum, StatusEnum } from '../enums';

export interface BusinessSchema {
  businessRoles: BusinessRoleSchema[];
  catalogs: CatalogSchema[];
  description?: string;
  email: string;
  emailValidated: boolean;
  id: number;
  image?: FileSchema;
  imageCode?: string;
  locations: LocationSchema[];
  name: string;
  path: string;
  products: ProductSchema[];
  provider: ProvidersEnum;
  status: StatusEnum;
  tags?: string[];
  telephone?: string;
}
