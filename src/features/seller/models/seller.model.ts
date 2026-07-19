import type { ProductStatus } from '@/models/product.model';
import type { SellerVerificationStatus } from '@/models/seller.model';
import type { UserRole } from '@/models/user.model';

export interface SellerPermissionUser {
  readonly id: string;
  readonly role: UserRole;
  readonly status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
}

export interface SellerPermissionProfile {
  readonly id: string;
  readonly userId: string;
  readonly verificationStatus: SellerVerificationStatus;
}

export interface SellerOwnedProduct {
  readonly id: string;
  readonly sellerId: string;
  readonly status: ProductStatus;
}

export interface SellerWorkspace {
  readonly seller:
    | (SellerPermissionProfile & {
        readonly storeName: string;
        readonly storeSlug: string;
        readonly description: string;
        readonly logoUrl: string | null;
        readonly bannerUrl: string | null;
        readonly contactEmail: string;
        readonly contactPhone: string | null;
        readonly originCity: string;
        readonly originState: string;
        readonly originPostalCode: string;
        readonly yearsExperience: number;
        readonly supportedMaterials: readonly string[];
        readonly printTechnologies: readonly string[];
        readonly maxPrintDimensions: string | null;
        readonly customOrdersEnabled: boolean;
        readonly averageProcessDays: number;
        readonly averageRating: number;
      })
    | null;
  readonly application: {
    readonly status: SellerVerificationStatus;
    readonly changeRequestNote: string | null;
    readonly submittedAt: Date;
  } | null;
}

export interface SellerProductImageInput {
  readonly url: string;
  readonly altText: string;
}

export interface SellerProductVariantInput {
  readonly id?: string | undefined;
  readonly name: string;
  readonly sku: string;
  readonly material?: string | undefined;
  readonly colour?: string | undefined;
  readonly finish?: string | undefined;
  readonly priceDelta: number;
  readonly quantity: number;
  readonly lowStockThreshold: number;
}

export interface SellerProductInput {
  readonly name: string;
  readonly slug: string;
  readonly shortDescription: string;
  readonly fullDescription: string;
  readonly categoryId: string;
  readonly basePrice: number;
  readonly compareAtPrice?: number | undefined;
  readonly sku: string;
  readonly minOrderQuantity: number;
  readonly maxOrderQuantity?: number | undefined;
  readonly dimensions?: string | undefined;
  readonly weightGrams?: number | undefined;
  readonly material: string;
  readonly finish?: string | undefined;
  readonly colour?: string | undefined;
  readonly processingDays: number;
  readonly shippingOrigin: string;
  readonly customisationEnabled: boolean;
  readonly safetyNotes?: string | undefined;
  readonly intendedUse?: string | undefined;
  readonly ageRestriction?: string | undefined;
  readonly ipDeclaration: string;
  readonly ipDeclarationAccepted: boolean;
  readonly tags: string;
  readonly searchKeywords: string;
  readonly seoTitle?: string | undefined;
  readonly seoDescription?: string | undefined;
  readonly quantity: number;
  readonly lowStockThreshold: number;
  readonly images: readonly SellerProductImageInput[];
  readonly variants: readonly SellerProductVariantInput[];
}

export type ProductSaveIntent = 'SAVE_DRAFT' | 'SUBMIT_REVIEW';

export interface SellerProductListItem {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly categoryName: string;
  readonly imageUrl: string | null;
  readonly imageAlt: string;
  readonly priceInPaise: number;
  readonly stock: number;
  readonly reserved: number;
  readonly lowStockThreshold: number;
  readonly status: ProductStatus;
  readonly viewCount: number;
  readonly orderCount: number;
  readonly updatedAt: Date;
}

export interface SellerProductEditorRecord extends SellerProductInput {
  readonly id: string;
  readonly sellerId: string;
  readonly status: ProductStatus;
}

export interface SellerInventoryRecord {
  readonly productId: string;
  readonly productName: string;
  readonly productQuantity: number;
  readonly productReserved: number;
  readonly productLowStockThreshold: number;
  readonly variants: readonly {
    readonly id: string;
    readonly name: string;
    readonly sku: string;
    readonly quantity: number;
    readonly reserved: number;
    readonly lowStockThreshold: number;
  }[];
}

export interface SellerMetric {
  readonly label: string;
  readonly value: string;
  readonly detail: string;
  readonly tone: 'default' | 'success' | 'warning' | 'info';
}

export interface SellerDashboardData {
  readonly storeName: string;
  readonly verificationStatus: SellerVerificationStatus;
  readonly metrics: readonly SellerMetric[];
  readonly revenueSeries: readonly { label: string; valueInPaise: number }[];
  readonly orderStatusSeries: readonly { label: string; value: number }[];
  readonly recentOrders: readonly {
    orderNumber: string;
    productName: string;
    status: string;
    totalInPaise: number;
    placedAt: Date;
  }[];
  readonly topProducts: readonly {
    id: string;
    name: string;
    orderCount: number;
    revenueInPaise: number;
  }[];
  readonly lowStockProducts: readonly { id: string; name: string; stock: number }[];
}

export interface ProductActionResult {
  readonly status: 'idle' | 'success' | 'error';
  readonly message: string;
  readonly productId?: string;
}
