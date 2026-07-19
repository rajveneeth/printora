import { Prisma, type PrismaClient, type ProductStatus, type ReviewStatus } from '@prisma/client';
import { siteConfig } from '@/config/site';
import { formatPrice } from '@/features/catalogue';
import type {
  AdminCategoryRecord,
  AdminDashboardData,
  AuditLogRecord,
  ProductModerationDetails,
  ProductModerationListItem,
  ReviewModerationRecord,
  SellerModerationRecord,
} from '../models';
import {
  getProductModerationStatus,
  getSellerModerationStatus,
  type ProductModerationDecision,
  type SellerModerationDecision,
} from '../services';

const decimalToPaise = (amount: Prisma.Decimal | number): number =>
  Math.round(Number(amount) * 100);

interface CategoryInput {
  readonly id?: string | undefined;
  readonly name: string;
  readonly slug: string;
  readonly description?: string | undefined;
  readonly parentId?: string | undefined;
  readonly imageUrl?: string | undefined;
  readonly icon?: string | undefined;
  readonly seoTitle?: string | undefined;
  readonly seoDescription?: string | undefined;
  readonly position: number;
  readonly isActive: boolean;
}

export class PrismaAdministrationRepository {
  constructor(private readonly database: PrismaClient) {}

  async getDashboard(): Promise<AdminDashboardData> {
    const revenueStatuses = [
      'PAID',
      'CONFIRMED',
      'IN_PRODUCTION',
      'READY_TO_SHIP',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'REFUND_REQUESTED',
    ] as const;
    const activeOrderStatuses = [
      'PAID',
      'CONFIRMED',
      'IN_PRODUCTION',
      'READY_TO_SHIP',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
    ] as const;
    const [
      gmv,
      activeSellers,
      pendingSellers,
      pendingProducts,
      activeOrders,
      reviewQueue,
      recentAudit,
    ] = await Promise.all([
      this.database.order.aggregate({
        where: { status: { in: [...revenueStatuses] } },
        _sum: { grandTotal: true },
      }),
      this.database.sellerProfile.count({ where: { verificationStatus: 'APPROVED' } }),
      this.database.sellerApplication.count({ where: { status: 'PENDING' } }),
      this.database.product.count({ where: { status: 'PENDING_REVIEW' } }),
      this.database.order.count({ where: { status: { in: [...activeOrderStatuses] } } }),
      this.database.review.count({ where: { status: 'PENDING' } }),
      this.listAuditLogs(6),
    ]);
    const grossInPaise = decimalToPaise(gmv._sum.grandTotal ?? 0);
    return {
      metrics: [
        {
          label: 'Gross merchandise value',
          value: formatPrice(grossInPaise),
          detail: 'Verified paid and fulfilled orders',
          tone: 'success',
        },
        {
          label: 'Platform revenue',
          value: formatPrice(
            Math.round((grossInPaise * siteConfig.defaultCommissionPercentage) / 100),
          ),
          detail: `${siteConfig.defaultCommissionPercentage}% marketplace commission`,
          tone: 'default',
        },
        {
          label: 'Active sellers',
          value: String(activeSellers),
          detail: 'Approved marketplace stores',
          tone: 'success',
        },
        {
          label: 'Seller applications',
          value: String(pendingSellers),
          detail: 'Awaiting moderation',
          tone: 'warning',
        },
        {
          label: 'Product approvals',
          value: String(pendingProducts),
          detail: 'Submitted listings to review',
          tone: 'warning',
        },
        {
          label: 'Active orders',
          value: String(activeOrders),
          detail: 'Paid through out for delivery',
          tone: 'info',
        },
        {
          label: 'Review queue',
          value: String(reviewQueue),
          detail: 'Pending moderation',
          tone: 'default',
        },
      ],
      recentAudit,
    };
  }

