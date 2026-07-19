import Link from 'next/link';
import { Menu, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui';
import { signOutAction } from '@/features/authentication/actions';
import { AdminNavigation } from './AdminNavigation';
import styles from './AdminShell.module.scss';

interface AdminShellProps {
  readonly children: ReactNode;
  readonly email: string;
}

export function AdminShell({ children, email }: AdminShellProps) {
  const navigation = <AdminNavigation />;
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark}>
            <ShieldCheck aria-hidden="true" size={20} />
          </span>
          <span>Formivo</span>
        </Link>
        <p className={styles.workspaceLabel}>Administration</p>
        {navigation}
        <div className={styles.sidebarFooter}>
          <strong>Marketplace admin</strong>
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
            <summary aria-label="Open administration navigation">
              <Menu aria-hidden="true" size={20} /> Menu
            </summary>
            <div className={styles.mobilePanel}>{navigation}</div>
          </details>
          <div>
            <strong>Marketplace operations</strong>
            <span>{email}</span>
          </div>
          <span className={styles.secureLabel}>
            <ShieldCheck aria-hidden="true" size={16} /> Protected
          </span>
        </header>
        <main className={styles.content} id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
