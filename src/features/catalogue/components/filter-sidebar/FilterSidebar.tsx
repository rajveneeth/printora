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
  colours = [],
  sellerLocations = [],
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
      {colours.length ? (
        <fieldset>
          <legend>Colour</legend>
          <label htmlFor={`${idPrefix}-colour`}>
            <span className="sr-only">Product colour</span>
            <select id={`${idPrefix}-colour`} name="colour" defaultValue={filters.colour ?? ''}>
              <option value="">Any colour</option>
              {colours.map((colour) => (
                <option key={colour} value={colour}>
                  {colour}
                </option>
              ))}
            </select>
          </label>
        </fieldset>
      ) : null}
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
      {sellerLocations.length ? (
        <fieldset>
          <legend>Seller location</legend>
          <label htmlFor={`${idPrefix}-location`}>
            <span className="sr-only">Seller location</span>
            <select
              id={`${idPrefix}-location`}
              name="location"
              defaultValue={filters.sellerLocation ?? ''}
            >
              <option value="">Anywhere in India</option>
              {sellerLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </label>
        </fieldset>
      ) : null}
      <fieldset>
        <legend>Timing</legend>
        <div className={styles.timingFields}>
          <label htmlFor={`${idPrefix}-processing-days`}>
            <span>Processing time</span>
            <select
              id={`${idPrefix}-processing-days`}
              name="processingDays"
              defaultValue={filters.maximumProcessingDays ?? ''}
            >
              <option value="">Any dispatch time</option>
              {[2, 3, 5, 7].map((days) => (
                <option key={days} value={days}>
                  Up to {days} days
                </option>
              ))}
            </select>
          </label>
          <label htmlFor={`${idPrefix}-delivery-days`}>
            <span>Delivery estimate</span>
            <select
              id={`${idPrefix}-delivery-days`}
              name="deliveryDays"
              defaultValue={filters.maximumDeliveryDays ?? ''}
            >
              <option value="">Any delivery time</option>
              {[5, 7, 10, 14].map((days) => (
                <option key={days} value={days}>
                  Within {days} days
                </option>
              ))}
            </select>
          </label>
        </div>
      </fieldset>
      <Button type="submit">Show products</Button>
    </form>
  );
}
