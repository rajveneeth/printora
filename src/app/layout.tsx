import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Geist, Geist_Mono, Manrope } from 'next/font/google';
import '@/styles/tailwind.css';
import '@/styles/globals.scss';
import { siteConfig } from '@/config/site';
import { CartHydrator } from '@/features/cart';
import { environment } from '@/lib/validation/env';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-heading' });
const geist = Geist({ subsets: ['latin'], variable: '--font-body' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  metadataBase: new URL(environment.NEXT_PUBLIC_APP_URL),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [{ url: '/catalogue/hero-studio.svg', alt: siteConfig.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: ['/catalogue/hero-studio.svg'],
  },
  robots: { index: true, follow: true },
  category: 'shopping',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} ${geist.variable} ${geistMono.variable}`}>
      <body>
        <CartHydrator />
        {children}
      </body>
    </html>
  );
}
