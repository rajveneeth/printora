import { canAccessRole, normaliseRequestedRole } from '@/lib/auth/roles';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { createSellerSlugBase, normaliseCredentialEmail } from '@/lib/auth/credentials';

describe('authentication security helpers', () => {
  it('hashes passwords and verifies only matching credentials', () => {
    const storedHash = hashPassword('secure-password');
    expect(storedHash).not.toBe('secure-password');
    expect(verifyPassword('secure-password', storedHash)).toBe(true);
    expect(verifyPassword('wrong-password', storedHash)).toBe(false);
  });

  it('enforces role hierarchy for server-side route checks', () => {
    expect(canAccessRole('CUSTOMER', 'CUSTOMER')).toBe(true);
    expect(canAccessRole('CUSTOMER', 'SELLER')).toBe(false);
    expect(canAccessRole('SELLER', 'CUSTOMER')).toBe(true);
    expect(canAccessRole('SELLER', 'ADMIN')).toBe(false);
    expect(canAccessRole('ADMIN', 'SELLER')).toBe(true);
  });

  it('limits public sign-up role requests to buyer or seller', () => {
    expect(normaliseRequestedRole('SELLER')).toBe('SELLER');
    expect(normaliseRequestedRole('ADMIN')).toBe('CUSTOMER');
  });

  it('normalises credential email addresses before persistence and lookup', () => {
    expect(normaliseCredentialEmail(' Alice@Example.COM ')).toBe('alice@example.com');
  });

  it('creates stable seller slug bases with a safe fallback', () => {
    expect(createSellerSlugBase('Jane Smith')).toBe('jane-smith');
    expect(createSellerSlugBase('Crème Studio')).toBe('creme-studio');
    expect(createSellerSlugBase('店')).toBe('seller');
  });
});
