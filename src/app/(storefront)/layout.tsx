import type { ReactNode } from 'react';
import { SiteFooter, SiteHeader } from '@/components/layout';

export default function StorefrontLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
