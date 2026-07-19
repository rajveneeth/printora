import { parseCatalogueFilters } from '@/features/catalogue';
import type {
  CatalogueFilters,
  CatalogueResult,
  CatalogueSearchParams,
} from '@/features/catalogue';
import { searchSuggestionRequestSchema } from '@/features/search/schemas';
import type {
  ProductSearchRepository,
  SearchSuggestion,
  SearchSuggestionRequest,
} from '@/features/search/models';

export const parseSearchFilters = (searchParams: CatalogueSearchParams): CatalogueFilters =>
  parseCatalogueFilters(searchParams, 'relevance');

const loadDatabaseSearchRepository = async (): Promise<ProductSearchRepository> =>
  (await import('@/features/search/repositories/prisma-search.repository'))
    .databaseSearchRepository;

export const searchProducts = async (
  filters: CatalogueFilters,
  repository?: ProductSearchRepository,
): Promise<CatalogueResult> =>
  (repository ?? (await loadDatabaseSearchRepository())).search(filters);

export const searchSuggestions = async (
  request: SearchSuggestionRequest,
  repository?: ProductSearchRepository,
): Promise<readonly SearchSuggestion[]> => {
  const validatedRequest = searchSuggestionRequestSchema.parse(request);
  const selectedRepository = repository ?? (await loadDatabaseSearchRepository());
  return selectedRepository
    .suggestions({
      query: validatedRequest.query,
      ...(validatedRequest.category ? { category: validatedRequest.category } : {}),
    })
    .then((suggestions) => suggestions.slice(0, 5));
};
