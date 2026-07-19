'use client';

import { useState } from 'react';
import { SearchAutocomplete } from '@/features/search/components/search-autocomplete';
import type { GuidedSearchProps } from './GuidedSearch.model';
import styles from './GuidedSearch.module.scss';

export function GuidedSearch({
  categories,
  initialQuery = '',
  initialCategory = '',
}: GuidedSearchProps) {
  const [category, setCategory] = useState(initialCategory);

  return (
    <section className={styles.root} aria-labelledby="guided-search-title">
      <div>
        <p>Search made by makers</p>
        <h1 id="guided-search-title">Find the right print for the job.</h1>
        <span>
          Search products, uses, categories, materials, makers, and locations. Results come from the
          published marketplace catalogue.
        </span>
      </div>
      <div className={styles.controls}>
        <label htmlFor="guided-search-category">
          <span>Search within</span>
          <select
            id="guided-search-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((categoryOption) => (
              <option key={categoryOption.id} value={categoryOption.slug}>
                {categoryOption.name}
              </option>
            ))}
          </select>
        </label>
        <SearchAutocomplete
          id="guided-marketplace-search"
          initialQuery={initialQuery}
          {...(category ? { category } : {})}
          placeholder="Try “phone stand” or “desk organiser”"
        />
      </div>
      <p className={styles.hint}>
        Use ↑ and ↓ to review suggestions, Enter to choose, and Esc to close.
      </p>
    </section>
  );
}
