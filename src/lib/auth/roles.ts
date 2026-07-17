import type { UserRole } from '@/models/user.model';

const roleHierarchy = {
  CUSTOMER: 1,
  SELLER: 2,
  ADMIN: 3,
} as const satisfies Record<UserRole, number>;

export const roleLabels = {
  CUSTOMER: 'Buyer',
  SELLER: 'Seller',
  ADMIN: 'Admin',
} as const satisfies Record<UserRole, string>;

export const canAccessRole = (userRole: UserRole, requiredRole: UserRole): boolean => roleHierarchy[userRole] >= roleHierarchy[requiredRole];

export const normaliseRequestedRole = (role: string | null): UserRole => {
  if (role === 'SELLER') {
    return 'SELLER';
  }
  return 'CUSTOMER';
};
