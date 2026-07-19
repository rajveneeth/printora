import type { CategorySummary } from '@/features/catalogue';

export interface GuidedSearchProps {
  readonly categories: readonly CategorySummary[];
  readonly initialQuery?: string;
  readonly initialCategory?: string;
}
