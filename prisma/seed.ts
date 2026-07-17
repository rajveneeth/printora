import { PrismaClient, ProductStatus, SellerVerificationStatus, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

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

  const categories = await Promise.all(
    [
      ['Home and décor', 'home-decor'],
      ['Desk and workspace', 'desk-workspace'],
      ['Phone and electronics accessories', 'phone-electronics-accessories'],
    ].map(([name, slug], position) =>
      prisma.category.upsert({ where: { slug }, update: {}, create: { name, slug, position } }),
    ),
  );

  const product = await prisma.product.upsert({
    where: { slug: 'modular-desk-organiser' },
    update: {},
    create: {
      sellerId: seller.id,
      categoryId: categories[1].id,
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

  await prisma.favourite.upsert({
    where: { userId_productId: { userId: buyer.id, productId: product.id } },
    update: {},
    create: { userId: buyer.id, productId: product.id },
  });
}

main().finally(async () => prisma.$disconnect());
