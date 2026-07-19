import { buildCatalogueHref, listCatalogueProducts } from '@/features/catalogue';
import type { ProductSearchRepository, SearchSuggestion } from '@/features/search';
import { parseSearchFilters, searchProducts, searchSuggestions } from '@/features/search';
import { buildPublishedProductWhere, normaliseSearchTerms } from '@/features/search/repositories';

const repository: ProductSearchRepository = {
  search: async (filters) => listCatalogueProducts(filters),
  suggestions: async () =>
    Array.from({ length: 7 }, (_, index): SearchSuggestion => ({
      id: `suggestion-${index}`,
      kind: 'popular',
      label: `Suggestion ${index}`,
      description: 'Popular marketplace search',
      href: `/search?q=suggestion+${index}`,
    })),
};

describe('search service', () => {
  it('parses typed discovery filters with relevance as the search default', () => {
    expect(
      parseSearchFilters({
        q: 'phone stand',
        category: 'phone-electronics-accessories',
        colour: 'Fern green',
        location: 'Pune, Maharashtra',
        processingDays: '3',
        deliveryDays: '7',
      }),
    ).toEqual({
      query: 'phone stand',
      category: 'phone-electronics-accessories',
      colour: 'Fern green',
      sellerLocation: 'Pune, Maharashtra',
      maximumProcessingDays: 3,
      maximumDeliveryDays: 7,
      sort: 'relevance',
      page: 1,
    });
  });

  it('supports the category-aware phone stand workflow', async () => {
    const filters = parseSearchFilters({
      q: 'phone stand',
      category: 'phone-electronics-accessories',
    });
    const result = await searchProducts(filters, repository);

    expect(result.totalProducts).toBeGreaterThanOrEqual(3);
    expect(result.products[0]?.name).toBe('Minimal Phone Stand');
    expect(result.products.map((product) => product.slug)).toEqual(
      expect.arrayContaining([
        'minimal-phone-stand',
        'adjustable-phone-stand',
        'foldable-travel-phone-stand',
      ]),
    );
  });

  it('persists every active filter in generated result links', () => {
    const filters = parseSearchFilters({
      q: 'stand',
      category: 'phone-electronics-accessories',
      material: 'PETG',
      colour: 'Charcoal',
      location: 'Mumbai, Maharashtra',
      processingDays: '3',
      deliveryDays: '7',
      customisable: 'true',
    });
    const href = buildCatalogueHref('/search', filters, { page: 2 });

    expect(href).toContain('q=stand');
    expect(href).toContain('category=phone-electronics-accessories');
    expect(href).toContain('material=PETG');
    expect(href).toContain('colour=Charcoal');
    expect(href).toContain('location=Mumbai%2C+Maharashtra');
    expect(href).toContain('processingDays=3');
    expect(href).toContain('deliveryDays=7');
    expect(href).toContain('customisable=true');
    expect(href).toContain('page=2');
  });

  it('builds a public database query from normalised terms and caps suggestions', async () => {
    const where = buildPublishedProductWhere(
      parseSearchFilters({ q: '  Phone   Stand ', category: 'phone-electronics-accessories' }),
    );

    expect(normaliseSearchTerms('  Phone   Stand ')).toEqual(['phone', 'stand']);
    expect(where).toMatchObject({
      status: 'PUBLISHED',
      publishedAt: { not: null },
    });
    expect(JSON.stringify(where)).toContain('phone-electronics-accessories');
    await expect(searchSuggestions({ query: 'phone' }, repository)).resolves.toHaveLength(5);
  });
});
