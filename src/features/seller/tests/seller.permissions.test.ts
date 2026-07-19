import {
  canApplyToBecomeSeller,
  canCreateProductDraft,
  canManageOwnProduct,
  canPublishOwnProduct,
  canSubmitProductForReview,
} from '../permissions';
import type { SellerOwnedProduct, SellerPermissionProfile, SellerPermissionUser } from '../models';

const sellerUser: SellerPermissionUser = { id: 'user-1', role: 'SELLER', status: 'ACTIVE' };
const approvedSeller: SellerPermissionProfile = {
  id: 'seller-1',
  userId: 'user-1',
  verificationStatus: 'APPROVED',
};
const draftProduct: SellerOwnedProduct = {
  id: 'product-1',
  sellerId: 'seller-1',
  status: 'DRAFT',
};

describe('seller permissions', () => {
  it('allows an active customer to apply to become a seller', () => {
    expect(canApplyToBecomeSeller({ id: 'buyer-1', role: 'CUSTOMER', status: 'ACTIVE' })).toBe(
      true,
    );
  });

  it('allows a pending seller to prepare private drafts but not submit them', () => {
    const pendingSeller = { ...approvedSeller, verificationStatus: 'PENDING' as const };
    expect(canCreateProductDraft(sellerUser, pendingSeller)).toBe(true);
    expect(canSubmitProductForReview(sellerUser, pendingSeller, draftProduct)).toBe(false);
  });

  it('rejects another seller attempting to manage an owned product', () => {
    const otherUser = { ...sellerUser, id: 'user-2' };
    expect(canManageOwnProduct(otherUser, approvedSeller, draftProduct)).toBe(false);
  });

  it('blocks all product writes for a suspended seller', () => {
    const suspendedSeller = { ...approvedSeller, verificationStatus: 'SUSPENDED' as const };
    expect(canCreateProductDraft(sellerUser, suspendedSeller)).toBe(false);
    expect(canSubmitProductForReview(sellerUser, suspendedSeller, draftProduct)).toBe(false);
  });

  it('allows publication only after product approval', () => {
    expect(canPublishOwnProduct(sellerUser, approvedSeller, draftProduct)).toBe(false);
    expect(
      canPublishOwnProduct(sellerUser, approvedSeller, { ...draftProduct, status: 'APPROVED' }),
    ).toBe(true);
  });
});
