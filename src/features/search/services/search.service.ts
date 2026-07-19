import { parseCatalogueFilters } from '@/features/catalogue';
import type {
  CatalogueFilters,
  CatalogueResult,
  CatalogueSearchParams,
} from '@/features/catalogue';
import { databaseSearchRepository } from '@/features/search/repositories';
import { searchSuggestionRequestSchema } from '@/features/search/schemas';
import type {
  ProductSearchRepository,
  SearchSuggestion,
  SearchSuggestionRequest,
} from '@/features/search/models';

export const parseSearchFilters = (searchParams: CatalogueSearchParams): CatalogueFilters =>
  parseCatalogueFilters(searchParams, 'relevance');

export const searchProducts = (
  filters: CatalogueFilters,
  repository: ProductSearchRepository = databaseSearchRepository,
): Promise<CatalogueResult> => repository.search(filters);

export const searchSuggestions = (
  request: SearchSuggestionRequest,
  repository: ProductSearchRepository = databaseSearchRepository,
): Promise<readonly SearchSuggestion[]> => {
  const validatedRequest = searchSuggestionRequestSchema.parse(request);
  return repository
    .suggestions({
      query: validatedRequest.query,
      ...(validatedRequest.category ? { category: validatedRequest.category } : {}),
    })
    .then((suggestions) => suggestions.slice(0, 5));
};
