import type { Prisma, PrismaClient } from '@prisma/client';
import { createCatalogueResult } from '@/features/catalogue';
import type {
  CatalogueFilters,
  CatalogueProduct,
  ProductVariantSummary,
} from '@/features/catalogue';
import type { ProductSearchRepository, SearchSuggestion } from '@/features/search/models';

const SEARCH_RESULT_INCLUDE = {
  category: true,
  seller: true,
  images: { orderBy: [{ isPrimary: 'desc' }, { position: 'asc' }] },
  inventory: true,
  variants: { orderBy: { name: 'asc' } },
  reviews: { where: { status: 'PUBLISHED' }, select: { rating: true } },
} satisfies Prisma.ProductInclude;

type DatabaseSearchProduct = Prisma.ProductGetPayload<{
  include: typeof SEARCH_RESULT_INCLUDE;
}>;
type DatabaseProductVariant = DatabaseSearchProduct['variants'][number];
type DatabaseReview = DatabaseSearchProduct['reviews'][number];
type SearchDatabaseClient = Pick<PrismaClient, 'product' | 'category' | 'sellerProfile'>;

const POPULAR_SEARCHES = [
  'phone stand',
  'desk organiser',
  'custom name plate',
  'geometric planter',
  'replacement knob',
] as const;

export const normaliseSearchTerms = (query?: string): readonly string[] =>
  query
    ?.toLocaleLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean)
    .slice(0, 8) ?? [];

const textContains = (value: string): Prisma.StringFilter => ({
  contains: value,
  mode: 'insensitive',
});

export const buildPublishedProductWhere = (filters: CatalogueFilters): Prisma.ProductWhereInput => {
  const conditions: Prisma.ProductWhereInput[] = normaliseSearchTerms(filters.query).map(
    (term) => ({
      OR: [
        { name: textContains(term) },
        { shortDescription: textContains(term) },
        { fullDescription: textContains(term) },
        { category: { name: textContains(term) } },
        { seller: { storeName: textContains(term) } },
        { material: textContains(term) },
        { tags: { has: term } },
        { searchKeywords: { has: term } },
      ],
    }),
  );

  if (filters.category) conditions.push({ category: { slug: filters.category } });
  if (filters.material)
    conditions.push({
      OR: [
        { material: { equals: filters.material, mode: 'insensitive' } },
        { variants: { some: { material: { equals: filters.material, mode: 'insensitive' } } } },
      ],
    });
  if (filters.colour)
    conditions.push({
      OR: [
        { colour: { equals: filters.colour, mode: 'insensitive' } },
        { variants: { some: { colour: { equals: filters.colour, mode: 'insensitive' } } } },
      ],
    });
  if (filters.minPrice !== undefined) conditions.push({ basePrice: { gte: filters.minPrice } });
  if (filters.maxPrice !== undefined) conditions.push({ basePrice: { lte: filters.maxPrice } });
  if (filters.customisable) conditions.push({ customisationEnabled: true });
  if (filters.sellerLocation)
    conditions.push({
      seller: {
        OR: [
          { originCity: textContains(filters.sellerLocation) },
          { originState: textContains(filters.sellerLocation) },
        ],
      },
    });
  if (filters.maximumProcessingDays !== undefined)
    conditions.push({ processingDays: { lte: filters.maximumProcessingDays } });
  if (filters.inStock) conditions.push({ inventory: { is: { quantity: { gt: 0 } } } });

  return {
    status: 'PUBLISHED',
    publishedAt: { not: null },
    seller: { verificationStatus: 'APPROVED', user: { status: 'ACTIVE' } },
    ...(conditions.length ? { AND: conditions } : {}),
  };
};

const databaseNumber = (value: unknown): number => {
  const numberValue = typeof value === 'number' ? value : Number(String(value));
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const databasePriceToPaise = (value: unknown): number => Math.round(databaseNumber(value) * 100);

const mapVariant = (
  variant: DatabaseProductVariant,
  product: DatabaseSearchProduct,
): ProductVariantSummary => ({
  id: variant.id,
  name: variant.name,
  material: variant.material ?? product.material,
  colour: variant.colour ?? product.colour ?? 'Made to order',
  finish: variant.finish ?? product.finish ?? 'Matte',
  priceDeltaInPaise: databasePriceToPaise(variant.priceDelta),
});

const averageReviewRating = (reviews: readonly DatabaseReview[], fallback: number): number => {
  if (!reviews.length) return fallback;
  return reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;
};

const mapDatabaseProduct = (product: DatabaseSearchProduct): CatalogueProduct => {
  const sellerRating = databaseNumber(product.seller.averageRating);
  const imageUrls = product.images.map((image) => image.url);
  const imageUrl =
    imageUrls.find((url) => url.startsWith('/catalogue/')) ??
    imageUrls[0] ??
    '/catalogue/hero-studio.svg';
  const availableMaterials = Array.from(
    new Set([
      product.material,
      ...product.variants.flatMap((variant) => (variant.material ? [variant.material] : [])),
    ]),
  );
  const colours = Array.from(
    new Set([
      ...(product.colour ? [product.colour] : []),
      ...product.variants.flatMap((variant) => (variant.colour ? [variant.colour] : [])),
    ]),
  );
  const stock = Math.max(
    0,
    (product.inventory?.quantity ?? 0) - (product.inventory?.reserved ?? 0),
  );
  const rating = averageReviewRating(product.reviews, sellerRating);
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.fullDescription,
    category: {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
      description: product.category.description ?? '',
      imageUrl,
      productCount: 0,
    },
    seller: {
      id: product.seller.id,
      name: product.seller.storeName,
      slug: product.seller.storeSlug,
      city: product.seller.originCity,
      state: product.seller.originState,
      rating: sellerRating,
      completedOrders: product.seller.completedOrderCount,
      supportedMaterials: product.seller.supportedMaterials,
      verified: true,
    },
    priceInPaise: databasePriceToPaise(product.basePrice),
    ...(product.compareAtPrice === null
      ? {}
      : { compareAtPriceInPaise: databasePriceToPaise(product.compareAtPrice) }),
    currency: 'INR',
    rating,
    reviewCount: product.reviews.length,
    imageUrl,
    gallery: imageUrls.length ? imageUrls : [imageUrl],
    material: product.material,
    availableMaterials,
    colours: colours.length ? colours : ['Made to order'],
    finish: product.finish ?? 'Matte',
    dimensions: product.dimensions ?? 'See product details',
    weightGrams: product.weightGrams ?? 0,
    processingDays: product.processingDays,
    estimatedDeliveryDays: product.processingDays + 4,
    customisable: product.customisationEnabled,
    stock,
    highlights: [
      product.material,
      product.finish ?? 'Made to order',
      product.customisationEnabled ? 'Customisation available' : 'Ready-made design',
    ],
    tags: product.tags,
    searchKeywords: product.searchKeywords,
    createdAt: product.createdAt.toISOString(),
    popularity: product.seller.completedOrderCount + product.reviews.length * 10,
    variants: product.variants.map((variant) => mapVariant(variant, product)),
  };
};

