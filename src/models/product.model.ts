export type ProductStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED'
  | 'PAUSED'
  | 'ARCHIVED';

export interface CategoryModel {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
}

export interface ProductImageModel {
  id: string;
  productId: string;
  url: string;
  altText: string;
  position: number;
  isPrimary: boolean;
}

export interface ProductVariantModel {
  id: string;
  productId: string;
  name: string;
  sku: string;
  material?: string;
  colour?: string;
  finish?: string;
  priceDelta: number;
  isActive: boolean;
}

export interface InventoryModel {
  id: string;
  productId?: string;
  variantId?: string;
  quantity: number;
  reserved: number;
  lowStockThreshold: number;
}

export interface ProductModel {
  id: string;
  sellerId: string;
  categoryId: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  basePrice: number;
  currency: string;
  sku: string;
  material: string;
  processingDays: number;
  shippingOrigin: string;
  customisationEnabled: boolean;
  status: ProductStatus;
}
