import type { CatalogueResult, CategorySummary } from '@/features/catalogue/models';

export interface CatalogueListingProps {
  readonly title: string;
  readonly description: string;
  readonly result: CatalogueResult;
  readonly categories: readonly CategorySummary[];
  readonly materials: readonly string[];
  readonly pathname: string;
  readonly showCategory?: boolean;
}
