import type { MetadataRoute } from 'next';
import { environment } from '@/lib/validation/env';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/account/', '/admin/', '/seller/', '/checkout/'] },
    ],
    sitemap: new URL('/sitemap.xml', environment.NEXT_PUBLIC_APP_URL).toString(),
    host: environment.NEXT_PUBLIC_APP_URL,
  };
}
