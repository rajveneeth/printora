import { Prisma, PrismaClient, type ProductStatus } from '@prisma/client';
import { formatPrice } from '@/features/catalogue/services';
import type {
  SellerDashboardData,
  SellerInventoryRecord,
  SellerProductEditorRecord,
  SellerProductInput,
  SellerProductListItem,
  SellerWorkspace,
} from '../models';
import type { InventoryUpdateInput, SellerProfileInput } from '../schemas';
import type { PreparedProductImage } from '@/lib/storage';

const rupeesToPaise = (value: Prisma.Decimal | number): number => Math.round(Number(value) * 100);

const splitValues = (value: string): string[] => [
  ...new Set(
    value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean),
  ),
];

const getAvailableStock = (inventory: { quantity: number; reserved: number } | null): number =>
  inventory ? Math.max(0, inventory.quantity - inventory.reserved) : 0;

const revenueStatuses = [
  'PAID',
  'CONFIRMED',
  'IN_PRODUCTION',
  'READY_TO_SHIP',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
] as const;

export class PrismaSellerRepository {
  constructor(private readonly database: PrismaClient) {}

  async findSellerWorkspaceByUserId(userId: string): Promise<SellerWorkspace> {
    const user = await this.database.user.findUnique({
      where: { id: userId },
      include: { sellerProfile: true, sellerApplication: true },
    });
    if (!user) {
      return { seller: null, application: null };
    }
    return {
      seller: user.sellerProfile
        ? {
            id: user.sellerProfile.id,
            userId: user.sellerProfile.userId,
            storeName: user.sellerProfile.storeName,
            storeSlug: user.sellerProfile.storeSlug,
            description: user.sellerProfile.description,
            logoUrl: user.sellerProfile.logoUrl,
            bannerUrl: user.sellerProfile.bannerUrl,
            contactEmail: user.sellerProfile.contactEmail,
            contactPhone: user.sellerProfile.contactPhone,
            originCity: user.sellerProfile.originCity,
            originState: user.sellerProfile.originState,
            originPostalCode: user.sellerProfile.originPostalCode,
            yearsExperience: user.sellerProfile.yearsExperience,
            supportedMaterials: user.sellerProfile.supportedMaterials,
            printTechnologies: user.sellerProfile.printTechnologies,
            maxPrintDimensions: user.sellerProfile.maxPrintDimensions,
            customOrdersEnabled: user.sellerProfile.customOrdersEnabled,
            averageProcessDays: user.sellerProfile.averageProcessDays,
            verificationStatus: user.sellerProfile.verificationStatus,
            averageRating: Number(user.sellerProfile.averageRating),
          }
        : null,
      application: user.sellerApplication
        ? {
            status: user.sellerApplication.status,
            changeRequestNote: user.sellerApplication.changeRequestNote,
            submittedAt: user.sellerApplication.submittedAt,
          }
        : null,
    };
  }

  async saveSellerApplication(userId: string, input: SellerProfileInput): Promise<void> {
    const supportedMaterials = splitValues(input.supportedMaterials);
    const printTechnologies = splitValues(input.printTechnologies);
    const sharedData = {
      storeName: input.storeName,
      storeSlug: input.storeSlug,
      description: input.description,
      logoUrl: input.logoUrl || null,
      bannerUrl: input.bannerUrl || null,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone ?? null,
      originCity: input.originCity,
      originState: input.originState,
      originPostalCode: input.originPostalCode,
      yearsExperience: input.yearsExperience,
      supportedMaterials,
      printTechnologies,
      maxPrintDimensions: input.maxPrintDimensions ?? null,
      customOrdersEnabled: input.customOrdersEnabled,
      averageProcessDays: input.averageProcessDays,
    };
    await this.database.$transaction([
      this.database.sellerProfile.upsert({
        where: { userId },
        update: { ...sharedData, verificationStatus: 'PENDING' },
        create: { userId, ...sharedData, verificationStatus: 'PENDING' },
      }),
      this.database.sellerApplication.upsert({
        where: { userId },
        update: {
          ...sharedData,
          declarationAccepted: input.declarationAccepted,
          status: 'PENDING',
          submittedAt: new Date(),
          reviewedAt: null,
          changeRequestNote: null,
        },
        create: {
          userId,
          ...sharedData,
          declarationAccepted: input.declarationAccepted,
          status: 'PENDING',
        },
      }),
    ]);
  }

