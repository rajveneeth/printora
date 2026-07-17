import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  CatalogueListing,
  categories,
  catalogueMaterials,
  findCategoryBySlug,
  listCatalogueProducts,
  parseCatalogueFilters,
} from '@/features/catalogue';
import type { CatalogueSearchParams } from '@/features/catalogue';
import styles from '../../StorefrontPage.module.scss';

export interface CategoryPageProps {
  readonly params: Promise<{ slug: string }>;
  readonly searchParams: Promise<CatalogueSearchParams>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = findCategoryBySlug((await params).slug);
  if (!category) return { title: 'Category not found' };
  return { title: category.name, description: category.description };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = findCategoryBySlug((await params).slug);
  if (!category) notFound();
  const parsedFilters = parseCatalogueFilters(await searchParams);
  const result = listCatalogueProducts({ ...parsedFilters, category: category.slug });

  return (
    <main id="main-content" className={styles.main}>
      <CatalogueListing
        title={category.name}
        description={category.description}
        result={result}
        categories={categories}
        materials={catalogueMaterials}
        pathname={`/categories/${category.slug}`}
        showCategory={false}
      />
    </main>
  );
}
