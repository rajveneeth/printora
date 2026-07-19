import type { UserRole } from '@/models/user.model';
import type { SellerVerificationStatus } from '@/models/seller.model';

export interface PermissionUser {
  readonly id: string;
  readonly role: UserRole;
  readonly status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
}

export interface PermissionSeller {
  readonly id: string;
  readonly userId: string;
  readonly verificationStatus: SellerVerificationStatus;
}

export const canViewAdminDashboard = (user: PermissionUser): boolean =>
  user.role === 'ADMIN' && user.status === 'ACTIVE';

export const canManageCategories = canViewAdminDashboard;

export const canApproveProduct = canViewAdminDashboard;

export const canModerateSeller = canViewAdminDashboard;

export const canModerateReview = canViewAdminDashboard;

export const canViewOwnOrder = (user: PermissionUser, buyerId: string): boolean =>
  user.status === 'ACTIVE' && user.id === buyerId;

export const canManageSellerOrder = (
  user: PermissionUser,
  seller: PermissionSeller,
  orderSellerId: string,
): boolean =>
  user.role === 'SELLER' &&
  user.status === 'ACTIVE' &&
  seller.userId === user.id &&
  seller.id === orderSellerId &&
  seller.verificationStatus === 'APPROVED';

export const canOverrideOrderStatus = canViewAdminDashboard;
