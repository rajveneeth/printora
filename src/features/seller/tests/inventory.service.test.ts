import { validateInventoryQuantity } from '../services';

describe('seller inventory validation', () => {
  it('accepts stock equal to reserved quantity', () => {
    expect(() =>
      validateInventoryQuantity({ quantity: 4, reserved: 4, lowStockThreshold: 2 }),
    ).not.toThrow();
  });

  it('rejects stock below reserved quantity', () => {
    expect(() =>
      validateInventoryQuantity({ quantity: 3, reserved: 4, lowStockThreshold: 2 }),
    ).toThrow(/reserved units/i);
  });

  it('rejects fractional and negative inventory values', () => {
    expect(() =>
      validateInventoryQuantity({ quantity: 1.5, reserved: 0, lowStockThreshold: 2 }),
    ).toThrow(/whole number/i);
    expect(() =>
      validateInventoryQuantity({ quantity: 2, reserved: 0, lowStockThreshold: -1 }),
    ).toThrow(/threshold/i);
  });
});
