import type { CatalogueFilters, CategorySummary } from '@/features/catalogue/models';

export interface FilterSidebarProps {
  readonly categories: readonly CategorySummary[];
  readonly filters: CatalogueFilters;
  readonly materials: readonly string[];
  readonly pathname: string;
  readonly showCategory?: boolean;
  readonly idPrefix?: string;
}
