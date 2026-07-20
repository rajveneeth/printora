import { canAccessRole, normaliseRequestedRole, resolvePostAuthPath } from '@/lib/auth/roles';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { createSellerSlugBase, normaliseCredentialEmail } from '@/lib/auth/credentials';
import { hashSessionToken } from '@/lib/auth/session';

describe('authentication security helpers', () => {
  it('hashes passwords and verifies only matching credentials', () => {
    const storedHash = hashPassword('secure-password');
    expect(storedHash).not.toBe('secure-password');
    expect(verifyPassword('secure-password', storedHash)).toBe(true);
    expect(verifyPassword('wrong-password', storedHash)).toBe(false);
  });

  it('enforces exact roles for privileged server-side route checks', () => {
    expect(canAccessRole('CUSTOMER', 'CUSTOMER')).toBe(true);
    expect(canAccessRole('CUSTOMER', 'SELLER')).toBe(false);
    expect(canAccessRole('SELLER', 'CUSTOMER')).toBe(false);
    expect(canAccessRole('SELLER', 'ADMIN')).toBe(false);
    expect(canAccessRole('ADMIN', 'SELLER')).toBe(false);
  });

  it('preserves only safe post-authentication paths allowed for the role', () => {
    expect(resolvePostAuthPath('CUSTOMER', '/checkout?step=address')).toBe(
      '/checkout?step=address',
    );
    expect(resolvePostAuthPath('SELLER', '/seller/products')).toBe('/seller/products');
    expect(resolvePostAuthPath('CUSTOMER', '/admin')).toBe('/account');
    expect(resolvePostAuthPath('ADMIN', '/seller')).toBe('/admin');
    expect(resolvePostAuthPath('CUSTOMER', '//malicious.example')).toBe('/account');
    expect(resolvePostAuthPath('CUSTOMER', 'https://malicious.example')).toBe('/account');
  });

  it('hashes bearer session tokens before database lookup and storage', () => {
    const token = 'a'.repeat(64);
    expect(hashSessionToken(token)).toHaveLength(64);
    expect(hashSessionToken(token)).not.toBe(token);
    expect(hashSessionToken(token)).toBe(hashSessionToken(token));
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
