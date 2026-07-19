import {
  canApproveProduct,
  canManageSellerOrder,
  canViewAdminDashboard,
  canViewOwnOrder,
} from '..';

const admin = { id: 'admin-1', role: 'ADMIN', status: 'ACTIVE' } as const;
const sellerUser = { id: 'seller-user-1', role: 'SELLER', status: 'ACTIVE' } as const;
const seller = {
  id: 'seller-1',
  userId: sellerUser.id,
  verificationStatus: 'APPROVED',
} as const;

describe('role permissions', () => {
  it('restricts administration to active administrators', () => {
    expect(canViewAdminDashboard(admin)).toBe(true);
    expect(canApproveProduct(admin)).toBe(true);
    expect(canViewAdminDashboard(sellerUser)).toBe(false);
    expect(canViewAdminDashboard({ ...admin, status: 'SUSPENDED' })).toBe(false);
  });

  it('enforces buyer ownership for order reads', () => {
    expect(canViewOwnOrder({ id: 'buyer-1', role: 'CUSTOMER', status: 'ACTIVE' }, 'buyer-1')).toBe(
      true,
    );
    expect(canViewOwnOrder({ id: 'buyer-2', role: 'CUSTOMER', status: 'ACTIVE' }, 'buyer-1')).toBe(
      false,
    );
  });

  it('restricts fulfilment updates to the approved owning seller', () => {
    expect(canManageSellerOrder(sellerUser, seller, seller.id)).toBe(true);
    expect(canManageSellerOrder(sellerUser, seller, 'seller-2')).toBe(false);
    expect(
      canManageSellerOrder(sellerUser, { ...seller, verificationStatus: 'SUSPENDED' }, seller.id),
    ).toBe(false);
  });
});
