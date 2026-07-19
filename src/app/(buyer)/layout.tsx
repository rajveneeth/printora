import type { ReactNode } from 'react';
import { SiteFooter, SiteHeader } from '@/components/layout';

export default function BuyerLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