  async listCategories(): Promise<readonly AdminCategoryRecord[]> {
    const categories = await this.database.category.findMany({
      include: { parent: { select: { name: true } }, _count: { select: { products: true } } },
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
    });
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
      parentName: category.parent?.name ?? null,
      imageUrl: category.imageUrl,
      icon: category.icon,
      seoTitle: category.seoTitle,
      seoDescription: category.seoDescription,
      position: category.position,
      isActive: category.isActive,
      productCount: category._count.products,
    }));
  }

  async saveCategory(actorId: string, input: CategoryInput): Promise<string> {
    return this.database.$transaction(async (transaction) => {
      if (input.id && input.parentId === input.id) {
        throw new Error('A category cannot be its own parent.');
      }
      if (input.parentId) {
        const parent = await transaction.category.findUnique({ where: { id: input.parentId } });
        if (!parent) throw new Error('The selected parent category does not exist.');
      }
      const sharedData = {
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        parentId: input.parentId ?? null,
        imageUrl: input.imageUrl ?? null,
        icon: input.icon ?? null,
        seoTitle: input.seoTitle ?? null,
        seoDescription: input.seoDescription ?? null,
        position: input.position,
        isActive: input.isActive,
      };
      const previous = input.id
        ? await transaction.category.findUnique({ where: { id: input.id } })
        : null;
      if (input.id && !previous) throw new Error('Category not found.');
      const category = input.id
        ? await transaction.category.update({ where: { id: input.id }, data: sharedData })
        : await transaction.category.create({ data: sharedData });
      await transaction.auditLog.create({
        data: {
          actorId,
          action: previous ? 'CATEGORY_UPDATED' : 'CATEGORY_CREATED',
          entityType: 'CATEGORY',
          entityId: category.id,
          previousState: previous
            ? { name: previous.name, slug: previous.slug, isActive: previous.isActive }
            : Prisma.JsonNull,
          newState: { name: category.name, slug: category.slug, isActive: category.isActive },
          reason:
            previous?.isActive === true && !category.isActive
              ? 'Category archived through administration.'
              : null,
        },
      });
      return category.id;
    });
  }

  async listProducts(status?: ProductStatus): Promise<readonly ProductModerationListItem[]> {
    const products = await this.database.product.findMany({
      ...(status ? { where: { status } } : {}),
      include: {
        seller: { select: { storeName: true } },
        category: { select: { name: true } },
        images: { orderBy: { position: 'asc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      sellerName: product.seller.storeName,
      categoryName: product.category.name,
      status: product.status,
      imageUrl: product.images[0]?.url ?? null,
      updatedAt: product.updatedAt,
    }));
  }

  async findProduct(productId: string): Promise<ProductModerationDetails | null> {
    const product = await this.database.product.findUnique({
      where: { id: productId },
      include: {
        seller: { select: { storeName: true } },
        category: { select: { name: true } },
        images: { orderBy: { position: 'asc' } },
        variants: { where: { isActive: true }, orderBy: { name: 'asc' } },
        inventory: true,
        approvalEvents: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!product) return null;
    return {
      id: product.id,
      name: product.name,
      sellerName: product.seller.storeName,
      categoryName: product.category.name,
      status: product.status,
      imageUrl: product.images[0]?.url ?? null,
      updatedAt: product.updatedAt,
      shortDescription: product.shortDescription,
      fullDescription: product.fullDescription,
      material: product.material,
      finish: product.finish,
      dimensions: product.dimensions,
      priceInPaise: decimalToPaise(product.basePrice),
      stock: Math.max(0, (product.inventory?.quantity ?? 0) - (product.inventory?.reserved ?? 0)),
      safetyNotes: product.safetyNotes,
      ipDeclaration: product.ipDeclaration,
      customisationEnabled: product.customisationEnabled,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      images: product.images.map((image) => ({
        id: image.id,
        url: image.url,
        altText: image.altText,
      })),
      variants: product.variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        sku: variant.sku,
      })),
      events: product.approvalEvents.map((event) => ({
        id: event.id,
        previousStatus: event.previousStatus,
        newStatus: event.newStatus,
        note: event.note,
        createdAt: event.createdAt,
      })),
    };
  }

  async moderateProduct(input: {
    readonly actorId: string;
    readonly productId: string;
    readonly decision: ProductModerationDecision;
    readonly reason?: string | undefined;
  }): Promise<void> {
    await this.database.$transaction(async (transaction) => {
      const product = await transaction.product.findUnique({
        where: { id: input.productId },
        include: { seller: { select: { verificationStatus: true } } },
      });
      if (!product) throw new Error('Product not found.');
      if (
        (input.decision === 'APPROVE' || input.decision === 'APPROVE_AND_PUBLISH') &&
        product.seller.verificationStatus !== 'APPROVED'
      ) {
        throw new Error('Only products from an approved active seller can be approved.');
      }
      const nextStatus = getProductModerationStatus(product.status, input.decision);
      const publishedAt = nextStatus === 'PUBLISHED' ? new Date() : null;
      await transaction.product.update({
        where: { id: product.id },
        data: {
          status: nextStatus,
          publishedAt,
        },
      });
      await transaction.productApprovalEvent.create({
        data: {
          productId: product.id,
          actorId: input.actorId,
          previousStatus: product.status,
          newStatus: nextStatus,
          note: input.reason ?? `Administrator decision: ${input.decision.toLowerCase()}.`,
        },
      });
      await transaction.auditLog.create({
        data: {
          actorId: input.actorId,
          action: `PRODUCT_${input.decision}`,
          entityType: 'PRODUCT',
          entityId: product.id,
          previousState: {
            status: product.status,
            publishedAt: product.publishedAt?.toISOString() ?? null,
          },
          newState: { status: nextStatus, publishedAt: publishedAt?.toISOString() ?? null },
          reason: input.reason ?? null,
        },
      });
    });
  }

  async listSellers(): Promise<readonly SellerModerationRecord[]> {
    const sellers = await this.database.sellerProfile.findMany({
      include: { user: { include: { sellerApplication: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    return sellers.map((seller) => ({
      id: seller.id,
      userId: seller.userId,
      storeName: seller.storeName,
      storeSlug: seller.storeSlug,
      description: seller.description,
      contactEmail: seller.contactEmail,
      origin: `${seller.originCity}, ${seller.originState} ${seller.originPostalCode}`,
      supportedMaterials: seller.supportedMaterials,
      printTechnologies: seller.printTechnologies,
      status: seller.verificationStatus,
      submittedAt: seller.user.sellerApplication?.submittedAt ?? null,
      changeRequestNote: seller.user.sellerApplication?.changeRequestNote ?? null,
      declarationAccepted: seller.user.sellerApplication?.declarationAccepted ?? false,
    }));
  }

  async findSeller(sellerId: string): Promise<SellerModerationRecord | null> {
    return (await this.listSellers()).find((seller) => seller.id === sellerId) ?? null;
  }

  async moderateSeller(input: {
    readonly actorId: string;
    readonly sellerId: string;
    readonly decision: SellerModerationDecision;
    readonly reason?: string | undefined;
  }): Promise<void> {
    await this.database.$transaction(async (transaction) => {
      const seller = await transaction.sellerProfile.findUnique({
        where: { id: input.sellerId },
        include: { user: { include: { sellerApplication: true } } },
      });
      if (!seller) throw new Error('Seller not found.');
      if (input.decision === 'APPROVE' && !seller.user.sellerApplication?.declarationAccepted) {
        throw new Error('A submitted seller declaration is required before approval.');
      }
      const nextStatus = getSellerModerationStatus(seller.verificationStatus, input.decision);
      await transaction.sellerProfile.update({
        where: { id: seller.id },
        data: { verificationStatus: nextStatus },
      });
      await transaction.sellerApplication.updateMany({
        where: { userId: seller.userId },
        data: {
          status: nextStatus,
          reviewedAt: new Date(),
          changeRequestNote: input.reason ?? null,
        },
      });
      if (nextStatus === 'APPROVED') {
        await transaction.user.update({ where: { id: seller.userId }, data: { role: 'SELLER' } });
      }
      if (nextStatus === 'SUSPENDED') {
        const publishedProducts = await transaction.product.findMany({
          where: { sellerId: seller.id, status: 'PUBLISHED' },
          select: { id: true },
        });
        await transaction.product.updateMany({
          where: { sellerId: seller.id, status: 'PUBLISHED' },
          data: { status: 'PAUSED', publishedAt: null },
        });
        if (publishedProducts.length) {
          await transaction.productApprovalEvent.createMany({
            data: publishedProducts.map(({ id }) => ({
              productId: id,
              actorId: input.actorId,
              previousStatus: 'PUBLISHED',
              newStatus: 'PAUSED',
              note: 'Publication paused because the seller account was suspended.',
            })),
          });
        }
      }
      await transaction.sellerModerationEvent.create({
        data: {
          sellerId: seller.id,
          moderatorId: input.actorId,
          previousStatus: seller.verificationStatus,
          newStatus: nextStatus,
          reason: input.reason ?? null,
        },
      });
      await transaction.auditLog.create({
        data: {
          actorId: input.actorId,
          action: `SELLER_${input.decision}`,
          entityType: 'SELLER',
          entityId: seller.id,
          previousState: { status: seller.verificationStatus },
          newState: { status: nextStatus },
          reason: input.reason ?? null,
        },
      });
    });
  }

  async listReviews(status?: ReviewStatus): Promise<readonly ReviewModerationRecord[]> {
    const reviews = await this.database.review.findMany({
      ...(status ? { where: { status } } : {}),
      include: {
        product: { include: { seller: { select: { storeName: true } } } },
        author: { select: { name: true, email: true } },
        orderItem: { include: { order: { select: { orderNumber: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return reviews.map((review) => ({
      id: review.id,
      productName: review.product.name,
      sellerName: review.product.seller.storeName,
      customerName: review.author.name ?? review.author.email,
      rating: review.rating,
      title: review.title,
      body: review.body,
      status: review.status,
      orderNumber: review.orderItem?.order.orderNumber ?? null,
      createdAt: review.createdAt,
    }));
  }

  async moderateReview(input: {
    readonly actorId: string;
    readonly reviewId: string;
    readonly status: Exclude<ReviewStatus, 'PENDING'>;
    readonly reason: string;
  }): Promise<void> {
    await this.database.$transaction(async (transaction) => {
      const review = await transaction.review.findUnique({ where: { id: input.reviewId } });
      if (!review) throw new Error('Review not found.');
      if (review.status === input.status)
        throw new Error('The review already has this visibility.');
      await transaction.review.update({
        where: { id: review.id },
        data: { status: input.status },
      });
      await transaction.reviewModerationEvent.create({
        data: {
          reviewId: review.id,
          moderatorId: input.actorId,
          previousStatus: review.status,
          newStatus: input.status,
          reason: input.reason,
        },
      });
      await transaction.auditLog.create({
        data: {
          actorId: input.actorId,
          action: 'REVIEW_MODERATED',
          entityType: 'REVIEW',
          entityId: review.id,
          previousState: { status: review.status },
          newState: { status: input.status },
          reason: input.reason,
        },
      });
    });
  }

  async listAuditLogs(limit = 100): Promise<readonly AuditLogRecord[]> {
    const logs = await this.database.auditLog.findMany({
      include: { actor: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return logs.map((log) => ({
      id: log.id,
      actorName: log.actor.name ?? log.actor.email,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      reason: log.reason,
      createdAt: log.createdAt,
    }));
  }
}
