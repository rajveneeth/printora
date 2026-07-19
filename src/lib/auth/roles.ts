import type { UserRole } from '@/models/user.model';

export const roleLabels = {
  CUSTOMER: 'Buyer',
  SELLER: 'Seller',
  ADMIN: 'Admin',
} as const satisfies Record<UserRole, string>;

export const canAccessRole = (userRole: UserRole, requiredRole: UserRole): boolean =>
  userRole === requiredRole;

export const defaultAuthenticatedPath = (role: UserRole): string => {
  if (role === 'ADMIN') return '/admin';
  if (role === 'SELLER') return '/seller';
  return '/account';
};

export const isSafeReturnPath = (value: string): boolean =>
  value.startsWith('/') && !value.startsWith('//') && !value.includes('\\');

export const resolvePostAuthPath = (role: UserRole, requestedPath: string): string => {
  if (!isSafeReturnPath(requestedPath)) return defaultAuthenticatedPath(role);
  const pathname = requestedPath.split(/[?#]/, 1)[0] ?? '';
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return role === 'ADMIN' ? requestedPath : defaultAuthenticatedPath(role);
  }
  if (pathname === '/seller' || pathname.startsWith('/seller/')) {
    return role === 'SELLER' ? requestedPath : defaultAuthenticatedPath(role);
  }
  if (
    pathname === '/account' ||
    pathname.startsWith('/account/') ||
    pathname === '/checkout' ||
    pathname.startsWith('/checkout/')
  ) {
    return requestedPath;
  }
  return defaultAuthenticatedPath(role);
};

export const normaliseRequestedRole = (role: string | null): UserRole => {
  if (role === 'SELLER') {
    return 'SELLER';
  }
  return 'CUSTOMER';
};
