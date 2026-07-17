import type { CatalogueFilters } from '@/features/catalogue/models';

export interface PaginationProps {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly pathname: string;
  readonly filters: CatalogueFilters;
}
