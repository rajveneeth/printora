import { z } from 'zod';
import { categories, products } from '@/features/catalogue/data';
import type {
  CatalogueFilters,
  CatalogueProduct,
  CatalogueResult,
  CatalogueSearchParams,
  CatalogueSort,
  CategorySummary,
} from '@/features/catalogue/models';

const PAGE_SIZE = 8;
const allowedSorts = [
  'featured',
  'rating',
  'price-low',
  'price-high',
  'newest',
  'fastest',
] as const;

const searchSchema = z.object({
  q: z.string().trim().max(80).optional().catch(undefined),
  category: z.string().trim().max(80).optional().catch(undefined),
  material: z.string().trim().max(40).optional().catch(undefined),
  minPrice: z.coerce.number().int().min(0).max(1000000).optional().catch(undefined),
  maxPrice: z.coerce.number().int().min(0).max(1000000).optional().catch(undefined),
  rating: z.coerce.number().min(1).max(5).optional().catch(undefined),
  customisable: z.enum(['true']).optional().catch(undefined),
  inStock: z.enum(['true']).optional().catch(undefined),
  sort: z.enum(allowedSorts).default('featured').catch('featured'),
  page: z.coerce.number().int().positive().default(1).catch(1),
});

const firstValue = (value: string | readonly string[] | undefined): string | undefined =>
  typeof value === 'string' ? value : value?.[0];

export const parseCatalogueFilters = (searchParams: CatalogueSearchParams): CatalogueFilters => {
  const parsed = searchSchema.parse({
    q: firstValue(searchParams.q),
    category: firstValue(searchParams.category),
    material: firstValue(searchParams.material),
    minPrice: firstValue(searchParams.minPrice),
    maxPrice: firstValue(searchParams.maxPrice),
    rating: firstValue(searchParams.rating),
    customisable: firstValue(searchParams.customisable),
    inStock: firstValue(searchParams.inStock),
    sort: firstValue(searchParams.sort),
    page: firstValue(searchParams.page),
  });

  return {
    ...(parsed.q ? { query: parsed.q } : {}),
    ...(parsed.category ? { category: parsed.category } : {}),
    ...(parsed.material ? { material: parsed.material } : {}),
    ...(parsed.minPrice === undefined ? {} : { minPrice: parsed.minPrice }),
    ...(parsed.maxPrice === undefined ? {} : { maxPrice: parsed.maxPrice }),
    ...(parsed.rating === undefined ? {} : { minimumRating: parsed.rating }),
    ...(parsed.customisable ? { customisable: true } : {}),
    ...(parsed.inStock ? { inStock: true } : {}),
    sort: parsed.sort,
    page: parsed.page,
  };
};

const includesQuery = (product: CatalogueProduct, query: string): boolean => {
  const haystack = [
    product.name,
    product.shortDescription,
    product.description,
    product.category.name,
    product.seller.name,
    product.material,
    ...product.availableMaterials,
  ]
    .join(' ')
    .toLocaleLowerCase();
  return haystack.includes(query.toLocaleLowerCase());
};

const filterProduct = (product: CatalogueProduct, filters: CatalogueFilters): boolean => {
  if (filters.query && !includesQuery(product, filters.query)) return false;
  if (filters.category && product.category.slug !== filters.category) return false;
  if (filters.material && !product.availableMaterials.includes(filters.material)) return false;
  if (filters.minPrice !== undefined && product.priceInPaise < filters.minPrice * 100) return false;
  if (filters.maxPrice !== undefined && product.priceInPaise > filters.maxPrice * 100) return false;
  if (filters.minimumRating !== undefined && product.rating < filters.minimumRating) return false;
  if (filters.customisable && !product.customisable) return false;
  if (filters.inStock && product.stock <= 0) return false;
  return true;
};

const sortProducts = (
  catalogueProducts: readonly CatalogueProduct[],
  sort: CatalogueSort,
): CatalogueProduct[] => {
  const sorted = [...catalogueProducts];
  const comparators: Record<
    CatalogueSort,
    (left: CatalogueProduct, right: CatalogueProduct) => number
  > = {
    featured: (left, right) => right.popularity - left.popularity,
    rating: (left, right) => right.rating - left.rating || right.reviewCount - left.reviewCount,
    'price-low': (left, right) => left.priceInPaise - right.priceInPaise,
    'price-high': (left, right) => right.priceInPaise - left.priceInPaise,
    newest: (left, right) => right.createdAt.localeCompare(left.createdAt),
    fastest: (left, right) => left.processingDays - right.processingDays,
  };
  return sorted.sort(comparators[sort]);
};

export const listCatalogueProducts = (filters: CatalogueFilters): CatalogueResult => {
  const matchingProducts = sortProducts(
    products.filter((product) => filterProduct(product, filters)),
    filters.sort,
  );
  const totalPages = Math.max(1, Math.ceil(matchingProducts.length / PAGE_SIZE));
  const currentPage = Math.min(filters.page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  return {
    products: matchingProducts.slice(pageStart, pageStart + PAGE_SIZE),
    totalProducts: matchingProducts.length,
    totalPages,
    currentPage,
    pageSize: PAGE_SIZE,
    filters: { ...filters, page: currentPage },
  };
};

export const findProductBySlug = (slug: string): CatalogueProduct | null =>
  products.find((product) => product.slug === slug) ?? null;

export const findCategoryBySlug = (slug: string): CategorySummary | null =>
  categories.find((category) => category.slug === slug) ?? null;

export const listRelatedProducts = (
  product: CatalogueProduct,
  limit = 4,
): readonly CatalogueProduct[] =>
  products
    .filter(
      (candidate) => candidate.id !== product.id && candidate.category.id === product.category.id,
    )
    .slice(0, limit)
    .concat(
      products.filter(
        (candidate) => candidate.id !== product.id && candidate.seller.id === product.seller.id,
      ),
    )
    .slice(0, limit);

export const catalogueMaterials = Array.from(
  new Set(products.flatMap((product) => product.availableMaterials)),
).sort();

export const catalogueSortOptions: readonly {
  readonly label: string;
  readonly value: CatalogueSort;
}[] = [
  { label: 'Featured', value: 'featured' },
  { label: 'Highest rated', value: 'rating' },
  { label: 'Price: low to high', value: 'price-low' },
  { label: 'Price: high to low', value: 'price-high' },
  { label: 'Newest', value: 'newest' },
  { label: 'Fastest dispatch', value: 'fastest' },
];

export const formatPrice = (priceInPaise: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(priceInPaise / 100);

export const calculateDiscountPercentage = (
  priceInPaise: number,
  compareAtPriceInPaise?: number,
): number | null => {
  if (!compareAtPriceInPaise || compareAtPriceInPaise <= priceInPaise) return null;
  return Math.round(((compareAtPriceInPaise - priceInPaise) / compareAtPriceInPaise) * 100);
};

export const buildCatalogueHref = (
  pathname: string,
  filters: CatalogueFilters,
  overrides: Readonly<Record<string, string | number | boolean | undefined>> = {},
): string => {
  const values: Record<string, string | number | boolean | undefined> = {
    q: filters.query,
    category: filters.category,
    material: filters.material,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    rating: filters.minimumRating,
    customisable: filters.customisable,
    inStock: filters.inStock,
    sort: filters.sort === 'featured' ? undefined : filters.sort,
    page: filters.page === 1 ? undefined : filters.page,
    ...overrides,
  };
  const search = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== false && value !== '') search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
};
