import {
  calculateDiscountPercentage,
  formatPrice,
  listCatalogueProducts,
  parseCatalogueFilters,
} from '@/features/catalogue/services';

describe('catalogue service', () => {
  it('normalises supported URL filters and falls back from unsafe values', () => {
    expect(
      parseCatalogueFilters({
        category: 'home-decor',
        customisable: 'true',
        maxPrice: '1000',
        page: '-2',
        sort: 'unexpected',
      }),
    ).toEqual({
      category: 'home-decor',
      customisable: true,
      maxPrice: 1000,
      page: 1,
      sort: 'featured',
    });
  });

  it('filters catalogue products by category, material, price, and availability', () => {
    const result = listCatalogueProducts({
      category: 'home-decor',
      material: 'Wood PLA',
      maxPrice: 900,
      inStock: true,
      page: 1,
      sort: 'price-low',
    });

    expect(result.products.length).toBeGreaterThan(0);
    expect(result.products.every((product) => product.category.slug === 'home-decor')).toBe(true);
    expect(
      result.products.every((product) => product.availableMaterials.includes('Wood PLA')),
    ).toBe(true);
    expect(result.products.every((product) => product.priceInPaise <= 90000)).toBe(true);
  });

  it('sorts by price and clamps pagination to the available page count', () => {
    const result = listCatalogueProducts({ page: 99, sort: 'price-low' });
    const prices = result.products.map((product) => product.priceInPaise);

    expect(result.currentPage).toBe(result.totalPages);
    expect(prices).toEqual([...prices].sort((left, right) => left - right));
  });

  it('returns no results for an unmatched search phrase', () => {
    const result = listCatalogueProducts({
      query: 'nonexistent titanium submarine',
      page: 1,
      sort: 'featured',
    });
    expect(result.products).toHaveLength(0);
    expect(result.totalProducts).toBe(0);
  });

  it('formats Indian pricing and calculates only valid discounts', () => {
    expect(formatPrice(119900)).toBe('₹1,199');
    expect(calculateDiscountPercentage(80000, 100000)).toBe(20);
    expect(calculateDiscountPercentage(100000, 90000)).toBeNull();
  });
});
