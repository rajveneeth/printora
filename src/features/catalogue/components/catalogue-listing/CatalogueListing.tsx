import type { Route } from 'next';
import Link from 'next/link';
import { SlidersHorizontal, X } from 'lucide-react';
import { EmptyState } from '@/components/ui';
import { FilterSidebar } from '@/features/catalogue/components/filter-sidebar';
import { Pagination } from '@/features/catalogue/components/pagination';
import { ProductGrid } from '@/features/catalogue/components/product-grid';
import { buildCatalogueHref, catalogueSortOptions } from '@/features/catalogue/services';
import styles from './CatalogueListing.module.scss';
import type { CatalogueListingProps } from './CatalogueListing.model';

interface HiddenFilterFieldsProps {
  readonly filters: CatalogueListingProps['result']['filters'];
  readonly includeCategory: boolean;
}

function HiddenFilterFields({ filters, includeCategory }: HiddenFilterFieldsProps) {
  return (
    <>
      {filters.query ? <input type="hidden" name="q" value={filters.query} /> : null}
      {includeCategory && filters.category ? (
        <input type="hidden" name="category" value={filters.category} />
      ) : null}
      {filters.material ? <input type="hidden" name="material" value={filters.material} /> : null}
      {filters.minPrice !== undefined ? (
        <input type="hidden" name="minPrice" value={filters.minPrice} />
      ) : null}
      {filters.maxPrice !== undefined ? (
        <input type="hidden" name="maxPrice" value={filters.maxPrice} />
      ) : null}
      {filters.minimumRating !== undefined ? (
        <input type="hidden" name="rating" value={filters.minimumRating} />
      ) : null}
      {filters.customisable ? <input type="hidden" name="customisable" value="true" /> : null}
      {filters.inStock ? <input type="hidden" name="inStock" value="true" /> : null}
    </>
  );
}

export function CatalogueListing({
  title,
  description,
  result,
  categories,
  materials,
  pathname,
  showCategory = true,
}: CatalogueListingProps) {
  const { filters } = result;
  const filterChips = [
    filters.query ? { key: 'q', label: `“${filters.query}”` } : null,
    filters.category && showCategory
      ? {
          key: 'category',
          label:
            categories.find((category) => category.slug === filters.category)?.name ??
            filters.category,
        }
      : null,
    filters.material ? { key: 'material', label: filters.material } : null,
    filters.minPrice !== undefined ? { key: 'minPrice', label: `From ₹${filters.minPrice}` } : null,
    filters.maxPrice !== undefined
      ? { key: 'maxPrice', label: `Up to ₹${filters.maxPrice}` }
      : null,
    filters.minimumRating !== undefined
      ? { key: 'rating', label: `${filters.minimumRating}+ stars` }
      : null,
    filters.customisable ? { key: 'customisable', label: 'Customisable' } : null,
    filters.inStock ? { key: 'inStock', label: 'In stock' } : null,
  ].filter((chip): chip is { key: string; label: string } => chip !== null);

  return (
    <section className={styles.root} aria-labelledby="catalogue-title">
      <div className={styles.intro}>
        <div>
          <p className={styles.eyebrow}>Independent maker marketplace</p>
          <h1 id="catalogue-title">{title}</h1>
          <p>{description}</p>
        </div>
        <div className={styles.summary} aria-live="polite">
          <b>{result.totalProducts}</b>
          <span>{result.totalProducts === 1 ? 'creation' : 'creations'}</span>
        </div>
      </div>
      <div className={styles.mobileTools}>
        <details>
          <summary>
            <SlidersHorizontal size={17} /> Filters
          </summary>
          <div className={styles.mobileFilterPanel}>
            <FilterSidebar
              categories={categories}
              filters={filters}
              materials={materials}
              pathname={pathname}
              showCategory={showCategory}
              idPrefix="mobile-catalogue"
            />
          </div>
        </details>
      </div>
      <div className={styles.toolbar}>
        <div className={styles.chips} aria-label="Active filters">
          {filterChips.map((chip) => (
            <Link
              key={chip.key}
              href={
                buildCatalogueHref(pathname, filters, { [chip.key]: undefined, page: 1 }) as Route
              }
              aria-label={`Remove ${chip.label} filter`}
            >
              {chip.label}
              <X size={13} />
            </Link>
          ))}
          {filterChips.length > 1 ? <Link href={pathname as Route}>Clear all</Link> : null}
        </div>
        <form className={styles.sort} action={pathname} method="get">
          <HiddenFilterFields filters={filters} includeCategory={showCategory} />
          <label htmlFor="catalogue-sort">Sort by</label>
          <select id="catalogue-sort" name="sort" defaultValue={filters.sort}>
            {catalogueSortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button type="submit">Apply</button>
        </form>
      </div>
      <div className={styles.layout}>
        <aside aria-label="Filter products">
          <FilterSidebar
            categories={categories}
            filters={filters}
            materials={materials}
            pathname={pathname}
            showCategory={showCategory}
            idPrefix="desktop-catalogue"
          />
        </aside>
        <div>
          {result.products.length ? (
            <>
              <ProductGrid products={result.products} priorityCount={4} />
              <Pagination
                currentPage={result.currentPage}
                totalPages={result.totalPages}
                pathname={pathname}
                filters={filters}
              />
            </>
          ) : (
            <EmptyState
              title="No creations match yet"
              description="Try widening the price range, choosing another material, or clearing the active filters."
              action={
                <Link className={styles.resetButton} href={pathname as Route}>
                  Clear filters
                </Link>
              }
            />
          )}
        </div>
      </div>
    </section>
  );
}
