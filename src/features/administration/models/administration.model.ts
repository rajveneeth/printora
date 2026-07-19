import type { ProductStatus } from '@/models/product.model';
import type { ReviewStatus } from '@/models/review.model';
import type { SellerVerificationStatus } from '@/models/seller.model';

export interface AdminMetric {
  readonly label: string;
  readonly value: string;
  readonly detail: string;
  readonly tone: 'default' | 'success' | 'warning' | 'info';
}

export interface AdminDashboardData {
  readonly metrics: readonly AdminMetric[];
  readonly recentAudit: readonly AuditLogRecord[];
}

export interface AdminCategoryRecord {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string | null;
  readonly parentId: string | null;
  readonly parentName: string | null;
  readonly imageUrl: string | null;
  readonly icon: string | null;
  readonly seoTitle: string | null;
  readonly seoDescription: string | null;
  readonly position: number;
  readonly isActive: boolean;
  readonly productCount: number;
}

export interface ProductModerationListItem {
  readonly id: string;
  readonly name: string;
  readonly sellerName: string;
  readonly categoryName: string;
  readonly status: ProductStatus;
  readonly imageUrl: string | null;
  readonly updatedAt: Date;
}

export interface ProductModerationDetails extends ProductModerationListItem {
  readonly shortDescription: string;
  readonly fullDescription: string;
  readonly material: string;
  readonly finish: string | null;
  readonly dimensions: string | null;
  readonly priceInPaise: number;
  readonly stock: number;
  readonly safetyNotes: string | null;
  readonly ipDeclaration: string;
  readonly customisationEnabled: boolean;
  readonly seoTitle: string | null;
  readonly seoDescription: string | null;
  readonly images: readonly { id: string; url: string; altText: string }[];
  readonly variants: readonly { id: string; name: string; sku: string }[];
  readonly events: readonly {
    id: string;
    previousStatus: ProductStatus | null;
    newStatus: ProductStatus;
    note: string | null;
    createdAt: Date;
  }[];
}

export interface SellerModerationRecord {
  readonly id: string;
  readonly userId: string;
  readonly storeName: string;
  readonly storeSlug: string;
  readonly description: string;
  readonly contactEmail: string;
  readonly origin: string;
  readonly supportedMaterials: readonly string[];
  readonly printTechnologies: readonly string[];
  readonly status: SellerVerificationStatus;
  readonly submittedAt: Date | null;
  readonly changeRequestNote: string | null;
  readonly declarationAccepted: boolean;
}

export interface ReviewModerationRecord {
  readonly id: string;
  readonly productName: string;
  readonly sellerName: string;
  readonly customerName: string;
  readonly rating: number;
  readonly title: string;
  readonly body: string;
  readonly status: ReviewStatus;
  readonly orderNumber: string | null;
  readonly createdAt: Date;
}

export interface AuditLogRecord {
  readonly id: string;
  readonly actorName: string;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly reason: string | null;
  readonly createdAt: Date;
}

export interface AdminActionState {
  readonly status: 'idle' | 'success' | 'error';
  readonly message: string;
}
