export interface AddToCartInput {
  businessId: number;
  productId: number;
  quantity: number;
  productSkuId?: number;
  /** Enviado como JSON string al backend (campo GraphQL String). */
  variationOptions?: string;
}

export interface UpdateCartItemInput {
  cartItemId: number;
  quantity: number;
}

export interface RemoveCartItemInput {
  cartItemId: number;
}

export interface GetCartByBusinessInput {
  businessId: number;
}
