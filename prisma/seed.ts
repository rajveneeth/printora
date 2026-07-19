import {
  OrderStatus,
  PrismaClient,
  ProductStatus,
  ReviewStatus,
  SellerVerificationStatus,
  UserRole,
} from '@prisma/client';
import { hashPassword } from '../src/lib/auth/password';

const prisma = new PrismaClient();
const demoPassword = 'Formivo123!';

const ensureCredentialAccount = async (userId: string, email: string): Promise<void> => {
  await prisma.account.upsert({
    where: { providerId_accountId: { providerId: 'credentials', accountId: email } },
    update: {},
    create: {
      userId,
      providerId: 'credentials',
      accountId: email,
      password: hashPassword(demoPassword),
    },
  });
};

async function main() {
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@formivo.local' },
    update: {},
    create: {
      email: 'buyer@formivo.local',
      emailVerified: true,
      name: 'Aarav Buyer',
      role: UserRole.CUSTOMER,
      buyerProfile: { create: { displayName: 'Aarav' } },
      addresses: {
        create: {
          fullName: 'Aarav Buyer',
          phone: '+91 90000 00001',
          line1: '42 Maker Street',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
          isDefault: true,
        },
      },
    },
  });

  const sellerUser = await prisma.user.upsert({
    where: { email: 'seller@formivo.local' },
    update: {},
    create: {
      email: 'seller@formivo.local',
      emailVerified: true,
      name: 'Mira Maker',
      role: UserRole.SELLER,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@formivo.local' },
    update: { name: 'Formivo Admin', role: UserRole.ADMIN },
    create: {
      email: 'admin@formivo.local',
      emailVerified: true,
      name: 'Formivo Admin',
      role: UserRole.ADMIN,
    },
  });

  await Promise.all([
    ensureCredentialAccount(buyer.id, buyer.email),
    ensureCredentialAccount(sellerUser.id, sellerUser.email),
    ensureCredentialAccount(admin.id, admin.email),
  ]);

  const seller = await prisma.sellerProfile.upsert({
    where: { storeSlug: 'fern-fabrication' },
    update: {},
    create: {
      userId: sellerUser.id,
      storeName: 'Fern Fabrication',
      storeSlug: 'fern-fabrication',
      description:
        'Functional, calm, and carefully finished 3D-printed products for home and workspace.',
      contactEmail: 'seller@formivo.local',
      originCity: 'Pune',
      originState: 'Maharashtra',
      originPostalCode: '411001',
      yearsExperience: 4,
      supportedMaterials: ['PLA', 'PETG', 'Wood PLA'],
      printTechnologies: ['FDM'],
      maxPrintDimensions: '220 x 220 x 250 mm',
      verificationStatus: SellerVerificationStatus.APPROVED,
      averageRating: '4.8',
      completedOrderCount: 128,
    },
  });

  await prisma.sellerApplication.upsert({
    where: { userId: sellerUser.id },
    update: { status: SellerVerificationStatus.APPROVED, declarationAccepted: true },
    create: {
      userId: sellerUser.id,
      storeName: seller.storeName,
      storeSlug: seller.storeSlug,
      description: seller.description,
      logoUrl: seller.logoUrl,
      bannerUrl: seller.bannerUrl,
      contactEmail: seller.contactEmail,
      contactPhone: seller.contactPhone,
      originCity: seller.originCity,
      originState: seller.originState,
      originPostalCode: seller.originPostalCode,
      yearsExperience: seller.yearsExperience,
      supportedMaterials: seller.supportedMaterials,
      printTechnologies: seller.printTechnologies,
      maxPrintDimensions: seller.maxPrintDimensions,
      customOrdersEnabled: seller.customOrdersEnabled,
      averageProcessDays: seller.averageProcessDays,
      declarationAccepted: true,
      status: SellerVerificationStatus.APPROVED,
      reviewedAt: new Date(),
    },
  });

  const searchSellerSeeds = [
    {
      email: 'pixel@formivo.local',
      name: 'Riya Printer',
      storeName: 'Pixel Crafts',
      storeSlug: 'pixel-crafts',
      description: 'Compact, colourful accessories for phones, desks, and everyday fixes.',
      originCity: 'Mumbai',
      originState: 'Maharashtra',
      originPostalCode: '400001',
      supportedMaterials: ['PLA', 'PETG'],
      averageRating: '4.7',
      completedOrderCount: 189,
    },
    {
      email: 'makeform@formivo.local',
      name: 'Kabir Maker',
      storeName: 'Makeform Works',
      storeSlug: 'makeform-works',
      description: 'Durable functional prints and carefully engineered adjustable products.',
      originCity: 'Ahmedabad',
      originState: 'Gujarat',
      originPostalCode: '380001',
      supportedMaterials: ['PLA', 'ABS', 'PETG'],
      averageRating: '4.9',
      completedOrderCount: 411,
    },
  ] as const;
  const searchSellers = new Map<string, typeof seller>([['fern-fabrication', seller]]);

  for (const searchSellerSeed of searchSellerSeeds) {
    const searchSellerUser = await prisma.user.upsert({
      where: { email: searchSellerSeed.email },
      update: { name: searchSellerSeed.name, role: UserRole.SELLER },
      create: {
        email: searchSellerSeed.email,
        emailVerified: true,
        name: searchSellerSeed.name,
        role: UserRole.SELLER,
      },
    });
    const searchSeller = await prisma.sellerProfile.upsert({
      where: { storeSlug: searchSellerSeed.storeSlug },
      update: {
        storeName: searchSellerSeed.storeName,
        description: searchSellerSeed.description,
        originCity: searchSellerSeed.originCity,
        originState: searchSellerSeed.originState,
        supportedMaterials: [...searchSellerSeed.supportedMaterials],
        averageRating: searchSellerSeed.averageRating,
        completedOrderCount: searchSellerSeed.completedOrderCount,
        verificationStatus: SellerVerificationStatus.APPROVED,
      },
      create: {
        userId: searchSellerUser.id,
        storeName: searchSellerSeed.storeName,
        storeSlug: searchSellerSeed.storeSlug,
        description: searchSellerSeed.description,
        contactEmail: searchSellerSeed.email,
        originCity: searchSellerSeed.originCity,
        originState: searchSellerSeed.originState,
        originPostalCode: searchSellerSeed.originPostalCode,
        yearsExperience: 4,
        supportedMaterials: [...searchSellerSeed.supportedMaterials],
        printTechnologies: ['FDM'],
        verificationStatus: SellerVerificationStatus.APPROVED,
        averageRating: searchSellerSeed.averageRating,
        completedOrderCount: searchSellerSeed.completedOrderCount,
      },
    });
    searchSellers.set(searchSellerSeed.storeSlug, searchSeller);
  }

  const pendingSellerUser = await prisma.user.upsert({
    where: { email: 'pending-seller@formivo.local' },
    update: { name: 'Devika Creator', role: UserRole.CUSTOMER },
    create: {
      email: 'pending-seller@formivo.local',
      emailVerified: true,
      name: 'Devika Creator',
      role: UserRole.CUSTOMER,
    },
  });
  await ensureCredentialAccount(pendingSellerUser.id, pendingSellerUser.email);
  const pendingSeller = await prisma.sellerProfile.upsert({
    where: { storeSlug: 'little-layer-lab' },
    update: { verificationStatus: SellerVerificationStatus.PENDING },
    create: {
      userId: pendingSellerUser.id,
      storeName: 'Little Layer Lab',
      storeSlug: 'little-layer-lab',
      description: 'Colourful educational models and personalised learning aids for classrooms.',
      contactEmail: pendingSellerUser.email,
      originCity: 'Jaipur',
      originState: 'Rajasthan',
      originPostalCode: '302001',
      yearsExperience: 3,
      supportedMaterials: ['PLA', 'PETG'],
      printTechnologies: ['FDM'],
      customOrdersEnabled: true,
      verificationStatus: SellerVerificationStatus.PENDING,
    },
  });
  await prisma.sellerApplication.upsert({
    where: { userId: pendingSellerUser.id },
    update: { status: SellerVerificationStatus.PENDING, reviewedAt: null },
    create: {
      userId: pendingSellerUser.id,
      storeName: pendingSeller.storeName,
      storeSlug: pendingSeller.storeSlug,
      description: pendingSeller.description,
      contactEmail: pendingSeller.contactEmail,
      originCity: pendingSeller.originCity,
      originState: pendingSeller.originState,
      originPostalCode: pendingSeller.originPostalCode,
      yearsExperience: pendingSeller.yearsExperience,
      supportedMaterials: pendingSeller.supportedMaterials,
      printTechnologies: pendingSeller.printTechnologies,
      customOrdersEnabled: pendingSeller.customOrdersEnabled,
      averageProcessDays: pendingSeller.averageProcessDays,
      declarationAccepted: true,
      status: SellerVerificationStatus.PENDING,
    },
  });

  const categorySeeds = [
    { name: 'Home and décor', slug: 'home-decor' },
    { name: 'Desk and workspace', slug: 'desk-workspace' },
    { name: 'Phone and electronics accessories', slug: 'phone-electronics-accessories' },
    { name: 'Personalised gifts', slug: 'personalised-gifts' },
    { name: 'Toys and collectibles', slug: 'toys-collectibles' },
    { name: 'Miniatures and figurines', slug: 'miniatures-figurines' },
    { name: 'Utility and replacement parts', slug: 'utility-replacement-parts' },
    { name: 'Fashion and accessories', slug: 'fashion-accessories' },
    { name: 'Education and models', slug: 'education-models' },
    { name: 'Business and bulk orders', slug: 'business-bulk-orders' },
  ] as const;
  const categories = await Promise.all(
    categorySeeds.map(({ name, slug }, position) =>
      prisma.category.upsert({ where: { slug }, update: {}, create: { name, slug, position } }),
    ),
  );
  const homeCategory = categories.find((category) => category.slug === 'home-decor');
  const deskCategory = categories.find((category) => category.slug === 'desk-workspace');
  const phoneCategory = categories.find(
    (category) => category.slug === 'phone-electronics-accessories',
  );
  if (!homeCategory || !deskCategory || !phoneCategory) {
    throw new Error('Required seed categories could not be created');
  }

  const product = await prisma.product.upsert({
    where: { slug: 'modular-desk-organiser' },
    update: {
      tags: ['desk organiser', 'workspace', 'storage'],
      searchKeywords: ['desk', 'organiser', 'workspace', 'modular', 'pen holder'],
    },
    create: {
      sellerId: seller.id,
      categoryId: deskCategory.id,
      name: 'Modular Desk Organiser',
      slug: 'modular-desk-organiser',
      shortDescription: 'Stackable trays and pen cups for a tidy workspace.',
      fullDescription:
        'A modular organiser printed in durable PLA with a soft matte finish and configurable colour inserts.',
      basePrice: '899.00',
      compareAtPrice: '1099.00',
      sku: 'FERN-DESK-001',
      material: 'PLA',
      finish: 'Matte',
      colour: 'Fern green',
      processingDays: 3,
      shippingOrigin: 'Pune, Maharashtra',
      customisationEnabled: true,
      ipDeclaration: 'Original seller design available for marketplace production.',
      tags: ['desk organiser', 'workspace', 'storage'],
      searchKeywords: ['desk', 'organiser', 'workspace', 'modular'],
      status: ProductStatus.PUBLISHED,
      publishedAt: new Date(),
      images: {
        create: {
          url: '/seed/modular-desk-organiser.svg',
          altText: 'Green modular 3D-printed desk organiser',
          isPrimary: true,
        },
      },
      inventory: { create: { quantity: 24, lowStockThreshold: 4 } },
      variants: {
        create: [
          {
            name: 'Fern green matte',
            sku: 'FERN-DESK-001-GRN',
            colour: 'Fern green',
            finish: 'Matte',
            inventory: { create: { quantity: 12 } },
          },
          {
            name: 'Warm cream matte',
            sku: 'FERN-DESK-001-CRM',
            colour: 'Warm cream',
            finish: 'Matte',
            inventory: { create: { quantity: 12 } },
          },
        ],
      },
    },
  });

  await prisma.productImage.upsert({
    where: { id: 'seed-modular-desk-organiser-primary' },
    update: {
      url: '/catalogue/desk-organiser.svg',
      altText: 'Green modular 3D-printed desk organiser',
      isPrimary: true,
    },
    create: {
      id: 'seed-modular-desk-organiser-primary',
      productId: product.id,
      url: '/catalogue/desk-organiser.svg',
      altText: 'Green modular 3D-printed desk organiser',
      isPrimary: true,
    },
  });

  await prisma.productApprovalEvent.upsert({
    where: { id: 'seed-modular-desk-organiser-published' },
    update: { newStatus: ProductStatus.PUBLISHED },
    create: {
      id: 'seed-modular-desk-organiser-published',
      productId: product.id,
      actorId: admin.id,
      previousStatus: ProductStatus.APPROVED,
      newStatus: ProductStatus.PUBLISHED,
      note: 'Seeded approved product for seller dashboard demonstration.',
    },
  });

  const pendingProduct = await prisma.product.upsert({
    where: { slug: 'stackable-tool-tray' },
    update: { status: ProductStatus.PENDING_REVIEW, publishedAt: null },
    create: {
      sellerId: seller.id,
      categoryId: deskCategory.id,
      name: 'Stackable Tool Tray',
      slug: 'stackable-tool-tray',
      shortDescription: 'A modular tray for precision tools and small workshop parts.',
      fullDescription:
        'Interlocking workshop trays with labelled compartments and reinforced corners for everyday maker tools.',
      basePrice: '649.00',
      sku: 'FERN-TRAY-REVIEW-001',
      material: 'PETG',
      finish: 'Matte',
      colour: 'Fern green',
      processingDays: 4,
      shippingOrigin: 'Pune, Maharashtra',
      customisationEnabled: true,
      safetyNotes: 'Not intended for food contact.',
      ipDeclaration: 'Original seller design available for marketplace production.',
      searchKeywords: ['tool tray', 'workshop storage', 'stackable organiser'],
      status: ProductStatus.PENDING_REVIEW,
    },
  });
  await prisma.productImage.upsert({
    where: { id: 'seed-stackable-tool-tray-primary' },
    update: { url: '/catalogue/desk-organiser.svg', altText: 'Green stackable tool tray' },
    create: {
      id: 'seed-stackable-tool-tray-primary',
      productId: pendingProduct.id,
      url: '/catalogue/desk-organiser.svg',
      altText: 'Green stackable tool tray',
      isPrimary: true,
    },
  });
  await prisma.inventory.upsert({
    where: { productId: pendingProduct.id },
    update: { quantity: 12 },
    create: { productId: pendingProduct.id, quantity: 12 },
  });
  await prisma.productApprovalEvent.upsert({
    where: { id: 'seed-stackable-tool-tray-submitted' },
    update: { newStatus: ProductStatus.PENDING_REVIEW },
    create: {
      id: 'seed-stackable-tool-tray-submitted',
      productId: pendingProduct.id,
      actorId: sellerUser.id,
      previousStatus: ProductStatus.DRAFT,
      newStatus: ProductStatus.PENDING_REVIEW,
      note: 'Submitted for marketplace approval.',
    },
  });

  const searchProductSeeds = [
    {
      catalogueId: 'product-phone-minimal',
      name: 'Minimal Phone Stand',
      sellerSlug: 'pixel-crafts',
      slug: 'minimal-phone-stand',
      shortDescription: 'A compact angled stand that keeps your phone comfortably in view.',
      fullDescription:
        'A stable case-friendly phone stand with a charging cable channel for calm, clutter-free desks.',
      basePrice: '349.00',
      compareAtPrice: '449.00',
      sku: 'FERN-PHONE-MINIMAL-001',
      material: 'PLA',
      finish: 'Matte',
      colour: 'Charcoal',
      processingDays: 2,
      customisationEnabled: true,
      tags: ['phone stand', 'desk accessory', 'charging'],
      searchKeywords: ['phone', 'stand', 'mobile holder', 'smartphone dock'],
      imageUrl: '/catalogue/minimal-phone-stand.svg',
      altText: 'Minimal charcoal 3D-printed phone stand',
      quantity: 18,
      variantColours: ['Charcoal', 'Fern green', 'Warm cream'],
    },
    {
      catalogueId: 'product-phone-adjustable',
      name: 'Adjustable Phone Stand',
      sellerSlug: 'makeform-works',
      slug: 'adjustable-phone-stand',
      shortDescription: 'A tilting phone stand for calls, recipes, and comfortable viewing.',
      fullDescription:
        'An adjustable stand with a smooth pin joint, broad ledge, and folding support for phones with protective cases.',
      basePrice: '499.00',
      compareAtPrice: null,
      sku: 'FERN-PHONE-ADJUST-001',
      material: 'PETG',
      finish: 'Satin',
      colour: 'Forest green',
      processingDays: 3,
      customisationEnabled: true,
      tags: ['phone stand', 'adjustable stand', 'video calls'],
      searchKeywords: ['phone', 'stand', 'mobile holder', 'adjustable phone dock'],
      imageUrl: '/catalogue/minimal-phone-stand.svg',
      altText: 'Adjustable forest green 3D-printed phone stand',
      quantity: 16,
      variantColours: ['Charcoal', 'Forest green', 'Stone'],
    },
    {
      catalogueId: 'product-phone-foldable',
      name: 'Foldable Travel Phone Stand',
      sellerSlug: 'pixel-crafts',
      slug: 'foldable-travel-phone-stand',
      shortDescription: 'A pocket-sized phone stand that folds flat for travel and commutes.',
      fullDescription:
        'A lightweight two-position mobile stand that folds into a slim shape for travel, café tables, and compact desks.',
      basePrice: '279.00',
      compareAtPrice: '329.00',
      sku: 'FERN-PHONE-FOLD-001',
      material: 'PLA',
      finish: 'Matte',
      colour: 'Fern green',
      processingDays: 2,
      customisationEnabled: false,
      tags: ['phone stand', 'travel accessory', 'foldable'],
      searchKeywords: ['phone', 'stand', 'portable mobile holder', 'compact phone dock'],
      imageUrl: '/catalogue/minimal-phone-stand.svg',
      altText: 'Foldable fern green 3D-printed travel phone stand',
      quantity: 31,
      variantColours: ['Fern green', 'Clay', 'Warm cream'],
    },
    {
      catalogueId: 'product-planter',
      name: 'Geometric Succulent Planter',
      sellerSlug: 'fern-fabrication',
      slug: 'geometric-succulent-planter',
      shortDescription: 'A faceted planter with a hidden drainage tray for small indoor plants.',
      fullDescription:
        'A sculptural indoor planter with a removable liner and concealed drip tray for tidy watering.',
      basePrice: '449.00',
      compareAtPrice: '549.00',
      sku: 'FERN-PLANTER-001',
      material: 'Wood PLA',
      finish: 'Textured',
      colour: 'Sage',
      processingDays: 3,
      customisationEnabled: true,
      tags: ['planter', 'home decor', 'succulent'],
      searchKeywords: ['plant pot', 'geometric planter', 'indoor garden'],
      imageUrl: '/catalogue/geometric-planter.svg',
      altText: 'Sage geometric 3D-printed succulent planter',
      quantity: 15,
      variantColours: ['Sage', 'Stone', 'Terracotta'],
    },
  ] as const;

  for (const searchProductSeed of searchProductSeeds) {
    const categoryId = searchProductSeed.slug.includes('planter')
      ? homeCategory.id
      : phoneCategory.id;
    const searchProductSeller = searchSellers.get(searchProductSeed.sellerSlug);
    if (!searchProductSeller) throw new Error('Required seed seller could not be created');
    const searchableProduct = await prisma.product.upsert({
      where: { slug: searchProductSeed.slug },
      update: {
        sellerId: searchProductSeller.id,
        categoryId,
        name: searchProductSeed.name,
        shortDescription: searchProductSeed.shortDescription,
        fullDescription: searchProductSeed.fullDescription,
        basePrice: searchProductSeed.basePrice,
        compareAtPrice: searchProductSeed.compareAtPrice,
        material: searchProductSeed.material,
        finish: searchProductSeed.finish,
        colour: searchProductSeed.colour,
        processingDays: searchProductSeed.processingDays,
        customisationEnabled: searchProductSeed.customisationEnabled,
        tags: [...searchProductSeed.tags],
        searchKeywords: [...searchProductSeed.searchKeywords],
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      create: {
        sellerId: searchProductSeller.id,
        categoryId,
        name: searchProductSeed.name,
        slug: searchProductSeed.slug,
        shortDescription: searchProductSeed.shortDescription,
        fullDescription: searchProductSeed.fullDescription,
        basePrice: searchProductSeed.basePrice,
        compareAtPrice: searchProductSeed.compareAtPrice,
        sku: searchProductSeed.sku,
        material: searchProductSeed.material,
        finish: searchProductSeed.finish,
        colour: searchProductSeed.colour,
        processingDays: searchProductSeed.processingDays,
        shippingOrigin: 'Pune, Maharashtra',
        customisationEnabled: searchProductSeed.customisationEnabled,
        ipDeclaration: 'Original seller design available for marketplace production.',
        tags: [...searchProductSeed.tags],
        searchKeywords: [...searchProductSeed.searchKeywords],
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    await prisma.productImage.upsert({
      where: { id: `seed-${searchProductSeed.slug}-primary` },
      update: {
        url: searchProductSeed.imageUrl,
        altText: searchProductSeed.altText,
        isPrimary: true,
      },
      create: {
        id: `seed-${searchProductSeed.slug}-primary`,
        productId: searchableProduct.id,
        url: searchProductSeed.imageUrl,
        altText: searchProductSeed.altText,
        isPrimary: true,
      },
    });

    await prisma.inventory.upsert({
      where: { productId: searchableProduct.id },
      update: { quantity: searchProductSeed.quantity },
      create: { productId: searchableProduct.id, quantity: searchProductSeed.quantity },
    });

    for (const [variantIndex, colour] of searchProductSeed.variantColours.entries()) {
      const variantNumber = variantIndex + 1;
      const variant = await prisma.productVariant.upsert({
        where: { sku: `${searchProductSeed.sku}-V${variantNumber}` },
        update: {
          name: `${colour} ${searchProductSeed.finish}`,
          material: searchProductSeed.material,
          colour,
          finish: searchProductSeed.finish,
          priceDelta: variantIndex === 2 ? '50.00' : '0.00',
          isActive: true,
        },
        create: {
          id: `${searchProductSeed.catalogueId}-variant-${variantNumber}`,
          productId: searchableProduct.id,
          name: `${colour} ${searchProductSeed.finish}`,
          sku: `${searchProductSeed.sku}-V${variantNumber}`,
          material: searchProductSeed.material,
          colour,
          finish: searchProductSeed.finish,
          priceDelta: variantIndex === 2 ? '50.00' : '0.00',
        },
      });
      await prisma.inventory.upsert({
        where: { variantId: variant.id },
        update: { quantity: searchProductSeed.quantity },
        create: { variantId: variant.id, quantity: searchProductSeed.quantity },
      });
    }
  }

  await prisma.favourite.upsert({
    where: { userId_productId: { userId: buyer.id, productId: product.id } },
    update: {},
    create: { userId: buyer.id, productId: product.id },
  });

  const sellerOrderSeeds = [
    {
      id: 'seed-seller-order-paid',
      itemId: 'seed-seller-order-paid-item',
      orderNumber: 'FMV-2026-1001',
      status: OrderStatus.PAID,
      quantity: 1,
      unitPrice: '899.00',
      tax: '161.82',
      shippingFee: '79.00',
      placedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'seed-seller-order-production',
      itemId: 'seed-seller-order-production-item',
      orderNumber: 'FMV-2026-0994',
      status: OrderStatus.IN_PRODUCTION,
      quantity: 2,
      unitPrice: '899.00',
      tax: '323.64',
      shippingFee: '99.00',
      placedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'seed-seller-order-delivered',
      itemId: 'seed-seller-order-delivered-item',
      orderNumber: 'FMV-2026-0941',
      status: OrderStatus.DELIVERED,
      quantity: 1,
      unitPrice: '899.00',
      tax: '161.82',
      shippingFee: '79.00',
      placedAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000),
    },
  ] as const;

  for (const orderSeed of sellerOrderSeeds) {
    const subtotal = Number(orderSeed.unitPrice) * orderSeed.quantity;
    const grandTotal = subtotal + Number(orderSeed.tax) + Number(orderSeed.shippingFee);
    await prisma.order.upsert({
      where: { orderNumber: orderSeed.orderNumber },
      update: { status: orderSeed.status, placedAt: orderSeed.placedAt },
      create: {
        id: orderSeed.id,
        orderNumber: orderSeed.orderNumber,
        buyerId: buyer.id,
        status: orderSeed.status,
        subtotal: subtotal.toFixed(2),
        taxTotal: orderSeed.tax,
        shippingTotal: orderSeed.shippingFee,
        grandTotal: grandTotal.toFixed(2),
        placedAt: orderSeed.placedAt,
      },
    });
    await prisma.orderItem.upsert({
      where: { id: orderSeed.itemId },
      update: { quantity: orderSeed.quantity, unitPrice: orderSeed.unitPrice },
      create: {
        id: orderSeed.itemId,
        orderId: orderSeed.id,
        productId: product.id,
        sellerId: seller.id,
        productNameSnapshot: product.name,
        sellerNameSnapshot: seller.storeName,
        productImageSnapshot: '/catalogue/desk-organiser.svg',
        quantity: orderSeed.quantity,
        unitPrice: orderSeed.unitPrice,
        tax: orderSeed.tax,
        shippingFee: orderSeed.shippingFee,
      },
    });
    await prisma.sellerOrderFulfilment.upsert({
      where: { orderId_sellerId: { orderId: orderSeed.id, sellerId: seller.id } },
      update: { status: orderSeed.status },
      create: {
        id: `${orderSeed.id}-fulfilment`,
        orderId: orderSeed.id,
        sellerId: seller.id,
        status: orderSeed.status,
      },
    });
    await prisma.orderStatusEvent.upsert({
      where: { id: `${orderSeed.id}-status` },
      update: { status: orderSeed.status },
      create: {
        id: `${orderSeed.id}-status`,
        orderId: orderSeed.id,
        sellerId: seller.id,
        actorId: sellerUser.id,
        previousStatus: orderSeed.status === OrderStatus.PAID ? OrderStatus.PENDING_PAYMENT : null,
        status: orderSeed.status,
        note: 'Seeded fulfilment state for dashboard demonstration.',
        createdAt: orderSeed.placedAt,
      },
    });
  }

  await prisma.review.upsert({
    where: { id: 'seed-delivered-product-review' },
    update: { status: ReviewStatus.PUBLISHED },
    create: {
      id: 'seed-delivered-product-review',
      productId: product.id,
      authorId: buyer.id,
      orderItemId: 'seed-seller-order-delivered-item',
      rating: 5,
      qualityRating: 5,
      finishRating: 5,
      accuracyRating: 5,
      valueRating: 4,
      title: 'Beautifully finished and practical',
      body: 'The organiser arrived exactly as described and keeps the whole desk noticeably tidier.',
      status: ReviewStatus.PUBLISHED,
    },
  });
  await prisma.sellerReview.upsert({
    where: { orderItemId: 'seed-seller-order-delivered-item' },
    update: { status: ReviewStatus.PUBLISHED },
    create: {
      id: 'seed-delivered-seller-review',
      sellerId: seller.id,
      authorId: buyer.id,
      orderItemId: 'seed-seller-order-delivered-item',
      rating: 5,
      communicationRating: 5,
      dispatchSpeedRating: 5,
      customisationRating: 5,
      status: ReviewStatus.PUBLISHED,
    },
  });
  await prisma.auditLog.upsert({
    where: { id: 'seed-product-publication-audit' },
    update: {},
    create: {
      id: 'seed-product-publication-audit',
      actorId: admin.id,
      action: 'PRODUCT_APPROVE_AND_PUBLISH',
      entityType: 'PRODUCT',
      entityId: product.id,
      previousState: { status: ProductStatus.APPROVED },
      newState: { status: ProductStatus.PUBLISHED },
      reason: 'Seeded audit event for administration demonstration.',
    },
  });
}

main().finally(async () => prisma.$disconnect());
