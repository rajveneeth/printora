import type { Metadata } from 'next';
import {
  CatalogueListing,
  categories,
  catalogueColours,
  catalogueMaterials,
  catalogueSellerLocations,
  listCatalogueProducts,
  parseCatalogueFilters,
} from '@/features/catalogue';
import type { CatalogueSearchParams } from '@/features/catalogue';
import styles from '../StorefrontPage.module.scss';

export const metadata: Metadata = {
  title: 'Shop 3D-printed products',
  description:
    'Browse useful, playful, and customisable 3D-printed creations from independent Indian makers.',
};

export interface ProductsPageProps {
  readonly searchParams: Promise<CatalogueSearchParams>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const filters = parseCatalogueFilters(await searchParams);
  const result = listCatalogueProducts(filters);
  const title = filters.query ? `Results for “${filters.query}”` : 'Explore all creations';

  return (
    <main id="main-content" className={styles.main}>
      <CatalogueListing
        title={title}
        description="Discover practical objects, thoughtful gifts, and unusual designs made layer by layer by independent creators."
        result={result}
        categories={categories}
        materials={catalogueMaterials}
        colours={catalogueColours}
        sellerLocations={catalogueSellerLocations}
        pathname="/products"
      />
    </main>
  );
}