const searchHref = (query: string, category?: string): string => {
  const parameters = new URLSearchParams({ q: query });
  if (category) parameters.set('category', category);
  return `/search?${parameters.toString()}`;
};

const suggestionWhere = (query: string, category?: string): Prisma.ProductWhereInput => ({
  status: 'PUBLISHED',
  publishedAt: { not: null },
  seller: { verificationStatus: 'APPROVED', user: { status: 'ACTIVE' } },
  ...(category ? { category: { slug: category } } : {}),
  OR: [
    { name: textContains(query) },
    { shortDescription: textContains(query) },
    { searchKeywords: { has: query.toLocaleLowerCase() } },
  ],
});

const mergeSuggestions = (
  productSuggestions: readonly SearchSuggestion[],
  categorySuggestions: readonly SearchSuggestion[],
  sellerSuggestions: readonly SearchSuggestion[],
  popularSuggestions: readonly SearchSuggestion[],
): readonly SearchSuggestion[] => {
  const ordered = [
    ...productSuggestions.slice(0, 2),
    ...categorySuggestions.slice(0, 1),
    ...sellerSuggestions.slice(0, 1),
    ...popularSuggestions.slice(0, 1),
    ...productSuggestions.slice(2),
    ...categorySuggestions.slice(1),
    ...sellerSuggestions.slice(1),
    ...popularSuggestions.slice(1),
  ];
  return ordered.slice(0, 5);
};

export const createDatabaseSearchRepository = (
  database: SearchDatabaseClient,
): ProductSearchRepository => ({
  async search(filters) {
    const databaseProducts = await database.product.findMany({
      where: buildPublishedProductWhere(filters),
      include: SEARCH_RESULT_INCLUDE,
      orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }],
    });
    return createCatalogueResult(databaseProducts.map(mapDatabaseProduct), filters);
  },
  async suggestions(request) {
    const [databaseProducts, databaseCategories, databaseSellers] = await Promise.all([
      database.product.findMany({
        where: suggestionWhere(request.query, request.category),
        include: SEARCH_RESULT_INCLUDE,
        orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }],
        take: 5,
      }),
      database.category.findMany({
        where: {
          isActive: true,
          name: textContains(request.query),
          products: {
            some: {
              status: 'PUBLISHED',
              publishedAt: { not: null },
              seller: { verificationStatus: 'APPROVED', user: { status: 'ACTIVE' } },
            },
          },
        },
        orderBy: [{ position: 'asc' }, { name: 'asc' }],
        take: 3,
      }),
      database.sellerProfile.findMany({
        where: {
          verificationStatus: 'APPROVED',
          user: { status: 'ACTIVE' },
          storeName: textContains(request.query),
          products: { some: { status: 'PUBLISHED', publishedAt: { not: null } } },
        },
        orderBy: [{ averageRating: 'desc' }, { storeName: 'asc' }],
        take: 3,
      }),
    ]);

    const productSuggestions = databaseProducts.map<SearchSuggestion>((product) => ({
      id: `product-${product.id}`,
      kind: 'product',
      label: product.name,
      description: `${product.category.name} · ${product.seller.storeName}`,
      href: `/products/${product.slug}`,
    }));
    const categorySuggestions = databaseCategories.map<SearchSuggestion>((category) => ({
      id: `category-${category.id}`,
      kind: 'category',
      label: category.name,
      description: 'Browse this product category',
      href: searchHref(category.name, category.slug),
    }));
    const sellerSuggestions = databaseSellers.map<SearchSuggestion>((seller) => ({
      id: `seller-${seller.id}`,
      kind: 'seller',
      label: seller.storeName,
      description: `${seller.originCity}, ${seller.originState}`,
      href: searchHref(seller.storeName, request.category),
    }));
    const normalisedQuery = request.query.toLocaleLowerCase();
    const popularSuggestions = POPULAR_SEARCHES.filter((term) =>
      term.includes(normalisedQuery),
    ).map<SearchSuggestion>((term) => ({
      id: `popular-${term.replaceAll(' ', '-')}`,
      kind: 'popular',
      label: term,
      description: 'Popular marketplace search',
      href: searchHref(term, request.category),
    }));

    return mergeSuggestions(
      productSuggestions,
      categorySuggestions,
      sellerSuggestions,
      popularSuggestions,
    );
  },
});
