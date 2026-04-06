import type {
  BusinessRoleSchema,
  CatalogSchema,
  FileSchema,
  LocationSchema,
  ProductFileSchema,
  ProductSchema,
  ProductVariationSchema,
} from '.';
import type { DiscountSchema } from './discount.schema';
import type { DiscountProductSchema, ProductSkuSchema } from './product.schema';
import type { ProvidersEnum, StatusEnum } from '../enums';
import { BusinessFollowerSchema } from './business-follower.schema';
import type { BusinessHourSchema } from './business-hour.schema';
import type { BusinessVisitSchema } from './business-visit.schema';
import type { EntityAuditSchema } from './entity-audit.schema';

export interface BusinessSchema {
  businessFollowers: BusinessFollowerSchema[];
  businessHours: BusinessHourSchema[];
  businessRoles: BusinessRoleSchema[];
  businessVisits: BusinessVisitSchema[];
  catalogs: CatalogSchema[];
  creationDiscountProducts: DiscountProductSchema[];
  creationEntityAudits: EntityAuditSchema[];
  description?: string;
  discounts: DiscountSchema[];
  email: string;
  emailValidated: boolean;
  files: FileSchema[];
  followers: number;
  hexColor?: string;
  id: number;
  image?: FileSchema;
  imageCode?: string;
  isBsEquivalentPriceEnabled: boolean;
  isOnline: boolean;
  locations: LocationSchema[];
  modifiedDiscounts: DiscountSchema[];
  modifiedProductFiles: ProductFileSchema[];
  modifiedProductVariations: ProductVariationSchema[];
  name: string;
  path: string;
  productFiles: ProductFileSchema[];
  productSkus: ProductSkuSchema[];
  productVariations: ProductVariationSchema[];
  products: ProductSchema[];
  provider: ProvidersEnum;
  status: StatusEnum;
  tags: string[];
  telephone?: string;
  visits: number;
  __typename: 'BusinessSchema';
}
