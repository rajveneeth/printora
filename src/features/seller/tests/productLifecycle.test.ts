import { canSellerTransitionProduct, getStatusAfterSellerEdit } from '../services';

describe('seller product lifecycle', () => {
  it('supports draft submission and approved publication', () => {
    expect(canSellerTransitionProduct('DRAFT', 'PENDING_REVIEW')).toBe(true);
    expect(canSellerTransitionProduct('APPROVED', 'PUBLISHED')).toBe(true);
  });

  it('does not allow direct draft publication', () => {
    expect(canSellerTransitionProduct('DRAFT', 'PUBLISHED')).toBe(false);
  });

  it('returns edited approved and published listings to a private draft', () => {
    expect(getStatusAfterSellerEdit('APPROVED')).toBe('DRAFT');
    expect(getStatusAfterSellerEdit('PUBLISHED')).toBe('DRAFT');
  });

  it('locks pending and archived products from editing', () => {
    expect(() => getStatusAfterSellerEdit('PENDING_REVIEW')).toThrow(/cannot be edited/i);
    expect(() => getStatusAfterSellerEdit('ARCHIVED')).toThrow(/cannot be edited/i);
  });
});
