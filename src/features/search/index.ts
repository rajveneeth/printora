export { GuidedSearch, SearchAutocomplete } from './components';
export type { GuidedSearchProps } from './components';
export type {
  ProductSearchRepository,
  RecentSearch,
  SearchAutocompleteProps,
  SearchSuggestion,
  SearchSuggestionKind,
  SearchSuggestionRequest,
  SearchSuggestionsResponse,
} from './models';
export {
  searchSuggestionRequestSchema,
  searchSuggestionSchema,
  searchSuggestionsResponseSchema,
} from './schemas';
export {
  clearRecentSearches,
  parseSearchFilters,
  readRecentSearches,
  recentSearchToSuggestion,
  saveRecentSearch,
  searchProducts,
  searchSuggestions,
} from './services';
