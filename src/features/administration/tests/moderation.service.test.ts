import { getProductModerationStatus, getSellerModerationStatus } from '../services';

describe('administration moderation transitions', () => {
  it('supports product approval while rejecting invalid repeated decisions', () => {
    expect(getProductModerationStatus('PENDING_REVIEW', 'APPROVE')).toBe('APPROVED');
    expect(getProductModerationStatus('PENDING_REVIEW', 'APPROVE_AND_PUBLISH')).toBe('PUBLISHED');
    expect(() => getProductModerationStatus('PUBLISHED', 'REJECT')).toThrow(/not in a state/i);
  });

  it('supports seller approval and explicit suspension boundaries', () => {
    expect(getSellerModerationStatus('PENDING', 'APPROVE')).toBe('APPROVED');
    expect(getSellerModerationStatus('APPROVED', 'SUSPEND')).toBe('SUSPENDED');
    expect(() => getSellerModerationStatus('PENDING', 'SUSPEND')).toThrow(/not in a state/i);
  });
});
