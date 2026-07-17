import type { CategorySummary } from '@/features/catalogue/models';

export interface CategoryNavigationProps {
  readonly categories: readonly CategorySummary[];
  readonly compact?: boolean;
}
