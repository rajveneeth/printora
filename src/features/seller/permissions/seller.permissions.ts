import type { SellerOwnedProduct, SellerPermissionProfile, SellerPermissionUser } from '../models';

const isActiveSeller = (user: SellerPermissionUser): boolean =>
  user.status === 'ACTIVE' && user.role === 'SELLER';

export const canApplyToBecomeSeller = (user: SellerPermissionUser): boolean =>
  user.status === 'ACTIVE' && (user.role === 'CUSTOMER' || user.role === 'SELLER');

export const canViewSellerDashboard = (user: SellerPermissionUser): boolean => isActiveSeller(user);

export const canManageSellerProfile = (
  user: SellerPermissionUser,
  seller: SellerPermissionProfile,
): boolean => isActiveSeller(user) && seller.userId === user.id;

export const canCreateProductDraft = (
  user: SellerPermissionUser,
  seller: SellerPermissionProfile,
): boolean =>
  canManageSellerProfile(user, seller) &&
  seller.verificationStatus !== 'SUSPENDED' &&
  seller.verificationStatus !== 'REJECTED';

export const canManageOwnProduct = (
  user: SellerPermissionUser,
  seller: SellerPermissionProfile,
  product: SellerOwnedProduct,
): boolean => canCreateProductDraft(user, seller) && product.sellerId === seller.id;

export const canSubmitProductForReview = (
  user: SellerPermissionUser,
  seller: SellerPermissionProfile,
  product: SellerOwnedProduct,
): boolean =>
  canManageOwnProduct(user, seller, product) && seller.verificationStatus === 'APPROVED';

export const canPublishOwnProduct = (
  user: SellerPermissionUser,
  seller: SellerPermissionProfile,
  product: SellerOwnedProduct,
): boolean =>
  canSubmitProductForReview(user, seller, product) &&
  (product.status === 'APPROVED' || product.status === 'PAUSED');
