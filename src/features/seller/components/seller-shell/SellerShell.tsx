import Link from 'next/link';
import { Menu, Shapes } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge, Button } from '@/components/ui';
import { signOutAction } from '@/features/authentication/actions';
import type { SellerVerificationStatus } from '@/models/seller.model';
import { SellerNavigation } from './SellerNavigation';
import styles from './SellerShell.module.scss';

interface SellerShellProps {
  readonly children: ReactNode;
  readonly email: string;
  readonly storeName: string | null;
  readonly verificationStatus: SellerVerificationStatus | null;
  readonly hasSellerAccess: boolean;
}

const getVerificationTone = (
  status: SellerVerificationStatus | null,
): 'success' | 'warning' | 'error' | 'neutral' => {
  if (status === 'APPROVED') return 'success';
  if (status === 'REJECTED' || status === 'SUSPENDED') return 'error';
  if (status === 'PENDING' || status === 'CHANGES_REQUESTED') return 'warning';
  return 'neutral';
};

export function SellerShell({
  children,
  email,
  storeName,
  verificationStatus,
  hasSellerAccess,
}: SellerShellProps) {
  const navigation = <SellerNavigation hasSellerProfile={hasSellerAccess} />;
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark} aria-hidden="true">
            <Shapes size={20} />
          </span>
          <span>Formivo</span>
        </Link>
        <p className={styles.workspaceLabel}>Seller workspace</p>
        {navigation}
        <div className={styles.sidebarFooter}>
          <p>{storeName ?? 'Seller application'}</p>
          <span>{email}</span>
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </aside>
      <div className={styles.mainColumn}>
        <header className={styles.topbar}>
          <details className={styles.mobileMenu}>
            <summary aria-label="Open seller navigation">
              <Menu aria-hidden="true" size={20} />
              Menu
            </summary>
            <div className={styles.mobilePanel}>{navigation}</div>
          </details>
          <div>
            <p>{storeName ?? 'Become a Formivo seller'}</p>
            <span>{email}</span>
          </div>
          <Badge tone={getVerificationTone(verificationStatus)}>
            {verificationStatus?.replaceAll('_', ' ') ?? 'Not applied'}
          </Badge>
        </header>
        <main className={styles.content} id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
