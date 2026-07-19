import { addressSchema } from '../schemas';

const validAddress = {
  kind: 'SHIPPING',
  fullName: 'Aarav Buyer',
  phone: '+91 90000 00001',
  line1: '42 Maker Street',
  line2: '',
  city: 'Bengaluru',
  state: 'Karnataka',
  postalCode: '560001',
  country: 'India',
  isDefault: true,
} as const;

describe('address schema', () => {
  it('accepts a complete Indian delivery address', () => {
    expect(addressSchema.parse(validAddress)).toEqual(validAddress);
  });

  it('rejects malformed PIN codes and phone numbers', () => {
    const result = addressSchema.safeParse({ ...validAddress, postalCode: '00012', phone: '12' });
    expect(result.success).toBe(false);
  });
});