  async updateSellerProfile(userId: string, input: SellerProfileInput): Promise<void> {
    await this.database.sellerProfile.update({
      where: { userId },
      data: {
        storeName: input.storeName,
        storeSlug: input.storeSlug,
        description: input.description,
        logoUrl: input.logoUrl || null,
        bannerUrl: input.bannerUrl || null,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone ?? null,
        originCity: input.originCity,
        originState: input.originState,
        originPostalCode: input.originPostalCode,
        yearsExperience: input.yearsExperience,
        supportedMaterials: splitValues(input.supportedMaterials),
        printTechnologies: splitValues(input.printTechnologies),
        maxPrintDimensions: input.maxPrintDimensions ?? null,
        customOrdersEnabled: input.customOrdersEnabled,
        averageProcessDays: input.averageProcessDays,
      },
    });
  }

  async listActiveCategories(): Promise<readonly { id: string; name: string }[]> {
    return this.database.category.findMany({
      where: { isActive: true },
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true },
    });
  }

  async findActiveCategoryById(categoryId: string): Promise<{ id: string; slug: string } | null> {
    return this.database.category.findFirst({
      where: { id: categoryId, isActive: true },
      select: { id: true, slug: true },
    });
  }

  async listSellerProducts(sellerId: string): Promise<SellerProductListItem[]> {
    const products = await this.database.product.findMany({
      where: { sellerId },
      include: {
        category: { select: { name: true } },
        images: { orderBy: { position: 'asc' }, take: 1 },
        inventory: true,
        variants: { where: { isActive: true }, include: { inventory: true } },
        _count: { select: { orderItems: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return products.map((product) => {
      const variantStock = product.variants.reduce(
        (total, variant) => total + getAvailableStock(variant.inventory),
        0,
      );
      const variantReserved = product.variants.reduce(
        (total, variant) => total + (variant.inventory?.reserved ?? 0),
        0,
      );
      const variantLowStockThreshold = product.variants.reduce(
        (total, variant) => total + (variant.inventory?.lowStockThreshold ?? 0),
        0,
      );
      const hasVariants = product.variants.length > 0;
      const image = product.images[0];
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        categoryName: product.category.name,
        imageUrl: image?.url ?? null,
        imageAlt: image?.altText ?? '',
        priceInPaise: rupeesToPaise(product.basePrice),
        stock: hasVariants ? variantStock : getAvailableStock(product.inventory),
        reserved: hasVariants ? variantReserved : (product.inventory?.reserved ?? 0),
        lowStockThreshold: hasVariants
          ? variantLowStockThreshold
          : (product.inventory?.lowStockThreshold ?? 0),
        status: product.status,
        viewCount: product.viewCount,
        orderCount: product._count.orderItems,
        updatedAt: product.updatedAt,
      };
    });
  }

  async findOwnedProduct(
    sellerId: string,
    productId: string,
  ): Promise<SellerProductEditorRecord | null> {
    const product = await this.database.product.findFirst({
      where: { id: productId, sellerId },
      include: {
        images: { orderBy: { position: 'asc' } },
        inventory: true,
        variants: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
          include: { inventory: true },
        },
      },
    });
    if (!product) {
      return null;
    }
    return {
      id: product.id,
      sellerId: product.sellerId,
      status: product.status,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      fullDescription: product.fullDescription,
      categoryId: product.categoryId,
      basePrice: Number(product.basePrice),
      ...(product.compareAtPrice ? { compareAtPrice: Number(product.compareAtPrice) } : {}),
      sku: product.sku,
      minOrderQuantity: product.minOrderQuantity,
      ...(product.maxOrderQuantity ? { maxOrderQuantity: product.maxOrderQuantity } : {}),
      ...(product.dimensions ? { dimensions: product.dimensions } : {}),
      ...(product.weightGrams ? { weightGrams: product.weightGrams } : {}),
      material: product.material,
      ...(product.finish ? { finish: product.finish } : {}),
      ...(product.colour ? { colour: product.colour } : {}),
      processingDays: product.processingDays,
      shippingOrigin: product.shippingOrigin,
      customisationEnabled: product.customisationEnabled,
      ...(product.safetyNotes ? { safetyNotes: product.safetyNotes } : {}),
      ...(product.intendedUse ? { intendedUse: product.intendedUse } : {}),
      ...(product.ageRestriction ? { ageRestriction: product.ageRestriction } : {}),
      ipDeclaration: product.ipDeclaration,
      ipDeclarationAccepted: true,
      tags: product.tags.join(', '),
      searchKeywords: product.searchKeywords.join(', '),
      ...(product.seoTitle ? { seoTitle: product.seoTitle } : {}),
      ...(product.seoDescription ? { seoDescription: product.seoDescription } : {}),
      quantity: product.inventory?.quantity ?? 0,
      lowStockThreshold: product.inventory?.lowStockThreshold ?? 5,
      images: product.images.map((image) => ({ url: image.url, altText: image.altText })),
      variants: product.variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        sku: variant.sku,
        ...(variant.material ? { material: variant.material } : {}),
        ...(variant.colour ? { colour: variant.colour } : {}),
        ...(variant.finish ? { finish: variant.finish } : {}),
        priceDelta: Number(variant.priceDelta),
        quantity: variant.inventory?.quantity ?? 0,
        lowStockThreshold: variant.inventory?.lowStockThreshold ?? 5,
      })),
    };
  }

  async createSellerProduct(
    sellerId: string,
    actorId: string,
    input: SellerProductInput,
    images: readonly PreparedProductImage[],
    status: ProductStatus,
  ): Promise<string> {
    const product = await this.database.product.create({
      data: {
        sellerId,
        ...this.toProductData(input),
        status,
        images: {
          create: images.map((image) => ({
            url: image.url,
            altText: image.altText,
            position: image.position,
            isPrimary: image.isPrimary,
          })),
        },
        inventory: {
          create: { quantity: input.quantity, lowStockThreshold: input.lowStockThreshold },
        },
        variants: {
          create: input.variants.map((variant) => ({
            name: variant.name,
            sku: variant.sku,
            material: variant.material ?? null,
            colour: variant.colour ?? null,
            finish: variant.finish ?? null,
            priceDelta: variant.priceDelta.toFixed(2),
            inventory: {
              create: {
                quantity: variant.quantity,
                lowStockThreshold: variant.lowStockThreshold,
              },
            },
          })),
        },
        approvalEvents: { create: { actorId, newStatus: status } },
      },
      select: { id: true },
    });
    return product.id;
  }

  async updateSellerProduct(
    productId: string,
    actorId: string,
    input: SellerProductInput,
    images: readonly PreparedProductImage[],
    previousStatus: ProductStatus,
    status: ProductStatus,
  ): Promise<void> {
    await this.database.$transaction(async (transaction) => {
      await transaction.product.update({
        where: { id: productId },
        data: {
          ...this.toProductData(input),
          status,
          publishedAt: null,
          images: {
            deleteMany: {},
            create: images.map((image) => ({
              url: image.url,
              altText: image.altText,
              position: image.position,
              isPrimary: image.isPrimary,
            })),
          },
          inventory: {
            upsert: {
              create: { quantity: input.quantity, lowStockThreshold: input.lowStockThreshold },
              update: { quantity: input.quantity, lowStockThreshold: input.lowStockThreshold },
            },
          },
        },
      });
      await transaction.productVariant.updateMany({
        where: { productId },
        data: { isActive: false },
      });
      for (const variant of input.variants) {
        if (variant.id) {
          const ownedVariant = await transaction.productVariant.findFirst({
            where: { id: variant.id, productId },
            select: { id: true },
          });
          if (!ownedVariant) {
            throw new Error('A product variant does not belong to this listing.');
          }
          await transaction.productVariant.update({
            where: { id: variant.id },
            data: {
              name: variant.name,
              sku: variant.sku,
              material: variant.material ?? null,
              colour: variant.colour ?? null,
              finish: variant.finish ?? null,
              priceDelta: variant.priceDelta.toFixed(2),
              isActive: true,
              inventory: {
                upsert: {
                  create: {
                    quantity: variant.quantity,
                    lowStockThreshold: variant.lowStockThreshold,
                  },
                  update: {
                    quantity: variant.quantity,
                    lowStockThreshold: variant.lowStockThreshold,
                  },
                },
              },
            },
          });
        } else {
          await transaction.productVariant.create({
            data: {
              productId,
              name: variant.name,
              sku: variant.sku,
              material: variant.material ?? null,
              colour: variant.colour ?? null,
              finish: variant.finish ?? null,
              priceDelta: variant.priceDelta.toFixed(2),
              inventory: {
                create: {
                  quantity: variant.quantity,
                  lowStockThreshold: variant.lowStockThreshold,
                },
              },
            },
          });
        }
      }
      if (previousStatus !== status) {
        await transaction.productApprovalEvent.create({
          data: { productId, actorId, previousStatus, newStatus: status },
        });
      }
    });
  }

  async transitionSellerProduct(
    productId: string,
    actorId: string,
    previousStatus: ProductStatus,
    status: ProductStatus,
  ): Promise<void> {
    await this.database.$transaction([
      this.database.product.update({
        where: { id: productId },
        data: { status, publishedAt: status === 'PUBLISHED' ? new Date() : null },
      }),
      this.database.productApprovalEvent.create({
        data: { productId, actorId, previousStatus, newStatus: status },
      }),
    ]);
  }

  async duplicateSellerProduct(
    sellerId: string,
    actorId: string,
    productId: string,
  ): Promise<string> {
    const source = await this.database.product.findFirst({
      where: { id: productId, sellerId },
      include: { images: true, inventory: true, variants: { include: { inventory: true } } },
    });
    if (!source) {
      throw new Error('Product not found.');
    }
    const suffix = Date.now().toString(36);
    const copy = await this.database.product.create({
      data: {
        sellerId,
        categoryId: source.categoryId,
        name: `${source.name} copy`,
        slug: `${source.slug}-copy-${suffix}`,
        shortDescription: source.shortDescription,
        fullDescription: source.fullDescription,
        basePrice: source.basePrice,
        compareAtPrice: source.compareAtPrice,
        currency: source.currency,
        sku: `${source.sku}-COPY-${suffix.toUpperCase()}`,
        minOrderQuantity: source.minOrderQuantity,
        maxOrderQuantity: source.maxOrderQuantity,
        dimensions: source.dimensions,
        weightGrams: source.weightGrams,
        material: source.material,
        finish: source.finish,
        colour: source.colour,
        processingDays: source.processingDays,
        shippingOrigin: source.shippingOrigin,
        customisationEnabled: source.customisationEnabled,
        safetyNotes: source.safetyNotes,
        intendedUse: source.intendedUse,
        ageRestriction: source.ageRestriction,
        ipDeclaration: source.ipDeclaration,
        tags: source.tags,
        searchKeywords: source.searchKeywords,
        seoTitle: source.seoTitle,
        seoDescription: source.seoDescription,
        status: 'DRAFT',
        images: {
          create: source.images.map((image) => ({
            url: image.url,
            altText: image.altText,
            position: image.position,
            isPrimary: image.isPrimary,
          })),
        },
        ...(source.inventory
          ? {
              inventory: {
                create: {
                  quantity: source.inventory.quantity,
                  lowStockThreshold: source.inventory.lowStockThreshold,
                },
              },
            }
          : {}),
        variants: {
          create: source.variants
            .filter((variant) => variant.isActive)
            .map((variant) => ({
              name: variant.name,
              sku: `${variant.sku}-COPY-${suffix.toUpperCase()}`,
              material: variant.material,
              colour: variant.colour,
              finish: variant.finish,
              priceDelta: variant.priceDelta,
              ...(variant.inventory
                ? {
                    inventory: {
                      create: {
                        quantity: variant.inventory.quantity,
                        lowStockThreshold: variant.inventory.lowStockThreshold,
                      },
                    },
                  }
                : {}),
            })),
        },
        approvalEvents: { create: { actorId, newStatus: 'DRAFT' } },
      },
      select: { id: true },
    });
    return copy.id;
  }

  async findSellerInventory(
    sellerId: string,
    productId: string,
  ): Promise<SellerInventoryRecord | null> {
    const product = await this.database.product.findFirst({
      where: { id: productId, sellerId },
      include: {
        inventory: true,
        variants: {
          where: { isActive: true },
          include: { inventory: true },
          orderBy: { name: 'asc' },
        },
      },
    });
    if (!product) {
      return null;
    }
    return {
      productId: product.id,
      productName: product.name,
      productQuantity: product.inventory?.quantity ?? 0,
      productReserved: product.inventory?.reserved ?? 0,
      productLowStockThreshold: product.inventory?.lowStockThreshold ?? 5,
      variants: product.variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        sku: variant.sku,
        quantity: variant.inventory?.quantity ?? 0,
        reserved: variant.inventory?.reserved ?? 0,
        lowStockThreshold: variant.inventory?.lowStockThreshold ?? 5,
      })),
    };
  }

  async updateSellerInventory(input: InventoryUpdateInput): Promise<void> {
    await this.database.$transaction(async (transaction) => {
      await transaction.inventory.upsert({
        where: { productId: input.productId },
        create: {
          productId: input.productId,
          quantity: input.productQuantity,
          lowStockThreshold: input.productLowStockThreshold,
        },
        update: {
          quantity: input.productQuantity,
          lowStockThreshold: input.productLowStockThreshold,
        },
      });
      for (const variant of input.variants) {
        await transaction.inventory.upsert({
          where: { variantId: variant.variantId },
          create: {
            variantId: variant.variantId,
            quantity: variant.quantity,
            lowStockThreshold: variant.lowStockThreshold,
          },
          update: {
            quantity: variant.quantity,
            lowStockThreshold: variant.lowStockThreshold,
          },
        });
      }
    });
  }

  async getSellerDashboard(sellerId: string): Promise<SellerDashboardData> {
    const [seller, products, orderItems] = await Promise.all([
      this.database.sellerProfile.findUniqueOrThrow({ where: { id: sellerId } }),
      this.listSellerProducts(sellerId),
      this.database.orderItem.findMany({
        where: { sellerId },
        include: { order: true },
        orderBy: { order: { placedAt: 'desc' } },
      }),
    ]);
    const payableItems = orderItems.filter((item) =>
      revenueStatuses.some((status) => status === item.order.status),
    );
    const itemRevenue = (item: (typeof orderItems)[number]): number =>
      rupeesToPaise(item.unitPrice) * item.quantity +
      rupeesToPaise(item.tax) +
      rupeesToPaise(item.shippingFee);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const totalRevenue = payableItems.reduce((total, item) => total + itemRevenue(item), 0);
    const monthlyRevenue = payableItems
      .filter((item) => item.order.placedAt >= monthStart)
      .reduce((total, item) => total + itemRevenue(item), 0);
    const activeStatuses = new Set(['PAID', 'CONFIRMED', 'IN_PRODUCTION', 'READY_TO_SHIP']);
    const pendingPayout = payableItems
      .filter((item) => item.order.status !== 'DELIVERED')
      .reduce((total, item) => total + itemRevenue(item), 0);
    const revenueSeries = Array.from({ length: 6 }, (_, offset) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - offset), 1);
      const valueInPaise = payableItems
        .filter(
          (item) =>
            item.order.placedAt.getFullYear() === date.getFullYear() &&
            item.order.placedAt.getMonth() === date.getMonth(),
        )
        .reduce((total, item) => total + itemRevenue(item), 0);
      return { label: date.toLocaleDateString('en-IN', { month: 'short' }), valueInPaise };
    });
    const orderStatusMap = new Map<string, number>();
    for (const item of orderItems) {
      orderStatusMap.set(item.order.status, (orderStatusMap.get(item.order.status) ?? 0) + 1);
    }
    const productPerformance = new Map<
      string,
      { id: string; name: string; orderCount: number; revenueInPaise: number }
    >();
    for (const item of payableItems) {
      const key = item.productId ?? item.productNameSnapshot;
      const current = productPerformance.get(key);
      productPerformance.set(key, {
        id: item.productId ?? key,
        name: item.productNameSnapshot,
        orderCount: (current?.orderCount ?? 0) + item.quantity,
        revenueInPaise: (current?.revenueInPaise ?? 0) + itemRevenue(item),
      });
    }
    return {
      storeName: seller.storeName,
      verificationStatus: seller.verificationStatus,
      metrics: [
        {
          label: 'Total revenue',
          value: formatPrice(totalRevenue),
          detail: 'Paid and fulfilled order items',
          tone: 'success',
        },
        {
          label: 'Revenue this month',
          value: formatPrice(monthlyRevenue),
          detail: 'Current calendar month',
          tone: 'default',
        },
        {
          label: 'New orders',
          value: String(orderStatusMap.get('PAID') ?? 0),
          detail: 'Awaiting confirmation',
          tone: 'warning',
        },
        {
          label: 'In production',
          value: String(orderStatusMap.get('IN_PRODUCTION') ?? 0),
          detail: 'Active production work',
          tone: 'info',
        },
        {
          label: 'Awaiting action',
          value: String(orderItems.filter((item) => activeStatuses.has(item.order.status)).length),
          detail: 'Active order line items',
          tone: 'warning',
        },
        {
          label: 'Completed orders',
          value: String(orderStatusMap.get('DELIVERED') ?? 0),
          detail: 'Delivered order line items',
          tone: 'success',
        },
        {
          label: 'Pending payout',
          value: formatPrice(pendingPayout),
          detail: 'Before platform settlement',
          tone: 'default',
        },
        {
          label: 'Seller rating',
          value: Number(seller.averageRating).toFixed(1),
          detail: `${seller.completedOrderCount} completed orders`,
          tone: 'success',
        },
      ],
      revenueSeries,
      orderStatusSeries: [...orderStatusMap.entries()].map(([label, value]) => ({ label, value })),
      recentOrders: orderItems.slice(0, 5).map((item) => ({
        orderNumber: item.order.orderNumber,
        productName: item.productNameSnapshot,
        status: item.order.status,
        totalInPaise: itemRevenue(item),
        placedAt: item.order.placedAt,
      })),
      topProducts: [...productPerformance.values()]
        .sort((first, second) => second.revenueInPaise - first.revenueInPaise)
        .slice(0, 5),
      lowStockProducts: products
        .filter((product) => product.stock <= product.lowStockThreshold)
        .map((product) => ({ id: product.id, name: product.name, stock: product.stock }))
        .slice(0, 5),
    };
  }

  private toProductData(input: SellerProductInput) {
    return {
      categoryId: input.categoryId,
      name: input.name,
      slug: input.slug,
      shortDescription: input.shortDescription,
      fullDescription: input.fullDescription,
      basePrice: input.basePrice.toFixed(2),
      compareAtPrice: input.compareAtPrice?.toFixed(2) ?? null,
      sku: input.sku,
      minOrderQuantity: input.minOrderQuantity,
      maxOrderQuantity: input.maxOrderQuantity ?? null,
      dimensions: input.dimensions ?? null,
      weightGrams: input.weightGrams ?? null,
      material: input.material,
      finish: input.finish ?? null,
      colour: input.colour ?? null,
      processingDays: input.processingDays,
      shippingOrigin: input.shippingOrigin,
      customisationEnabled: input.customisationEnabled,
      safetyNotes: input.safetyNotes ?? null,
      intendedUse: input.intendedUse ?? null,
      ageRestriction: input.ageRestriction ?? null,
      ipDeclaration: input.ipDeclaration,
      tags: splitValues(input.tags),
      searchKeywords: splitValues(input.searchKeywords),
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
    };
  }
}
