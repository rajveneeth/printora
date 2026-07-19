import type { MetadataRoute } from 'next';
import { categories, products } from '@/features/catalogue';
import { environment } from '@/lib/validation/env';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = [
    '',
    '/products',
    '/categories',
    ...categories.map((category) => `/categories/${category.slug}`),
    ...products.map((product) => `/products/${product.slug}`),
  ];
  return paths.map((path) => ({
    url: new URL(path || '/', environment.NEXT_PUBLIC_APP_URL).toString(),
    lastModified: now,
    changeFrequency: path.startsWith('/products/') ? 'weekly' : 'daily',
    priority: path === '' ? 1 : path.startsWith('/products/') ? 0.7 : 0.8,
  }));
}
