import type { CatalogueProduct } from '@/features/catalogue/models';

export interface ProductGridProps {
  readonly products: readonly CatalogueProduct[];
  readonly priorityCount?: number;
}
