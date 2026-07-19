import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AdminShell } from '@/features/administration/components';
import { canViewAdminDashboard } from '@/features/permissions';
import { requireSession } from '@/lib/auth';
import { adminEnvironment } from '@/lib/validation/environment';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: { default: 'Administration', template: '%s | Formivo administration' },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  const session = await requireSession();
  if (!adminEnvironment.ADMIN_DASHBOARD_ENABLED || !canViewAdminDashboard(session.user)) {
    redirect('/unauthorised');
  }
  return <AdminShell email={session.user.email}>{children}</AdminShell>;
}
