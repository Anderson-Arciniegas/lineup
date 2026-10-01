import type { BusinessSchema, ProductSchema, ProductSkuSchema } from '.';

export interface CartItemSchema {
  id: number;
  idCart: number;
  idProduct: number;
  idProductSku?: number | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  variationOptions?: Record<string, string> | string | null;
  product?: ProductSchema;
  productSku?: ProductSkuSchema;
  __typename?: 'CartItemSchema';
}

export interface CartSchema {
  id: number;
  idCreationUser: number;
  idBusiness: number;
  total: number;
  itemsCount: number;
  lastActivityDate?: string | null;
  business?: BusinessSchema;
  items?: CartItemSchema[];
  __typename?: 'CartSchema';
}
