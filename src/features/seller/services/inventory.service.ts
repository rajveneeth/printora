export interface InventoryQuantityInput {
  readonly quantity: number;
  readonly reserved: number;
  readonly lowStockThreshold: number;
}

export const validateInventoryQuantity = (inventory: InventoryQuantityInput): void => {
  if (!Number.isInteger(inventory.quantity) || inventory.quantity < 0) {
    throw new Error('Inventory quantity must be a non-negative whole number.');
  }
  if (inventory.quantity < inventory.reserved) {
    throw new Error(`Quantity cannot be lower than ${inventory.reserved} reserved units.`);
  }
  if (!Number.isInteger(inventory.lowStockThreshold) || inventory.lowStockThreshold < 0) {
    throw new Error('Low-stock threshold must be a non-negative whole number.');
  }
};
