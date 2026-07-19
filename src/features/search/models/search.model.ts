import type { CatalogueFilters, CatalogueResult } from '@/features/catalogue';

export type SearchSuggestionKind = 'product' | 'category' | 'seller' | 'popular' | 'recent';

export interface SearchSuggestion {
  readonly id: string;
  readonly kind: SearchSuggestionKind;
  readonly label: string;
  readonly description: string;
  readonly href: string;
}

export interface SearchSuggestionsResponse {
  readonly suggestions: readonly SearchSuggestion[];
}

export interface SearchSuggestionRequest {
  readonly query: string;
  readonly category?: string;
}

export interface RecentSearch {
  readonly query: string;
  readonly category?: string;
}

export interface ProductSearchRepository {
  search(filters: CatalogueFilters): Promise<CatalogueResult>;
  suggestions(request: SearchSuggestionRequest): Promise<readonly SearchSuggestion[]>;
}

export interface SearchAutocompleteProps {
  readonly id: string;
  readonly initialQuery?: string;
  readonly category?: string;
  readonly placeholder?: string;
  readonly compact?: boolean;
  readonly onNavigate?: () => void;
}
