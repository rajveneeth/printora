export type CatalogueSort =
  'featured' | 'rating' | 'price-low' | 'price-high' | 'newest' | 'fastest';

export interface CategorySummary {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly productCount: number;
}

export interface SellerSummary {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly city: string;
  readonly state: string;
  readonly rating: number;
  readonly completedOrders: number;
  readonly supportedMaterials: readonly string[];
  readonly verified: boolean;
}

export interface ProductVariantSummary {
  readonly id: string;
  readonly name: string;
  readonly material: string;
  readonly colour: string;
  readonly finish: string;
  readonly priceDeltaInPaise: number;
}

export interface CatalogueProduct {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly shortDescription: string;
  readonly description: string;
  readonly category: CategorySummary;
  readonly seller: SellerSummary;
  readonly priceInPaise: number;
  readonly compareAtPriceInPaise?: number;
  readonly currency: 'INR';
  readonly rating: number;
  readonly reviewCount: number;
  readonly imageUrl: string;
  readonly gallery: readonly string[];
  readonly material: string;
  readonly availableMaterials: readonly string[];
  readonly colours: readonly string[];
  readonly finish: string;
  readonly dimensions: string;
  readonly weightGrams: number;
  readonly processingDays: number;
  readonly customisable: boolean;
  readonly stock: number;
  readonly highlights: readonly string[];
  readonly createdAt: string;
  readonly popularity: number;
  readonly variants: readonly ProductVariantSummary[];
}

export interface CatalogueFilters {
  readonly query?: string;
  readonly category?: string;
  readonly material?: string;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly minimumRating?: number;
  readonly customisable?: boolean;
  readonly inStock?: boolean;
  readonly sort: CatalogueSort;
  readonly page: number;
}

export interface CatalogueResult {
  readonly products: readonly CatalogueProduct[];
  readonly totalProducts: number;
  readonly totalPages: number;
  readonly currentPage: number;
  readonly pageSize: number;
  readonly filters: CatalogueFilters;
}

export type CatalogueSearchParams = Record<string, string | readonly string[] | undefined>;
