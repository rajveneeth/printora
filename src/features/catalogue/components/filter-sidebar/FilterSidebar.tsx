import type { Route } from 'next';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui';
import styles from './FilterSidebar.module.scss';
import type { FilterSidebarProps } from './FilterSidebar.model';

export function FilterSidebar({
  categories,
  filters,
  materials,
  pathname,
  showCategory = true,
  idPrefix = 'catalogue',
}: FilterSidebarProps) {
  return (
    <form className={styles.root} action={pathname} method="get">
      <div className={styles.heading}>
        <h2>Filters</h2>
        <Link href={pathname as Route}>
          <RotateCcw size={14} /> Reset
        </Link>
      </div>
      {filters.query ? <input type="hidden" name="q" value={filters.query} /> : null}
      {filters.sort !== 'featured' ? (
        <input type="hidden" name="sort" value={filters.sort} />
      ) : null}
      {showCategory ? (
        <fieldset>
          <legend>Category</legend>
          <label htmlFor={`${idPrefix}-category`}>
            <span className="sr-only">Product category</span>
            <select
              id={`${idPrefix}-category`}
              name="category"
              defaultValue={filters.category ?? ''}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </fieldset>
      ) : null}
      <fieldset>
        <legend>Price range</legend>
        <div className={styles.priceRange}>
          <label htmlFor={`${idPrefix}-minimum-price`}>
            <span>Minimum</span>
            <span className={styles.moneyInput}>
              <b>₹</b>
              <input
                id={`${idPrefix}-minimum-price`}
                name="minPrice"
                type="number"
                min="0"
                step="50"
                placeholder="0"
                defaultValue={filters.minPrice}
              />
            </span>
          </label>
          <label htmlFor={`${idPrefix}-maximum-price`}>
            <span>Maximum</span>
            <span className={styles.moneyInput}>
              <b>₹</b>
              <input
                id={`${idPrefix}-maximum-price`}
                name="maxPrice"
                type="number"
                min="0"
                step="50"
                placeholder="5000"
                defaultValue={filters.maxPrice}
              />
            </span>
          </label>
        </div>
      </fieldset>
      <fieldset>
        <legend>Material</legend>
        <label htmlFor={`${idPrefix}-material`}>
          <span className="sr-only">Product material</span>
          <select id={`${idPrefix}-material`} name="material" defaultValue={filters.material ?? ''}>
            <option value="">Any material</option>
            {materials.map((material) => (
              <option key={material} value={material}>
                {material}
              </option>
            ))}
          </select>
        </label>
      </fieldset>
      <fieldset>
        <legend>Minimum rating</legend>
        <div className={styles.radioList}>
          {[4.5, 4, 3].map((rating) => (
            <label key={rating}>
              <input
                type="radio"
                name="rating"
                value={rating}
                defaultChecked={filters.minimumRating === rating}
              />
              <span>★ {rating} & up</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Availability</legend>
        <div className={styles.checkList}>
          <label>
            <input
              type="checkbox"
              name="customisable"
              value="true"
              defaultChecked={filters.customisable}
            />
            <span>Customisable</span>
          </label>
          <label>
            <input type="checkbox" name="inStock" value="true" defaultChecked={filters.inStock} />
            <span>In stock</span>
          </label>
        </div>
      </fieldset>
      <Button type="submit">Show products</Button>
    </form>
  );
}
