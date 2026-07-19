import type { Metadata } from 'next';
import type { Route } from 'next';
import Link from 'next/link';
import { ArrowRight, Compass, Lightbulb, Smartphone } from 'lucide-react';
import { ErrorState } from '@/components/ui';
import {
  CatalogueListing,
  categories,
  catalogueColours,
  catalogueMaterials,
  catalogueSellerLocations,
} from '@/features/catalogue';
import type { CatalogueSearchParams } from '@/features/catalogue';
import { GuidedSearch, parseSearchFilters, searchProducts } from '@/features/search';
import storefrontStyles from '../StorefrontPage.module.scss';
import styles from './SearchPage.module.scss';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Search 3D-printed products',
  description:
    'Search published 3D-printed products by keyword, category, material, maker, and location.',
};

export interface SearchPageProps {
  readonly searchParams: Promise<CatalogueSearchParams>;
}

const discoveryLinks = [
  {
    icon: Smartphone,
    title: 'Find a phone stand',
    description: 'Compare minimal, adjustable, and travel-friendly stands.',
    href: '/search?q=phone+stand&category=phone-electronics-accessories',
  },
  {
    icon: Compass,
    title: 'Browse useful desk pieces',
    description: 'Start with organisers, cable tools, and workspace stands.',
    href: '/search?category=desk-workspace&sort=popular',
  },
  {
    icon: Lightbulb,
    title: 'Explore customisable work',
    description: 'Find published designs that makers can adapt for you.',
    href: '/search?customisable=true&sort=popular',
  },
] as const;

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const filters = parseSearchFilters(await searchParams);
  const guidedSearchProps = {
    categories,
    ...(filters.query ? { initialQuery: filters.query } : {}),
    ...(filters.category ? { initialCategory: filters.category } : {}),
  };

  try {
    const result = await searchProducts(filters);
    const title = filters.query ? `Results for “${filters.query}”` : 'Explore the marketplace';
    const description = filters.query
      ? 'Matches use published product details, categories, maker profiles, tags, and search keywords.'
      : 'Use the category and delivery filters to narrow the published marketplace catalogue.';

    return (
      <main id="main-content" className={storefrontStyles.main}>
        <GuidedSearch {...guidedSearchProps} />
        {!filters.query && !filters.category ? (
          <section className={styles.discovery} aria-labelledby="guided-discovery-title">
            <div>
              <p>Not sure where to start?</p>
              <h2 id="guided-discovery-title">Try a guided path</h2>
            </div>
            <div className={styles.discoveryGrid}>
              {discoveryLinks.map(({ icon: Icon, title: linkTitle, description: detail, href }) => (
                <Link key={linkTitle} href={href as Route}>
                  <span>
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <strong>{linkTitle}</strong>
                  <small>{detail}</small>
                  <b>
                    Explore <ArrowRight size={14} aria-hidden="true" />
                  </b>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
        <CatalogueListing
          title={title}
          description={description}
          result={result}
          categories={categories}
          materials={catalogueMaterials}
          colours={catalogueColours}
          sellerLocations={catalogueSellerLocations}
          pathname="/search"
        />
      </main>
    );
  } catch {
    return (
      <main id="main-content" className={storefrontStyles.main}>
        <GuidedSearch {...guidedSearchProps} />
        <ErrorState
          title="Search is taking a pause"
          description="The product catalogue could not be reached. Check the local database connection and try again."
          action={
            <Link className={styles.retryLink} href={'/search' as Route}>
              Try search again
            </Link>
          }
        />
      </main>
    );
  }
}
