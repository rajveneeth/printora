import type { ReactNode } from 'react';
import { SellerShell } from '@/features/seller/components';
import { getSellerRouteContext } from '@/features/seller/services';
import { canViewSellerDashboard } from '@/features/seller/permissions';

export const metadata = { title: 'Seller workspace', robots: { index: false, follow: false } };

export default async function SellerLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { session, workspace } = await getSellerRouteContext();
  return (
    <SellerShell
      email={session.user.email}
      hasSellerAccess={
        canViewSellerDashboard(session.user) && Boolean(workspace.seller && workspace.application)
      }
      storeName={workspace.seller?.storeName ?? null}
      verificationStatus={
        workspace.seller?.verificationStatus ?? workspace.application?.status ?? null
      }
    >
      {children}
    </SellerShell>
  );
}
